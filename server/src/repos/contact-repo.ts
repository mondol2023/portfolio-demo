import { v4 as uuidv4 } from "uuid";
import type { ContactSubmission } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { BaseCrudRepo } from "../lib/base-crud-repo";
import { JsonTable } from "../lib/json-table";
import { SheetsTable } from "../lib/sheets-table";
import type { RecordTable } from "../lib/record-table";

export interface NewContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipHash: string;
}

const HEADERS = ["id", "name", "email", "subject", "message", "ipHash", "status", "createdAt"] as const;

function toRow(s: ContactSubmission): (string | number | boolean)[] {
  return [s.id, s.name, s.email, s.subject, s.message, s.ipHash, s.status, s.createdAt];
}

function fromRow(row: string[]): ContactSubmission {
  const [id, name, email, subject, message, ipHash, status, createdAt] = row;
  return {
    id: id ?? "",
    name: name ?? "",
    email: email ?? "",
    subject: subject ?? "",
    message: message ?? "",
    ipHash: ipHash ?? "",
    status: (status || "new") as ContactSubmission["status"],
    createdAt: createdAt ?? "",
  };
}

/**
 * `create` is the hot path (every public contact-form submission); `getAll`/
 * `updateStatus`/`remove` (via the inherited `remove`) back the admin inbox
 * that lands in Phase 9/10 — written now so that UI is additive, not a
 * repo rewrite.
 */
class ContactRepo extends BaseCrudRepo<ContactSubmission> {
  async create(input: NewContactSubmission): Promise<ContactSubmission> {
    return this.append({
      id: uuidv4(),
      status: "new",
      createdAt: new Date().toISOString(),
      ...input,
    });
  }

  async updateStatus(id: string, status: ContactSubmission["status"]): Promise<ContactSubmission | undefined> {
    return this.patch(id, { status });
  }
}

const table: RecordTable<ContactSubmission> = useSheetsAdapter
  ? new SheetsTable<ContactSubmission>({
      sheetName: "ContactSubmissions",
      headers: [...HEADERS],
      toRow,
      fromRow,
      getId: (s) => s.id,
    })
  : new JsonTable<ContactSubmission>("contact-submissions.json");

export const contactRepo = new ContactRepo(table);
