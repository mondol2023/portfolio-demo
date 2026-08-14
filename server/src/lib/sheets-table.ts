import { getSheetsClient, SPREADSHEET_ID } from "./google-sheets";

type CellValue = string | number | boolean;

function columnLetter(n: number): string {
  let s = "";
  let remaining = n;
  while (remaining > 0) {
    const rem = (remaining - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    remaining = Math.floor((remaining - 1) / 26);
  }
  return s;
}

export interface SheetsTableOptions<T> {
  /** Tab name — must already exist in the spreadsheet (see README setup steps). */
  sheetName: string;
  /** Column headers, in order — written to row 1 the first time the tab is touched. */
  headers: string[];
  toRow: (record: T) => CellValue[];
  fromRow: (row: string[]) => T;
  getId: (record: T) => string;
}

/**
 * Generic CRUD engine over a single spreadsheet tab: row 1 = headers, every
 * row after is one record. Each entity keeps its own explicit `toRow`/
 * `fromRow` mapping (rather than a generic auto-typed JSON-per-cell scheme)
 * so the sheet stays human-readable/editable directly in Google Sheets —
 * the plan calls this out as a real feature, not just a fallback data store.
 *
 * Mirrors `JsonTable`'s method surface 1:1 so a repo's two adapters share one
 * call site and swapping between them (`useSheetsAdapter`) is config, not code.
 */
export class SheetsTable<T> {
  private sheetIdCache: number | null = null;
  private headerEnsured = false;

  constructor(private readonly opts: SheetsTableOptions<T>) {}

  private get lastColumn(): string {
    return columnLetter(this.opts.headers.length);
  }

  private get dataRange(): string {
    return `${this.opts.sheetName}!A2:${this.lastColumn}`;
  }

  private padRow(row: string[]): string[] {
    const padded = [...row];
    while (padded.length < this.opts.headers.length) padded.push("");
    return padded;
  }

  private async ensureHeader(): Promise<void> {
    if (this.headerEnsured) return;
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${this.opts.sheetName}!A1:1`,
    });
    const firstRow = res.data.values?.[0];
    if (!firstRow || firstRow.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${this.opts.sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [this.opts.headers] },
      });
    }
    this.headerEnsured = true;
  }

  async getAll(): Promise<T[]> {
    await this.ensureHeader();
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: this.dataRange,
    });
    const rows = res.data.values ?? [];
    return rows
      .filter((row) => row.some((cell) => cell !== "" && cell !== undefined && cell !== null))
      .map((row) => this.opts.fromRow(this.padRow(row as string[])));
  }

  async getById(id: string): Promise<T | undefined> {
    return (await this.getAll()).find((record) => this.opts.getId(record) === id);
  }

  async append(record: T): Promise<T> {
    await this.ensureHeader();
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: this.dataRange,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [this.opts.toRow(record)] },
    });
    return record;
  }

  /** 1-based sheet row number (2 = first data row) for a given id, or -1 if not found. */
  private async findRowNumber(id: string): Promise<number> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: this.dataRange,
    });
    const rows = res.data.values ?? [];
    const idx = rows.findIndex(
      (row) => this.opts.getId(this.opts.fromRow(this.padRow(row as string[]))) === id
    );
    return idx === -1 ? -1 : idx + 2;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const existing = await this.getById(id);
    if (!existing) return undefined;
    const merged = { ...existing, ...patch } as T;
    const rowNumber = await this.findRowNumber(id);
    if (rowNumber === -1) return undefined;
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${this.opts.sheetName}!A${rowNumber}:${this.lastColumn}${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [this.opts.toRow(merged)] },
    });
    return merged;
  }

  private async getSheetGid(): Promise<number> {
    if (this.sheetIdCache !== null) return this.sheetIdCache;
    const sheets = getSheetsClient();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets?.find((s) => s.properties?.title === this.opts.sheetName);
    const sheetId = sheet?.properties?.sheetId;
    if (sheetId === undefined || sheetId === null) {
      throw new Error(
        `Sheet tab "${this.opts.sheetName}" not found in spreadsheet ${SPREADSHEET_ID}. Create it first (see README).`
      );
    }
    this.sheetIdCache = sheetId;
    return sheetId;
  }

  async remove(id: string): Promise<boolean> {
    const rowNumber = await this.findRowNumber(id);
    if (rowNumber === -1) return false;
    const sheets = getSheetsClient();
    const sheetId = await this.getSheetGid();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: { sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber },
            },
          },
        ],
      },
    });
    return true;
  }

  /** Wipes and rewrites every data row — used only by the one-time seed script. */
  async replaceAll(records: T[]): Promise<void> {
    await this.ensureHeader();
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: this.dataRange });
    if (records.length === 0) return;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: this.dataRange,
      valueInputOption: "RAW",
      requestBody: { values: records.map((r) => this.opts.toRow(r)) },
    });
  }
}
