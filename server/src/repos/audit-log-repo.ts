import { v4 as uuidv4 } from "uuid";
import type { AuditAction, AuditLogEntry } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { BaseCrudRepo } from "../lib/base-crud-repo";
import { JsonTable } from "../lib/json-table";
import { SheetsTable } from "../lib/sheets-table";
import type { RecordTable } from "../lib/record-table";

const HEADERS = ["id", "timestamp", "adminEmail", "action", "entityType", "entityId", "details"] as const;

function toRow(e: AuditLogEntry): (string | number | boolean)[] {
  return [e.id, e.timestamp, e.adminEmail, e.action, e.entityType, e.entityId ?? "", e.details ?? ""];
}

function fromRow(row: string[]): AuditLogEntry {
  const [id, timestamp, adminEmail, action, entityType, entityId, details] = row;
  return {
    id: id ?? "",
    timestamp: timestamp ?? "",
    adminEmail: adminEmail ?? "",
    action: (action || "update") as AuditAction,
    entityType: entityType ?? "",
    entityId: entityId || undefined,
    details: details || undefined,
  };
}

export type NewAuditLogEntry = Omit<AuditLogEntry, "id" | "timestamp">;

/** Append-only trail — one row per admin create/update/delete/login (per the plan's security model). */
class AuditLogRepo extends BaseCrudRepo<AuditLogEntry> {
  async record(input: NewAuditLogEntry): Promise<AuditLogEntry> {
    return this.append({ id: uuidv4(), timestamp: new Date().toISOString(), ...input });
  }
}

const table: RecordTable<AuditLogEntry> = useSheetsAdapter
  ? new SheetsTable<AuditLogEntry>({ sheetName: "AuditLog", headers: [...HEADERS], toRow, fromRow, getId: (e) => e.id })
  : new JsonTable<AuditLogEntry>("audit-log.json");

export const auditLogRepo = new AuditLogRepo(table);
