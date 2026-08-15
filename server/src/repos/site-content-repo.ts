import path from "node:path";
import type { SiteContentEntry, SiteContentMap } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { readJsonArray, updateJsonArray, writeJsonArray } from "../lib/json-store";
import { getSheetsClient, SPREADSHEET_ID } from "../lib/google-sheets";

/**
 * Key/value settings store — a different shape from every other entity (no
 * `id`, keyed by `key` instead), so it doesn't fit `BaseCrudRepo`/`RecordTable`
 * and gets its own small pair of adapters instead.
 */
export interface SiteContentRepo {
  getAll(): Promise<SiteContentEntry[]>;
  getByKey(key: string): Promise<SiteContentEntry | undefined>;
  getMap(): Promise<SiteContentMap>;
  /** Full replace of one entry — callers that only want to change some fields must merge first (see the admin route). */
  upsert(entry: SiteContentEntry): Promise<SiteContentEntry>;
  replaceAll(entries: SiteContentEntry[]): Promise<void>;
}

const HEADERS = ["key", "value", "label", "group"] as const;
const SHEET_NAME = "SiteContent";

class JsonSiteContentRepo implements SiteContentRepo {
  private filePath = path.join(process.cwd(), ".data", "site-content.json");

  getAll(): Promise<SiteContentEntry[]> {
    return readJsonArray<SiteContentEntry>(this.filePath);
  }

  async getByKey(key: string): Promise<SiteContentEntry | undefined> {
    return (await this.getAll()).find((e) => e.key === key);
  }

  async getMap(): Promise<SiteContentMap> {
    const entries = await this.getAll();
    return Object.fromEntries(entries.map((e) => [e.key, e.value]));
  }

  async upsert(entry: SiteContentEntry): Promise<SiteContentEntry> {
    // Single locked read-modify-write — see json-store.ts for why unlocked
    // read-then-write races under concurrent requests.
    await updateJsonArray<SiteContentEntry>(this.filePath, (all) => {
      const idx = all.findIndex((e) => e.key === entry.key);
      if (idx === -1) return [...all, entry];
      const next = [...all];
      next[idx] = entry;
      return next;
    });
    return entry;
  }

  async replaceAll(entries: SiteContentEntry[]): Promise<void> {
    await writeJsonArray(this.filePath, entries);
  }
}

class SheetsSiteContentRepo implements SiteContentRepo {
  private headerEnsured = false;

  private async ensureHeader(): Promise<void> {
    if (this.headerEnsured) return;
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:1`,
    });
    if (!res.data.values?.[0]?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [[...HEADERS]] },
      });
    }
    this.headerEnsured = true;
  }

  async getAll(): Promise<SiteContentEntry[]> {
    await this.ensureHeader();
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:D`,
    });
    const rows = res.data.values ?? [];
    return rows
      .filter((row) => row[0])
      .map((row) => ({ key: row[0] ?? "", value: row[1] ?? "", label: row[2] ?? "", group: row[3] || "general" }));
  }

  async getByKey(key: string): Promise<SiteContentEntry | undefined> {
    return (await this.getAll()).find((e) => e.key === key);
  }

  async getMap(): Promise<SiteContentMap> {
    const entries = await this.getAll();
    return Object.fromEntries(entries.map((e) => [e.key, e.value]));
  }

  async upsert(entry: SiteContentEntry): Promise<SiteContentEntry> {
    await this.ensureHeader();
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:D`,
    });
    const rows = res.data.values ?? [];
    const idx = rows.findIndex((row) => row[0] === entry.key);
    const rowValues = [entry.key, entry.value, entry.label, entry.group];
    if (idx === -1) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:D`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [rowValues] },
      });
    } else {
      const rowNumber = idx + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${rowNumber}:D${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: { values: [rowValues] },
      });
    }
    return entry;
  }

  async replaceAll(entries: SiteContentEntry[]): Promise<void> {
    await this.ensureHeader();
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!A2:D` });
    if (entries.length === 0) return;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:D`,
      valueInputOption: "RAW",
      requestBody: { values: entries.map((e) => [e.key, e.value, e.label, e.group]) },
    });
  }
}

export const siteContentRepo: SiteContentRepo = useSheetsAdapter
  ? new SheetsSiteContentRepo()
  : new JsonSiteContentRepo();
