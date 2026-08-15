import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { AuditAction } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { useAdminAuditLog } from "@/hooks/admin/useAdminAuditLog";

const ACTION_TONE: Record<AuditAction, BadgeTone> = {
  create: "success",
  update: "info",
  delete: "danger",
  login: "neutral",
  login_failed: "warning",
  logout: "neutral",
  reorder: "info",
};

const PAGE_SIZE = 25;

export function AdminAuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useAdminAuditLog(page, PAGE_SIZE);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <Reveal className="flex flex-col gap-6">
      <AdminPageHeader title="Audit log" description="Every admin sign-in and content change, most recent first." />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <Card className="text-center text-sm text-base-400">No audit log entries yet.</Card>
      ) : (
        <Card padded={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-base-700 text-xs uppercase tracking-wide text-base-400">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((entry) => (
                  <tr key={entry.id} className="border-b border-base-800 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-base-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-base-200">{entry.adminEmail}</td>
                    <td className="px-4 py-3">
                      <Badge tone={ACTION_TONE[entry.action]}>{entry.action.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-base-300">
                      {entry.entityType}
                      {entry.entityId && <span className="text-base-500"> · {entry.entityId}</span>}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-base-400">{entry.details ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-base-400">
          <span>
            Page {data.page} of {totalPages} · {data.total} entries
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
            >
              <FiChevronLeft aria-hidden="true" /> Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
            >
              Next <FiChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </Reveal>
  );
}
