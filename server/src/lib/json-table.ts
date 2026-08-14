import path from "node:path";
import { readJsonArray, writeJsonArray } from "./json-store";

/**
 * Generic CRUD over a JSON-array-backed file under `server/.data/`, keyed by
 * `id`. Mirrors `SheetsTable`'s method surface exactly so a repo's Json/Sheets
 * adapter pair share one call site and swapping (`useSheetsAdapter`) is
 * config, not code — the local dev/testing fallback described in the plan.
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
    const all = await this.getAll();
    all.push(record);
    await writeJsonArray(this.filePath, all);
    return record;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const all = await this.getAll();
    const idx = all.findIndex((record) => record.id === id);
    if (idx === -1) return undefined;
    const current = all[idx];
    if (!current) return undefined;
    const merged = { ...current, ...patch };
    all[idx] = merged;
    await writeJsonArray(this.filePath, all);
    return merged;
  }

  async remove(id: string): Promise<boolean> {
    const all = await this.getAll();
    const next = all.filter((record) => record.id !== id);
    if (next.length === all.length) return false;
    await writeJsonArray(this.filePath, next);
    return true;
  }

  /** Wipes and rewrites every record — used only by the one-time seed script. */
  async replaceAll(records: T[]): Promise<void> {
    await writeJsonArray(this.filePath, records);
  }
}
