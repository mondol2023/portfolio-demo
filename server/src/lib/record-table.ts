/**
 * Common method surface shared by `JsonTable<T>` and `SheetsTable<T>`. Lets a
 * repo depend on "some id-keyed CRUD table" without caring which storage
 * backend it is — the `useSheetsAdapter` switch just picks which concrete
 * table gets injected at module load.
 */
export interface RecordTable<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  append(record: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | undefined>;
  remove(id: string): Promise<boolean>;
  replaceAll(records: T[]): Promise<void>;
}
