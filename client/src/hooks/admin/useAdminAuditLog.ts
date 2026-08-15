import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ApiSuccess, AuditLogEntry, Paginated } from "@portfolio/shared";
import { adminApiFetch } from "@/lib/adminApi";

/** Read-only, paginated — mirrors the server's `GET /api/admin/audit-log?page=&pageSize=`. */
export function useAdminAuditLog(page: number, pageSize = 25) {
  return useQuery({
    queryKey: ["admin-audit-log", page, pageSize] as const,
    queryFn: async () =>
      (
        await adminApiFetch<ApiSuccess<Paginated<AuditLogEntry>>>(
          `/api/admin/audit-log?page=${page}&pageSize=${pageSize}`
        )
      ).data,
    placeholderData: keepPreviousData,
  });
}
