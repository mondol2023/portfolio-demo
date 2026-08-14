import { v4 as uuidv4 } from "uuid";
import type { AdminUser } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { BaseCrudRepo } from "../lib/base-crud-repo";
import { JsonTable } from "../lib/json-table";
import { SheetsTable } from "../lib/sheets-table";
import type { RecordTable } from "../lib/record-table";

const HEADERS = ["id", "email", "passwordHash", "role", "createdAt"] as const;

function toRow(u: AdminUser): (string | number | boolean)[] {
  return [u.id, u.email, u.passwordHash, u.role, u.createdAt];
}

function fromRow(row: string[]): AdminUser {
  const [id, email, passwordHash, , createdAt] = row;
  return { id: id ?? "", email: email ?? "", passwordHash: passwordHash ?? "", role: "admin", createdAt: createdAt ?? "" };
}

export interface NewAdminUser {
  email: string;
  passwordHash: string;
}

class AdminUsersRepo extends BaseCrudRepo<AdminUser> {
  async findByEmail(email: string): Promise<AdminUser | undefined> {
    const normalized = email.trim().toLowerCase();
    return (await this.getAll()).find((u) => u.email === normalized);
  }

  async create(input: NewAdminUser): Promise<AdminUser> {
    return this.append({
      id: uuidv4(),
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }
}

const table: RecordTable<AdminUser> = useSheetsAdapter
  ? new SheetsTable<AdminUser>({ sheetName: "AdminUsers", headers: [...HEADERS], toRow, fromRow, getId: (u) => u.id })
  : new JsonTable<AdminUser>("admin-users.json");

export const adminUsersRepo = new AdminUsersRepo(table);
