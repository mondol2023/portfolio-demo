import type { RecordTable } from "./record-table";

/**
 * Thin id-keyed CRUD base every entity repo extends, backed by whichever
 * `RecordTable` (Json or Sheets) was injected at construction. Entity repos
 * add their own finders (`getBySlug`, `findByEmail`, ...) and timestamped
 * `create`/`update` wrappers on top — this only covers the mechanical part.
 */
export class BaseCrudRepo<T extends { id: string }> {
  constructor(protected readonly table: RecordTable<T>) {}

  getAll(): Promise<T[]> {
    return this.table.getAll();
  }

  getById(id: string): Promise<T | undefined> {
    return this.table.getById(id);
  }

  protected append(record: T): Promise<T> {
    return this.table.append(record);
  }

  protected patch(id: string, patch: Partial<T>): Promise<T | undefined> {
    return this.table.update(id, patch);
  }

  remove(id: string): Promise<boolean> {
    return this.table.remove(id);
  }

  replaceAll(records: T[]): Promise<void> {
    return this.table.replaceAll(records);
  }
}
