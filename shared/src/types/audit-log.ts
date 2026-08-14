import { z } from "zod";

export const auditActions = ["create", "update", "delete", "login", "login_failed", "logout", "reorder"] as const;
export type AuditAction = (typeof auditActions)[number];

export const auditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  adminEmail: z.string(),
  action: z.enum(auditActions),
  entityType: z.string(),
  entityId: z.string().optional(),
  details: z.string().optional(),
});
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
