import { google, type sheets_v4 } from "googleapis";
import { env } from "../config/env";

let client: sheets_v4.Sheets | null = null;

/**
 * Lazily-constructed, cached Sheets v4 client authenticated via the service
 * account (server-only — never touched from the browser bundle). Only ever
 * called when `useSheetsAdapter` is true, so `GOOGLE_SERVICE_ACCOUNT_*` are
 * guaranteed present by the time this runs.
 */
export function getSheetsClient(): sheets_v4.Sheets {
  if (client) return client;
  const auth = new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Service-account keys are usually pasted into `.env` with literal `\n`
    // escapes rather than real newlines — restore them or the PEM key fails to parse.
    key: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  client = google.sheets({ version: "v4", auth });
  return client;
}

export const SPREADSHEET_ID = env.GOOGLE_SHEET_ID ?? "";
