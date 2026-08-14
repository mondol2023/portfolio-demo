import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Minimal JSON-file persistence — the `JsonFileAdapter` fallback described in
 * the plan, used wherever `useSheetsAdapter` is false. Deliberately tiny
 * (read-whole-array / append-and-rewrite) since it only ever backs local
 * dev/testing traffic; Phase 8 builds the equivalent `SheetsAdapter` pair for
 * every repo behind the same interfaces.
 */
export async function readJsonArray<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

export async function writeJsonArray<T>(filePath: string, records: T[]): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(records, null, 2), "utf-8");
}

export async function appendJsonArray<T>(filePath: string, record: T): Promise<void> {
  const existing = await readJsonArray<T>(filePath);
  existing.push(record);
  await writeJsonArray(filePath, existing);
}
