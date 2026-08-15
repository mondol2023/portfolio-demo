import path from "node:path";
import { readJsonArray, updateJsonArray, writeJsonArray } from "./json-store";

/**
 * Generic CRUD over a JSON-array-backed file under `server/.data/`, keyed by
 * `id`. Mirrors `SheetsTable`'s method surface exactly so a repo's Json/Sheets
 * adapter pair share one call site and swapping (`useSheetsAdapter`) is
 * config, not code — the local dev/testing fallback described in the plan.
 *
 * `append`/`update`/`remove` each go through `updateJsonArray`, which reads
 * and writes under a single lock acquisition per file — required so that
 * concurrent requests against the same entity (e.g. a reorder's N per-row
 * patches) don't interleave into a lost update or a corrupted file. See
 * `json-store.ts` for the locking + atomic-rename details.
 */
export class JsonTable<T extends { id: string }> {
  private readonly filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), ".data", fileName);
  }

  async getAll(): Promise<T[]> {
    return readJsonArray<T>(this.filePath);
  }

  async getById(id: string): Promise<T | undefined> {
    return (await this.getAll()).find((record) => record.id === id);
  }

  async append(record: T): Promise<T> {
    await updateJsonArray<T>(this.filePath, (all) => [...all, record]);
    return record;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    let merged: T | undefined;
    await updateJsonArray<T>(this.filePath, (all) => {
      const idx = all.findIndex((record) => record.id === id);
      const current = idx === -1 ? undefined : all[idx];
      if (idx === -1 || !current) return all;
      merged = { ...current, ...patch };
      const next = [...all];
      next[idx] = merged;
      return next;
    });
    return merged;
  }

  async remove(id: string): Promise<boolean> {
    let removed = false;
    await updateJsonArray<T>(this.filePath, (all) => {
      const next = all.filter((record) => record.id !== id);
      removed = next.length !== all.length;
      return next;
    });
    return removed;
  }

  /** Wipes and rewrites every record — used by the seed script and by admin reorder. */
  async replaceAll(records: T[]): Promise<void> {
    await writeJsonArray(this.filePath, records);
  }
}
