import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Minimal JSON-file persistence — the `JsonFileAdapter` fallback described in
 * the plan, used wherever `useSheetsAdapter` is false. Deliberately tiny
 * (read-whole-array / append-and-rewrite) since it only ever backs local
 * dev/testing traffic; Phase 8 builds the equivalent `SheetsAdapter` pair for
 * every repo behind the same interfaces.
 *
 * `fs.writeFile` is not atomic against a concurrent writer of the same path —
 * two overlapping read-modify-write cycles (e.g. a reorder that used to fire
 * N concurrent `update()` calls) can interleave mid-file and leave truncated,
 * unparseable JSON behind, or silently lose one side's update. Every access
 * to a given path is queued through `withFileLock` below so reads/writes to
 * that file never overlap in-process.
 */
const fileLocks = new Map<string, Promise<unknown>>();

/** Runs `task` only after every previously queued task for `filePath` has settled. */
function withFileLock<T>(filePath: string, task: () => Promise<T>): Promise<T> {
  const previous = fileLocks.get(filePath) ?? Promise.resolve();
  const run = previous.catch(() => undefined).then(task);
  // Store a settled-tracking promise (not `run` itself) so a rejection here doesn't
  // poison the chain for the next queued caller.
  fileLocks.set(
    filePath,
    run.catch(() => undefined)
  );
  return run;
}

async function readJsonArrayUnlocked<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function writeJsonArrayUnlocked<T>(filePath: string, records: T[]): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  // Write to a temp file then rename — `rename` is atomic on the same volume, so a
  // reader never observes a partially-written file even if something outside this
  // process's lock queue reads concurrently.
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(records, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath);
}

export function readJsonArray<T>(filePath: string): Promise<T[]> {
  return withFileLock(filePath, () => readJsonArrayUnlocked<T>(filePath));
}

export function writeJsonArray<T>(filePath: string, records: T[]): Promise<void> {
  return withFileLock(filePath, () => writeJsonArrayUnlocked(filePath, records));
}

/** Read-modify-write under a single lock acquisition, so callers get a true atomic update. */
export function updateJsonArray<T>(
  filePath: string,
  mutate: (records: T[]) => T[]
): Promise<T[]> {
  return withFileLock(filePath, async () => {
    const current = await readJsonArrayUnlocked<T>(filePath);
    const next = mutate(current);
    await writeJsonArrayUnlocked(filePath, next);
    return next;
  });
}
