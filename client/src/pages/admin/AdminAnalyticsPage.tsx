import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import type { VisitorSortField } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/analytics/StatCard";
import { VisitorsChart } from "@/components/admin/analytics/VisitorsChart";
import { DeviceDonut } from "@/components/admin/analytics/DeviceDonut";
import { BreakdownList } from "@/components/admin/analytics/BreakdownList";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { useAdminAnalyticsOverview, useAdminVisitors } from "@/hooks/admin/useAdminAnalytics";

const PAGE_SIZE = 20;

const SORT_LABEL: Record<VisitorSortField, string> = {
  firstSeen: "First seen",
  lastSeen: "Last seen",
  pageCount: "Pages",
  durationSeconds: "Duration",
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

export function AdminAnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useAdminAnalyticsOverview();

  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<VisitorSortField>("lastSeen");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { data: visitors, isLoading: visitorsLoading, isFetching } = useAdminVisitors({
    page,
    pageSize: PAGE_SIZE,
    sortField,
    sortDir,
  });

  function toggleSort(field: VisitorSortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  }

  const totalPages = visitors ? Math.max(1, Math.ceil(visitors.total / visitors.pageSize)) : 1;

  return (
    <Reveal className="flex flex-col gap-6">
      <AdminPageHeader
        title="Visitor analytics"
        description="Privacy-conscious traffic insights — no cookies, no raw IPs stored, sessions reset per browser tab."
      />

      {overviewLoading || !overview ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total pageviews" value={overview.totalVisitors} icon={FiEye} />
            <StatCard label="Unique sessions" value={overview.uniqueVisitors} icon={FiUsers} />
            <StatCard label="Today" value={overview.todayVisitors} icon={FiCalendar} />
            <StatCard label="This week" value={overview.weekVisitors} icon={FiTrendingUp} />
            <StatCard label="This month" value={overview.monthVisitors} icon={FiTrendingUp} />
          </div>

          <Card>
            <h2 className="mb-4 text-sm font-medium text-base-200">Sessions over the last 30 days</h2>
            <VisitorsChart data={overview.visitorsOverTime} />
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <BreakdownList
                title="Popular pages"
                rows={overview.popularPages.map((p) => ({ label: p.path, count: p.count }))}
              />
            </Card>
            <Card>
              <BreakdownList
                title="Referrers"
                rows={overview.referrers.map((r) => ({ label: r.referrer, count: r.count }))}
              />
            </Card>
            <Card>
              <h3 className="mb-3 text-sm font-medium text-base-200">Devices</h3>
              <DeviceDonut data={overview.devices} />
            </Card>
            <Card>
              <BreakdownList
                title="Browsers"
                rows={overview.browsers.map((b) => ({ label: b.browser, count: b.count }))}
              />
            </Card>
            <Card>
              <BreakdownList
                title="Operating systems"
                rows={overview.operatingSystems.map((o) => ({ label: o.os, count: o.count }))}
              />
            </Card>
            <Card>
              <BreakdownList
                title="Countries"
                rows={overview.countries.map((c) => ({ label: c.country, count: c.count }))}
                emptyLabel="No geo data yet."
              />
            </Card>
          </div>
        </>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-base-50">Visitor sessions</h2>

        {visitorsLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !visitors || visitors.items.length === 0 ? (
          <Card className="text-center text-sm text-base-400">No visitor sessions recorded yet.</Card>
        ) : (
          <Card padded={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-base-700 text-xs uppercase tracking-wide text-base-400">
                    {(["firstSeen", "lastSeen", "pageCount", "durationSeconds"] as VisitorSortField[]).map(
                      (field) => (
                        <th key={field} className="px-4 py-3 font-medium">
                          <button
                            type="button"
                            onClick={() => toggleSort(field)}
                            className="flex items-center gap-1 hover:text-base-200"
                          >
                            {SORT_LABEL[field]}
                            {sortField === field &&
                              (sortDir === "asc" ? (
                                <FiChevronUp aria-hidden="true" />
                              ) : (
                                <FiChevronDown aria-hidden="true" />
                              ))}
                          </button>
                        </th>
                      )
                    )}
                    <th className="px-4 py-3 font-medium">Entry page</th>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">Browser / OS</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.items.map((session) => (
                    <tr key={session.sessionId} className="border-b border-base-800 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-base-400">
                        <Link
                          to={`/admin/analytics/${session.sessionId}`}
                          className="text-base-200 underline-offset-4 hover:text-info hover:underline"
                        >
                          {new Date(session.firstSeen).toLocaleString()}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-base-400">
                        {new Date(session.lastSeen).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-base-300">{session.pageCount}</td>
                      <td className="px-4 py-3 tabular-nums text-base-300">
                        {formatDuration(session.durationSeconds)}
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-base-300" title={session.entryPath}>
                        {session.entryPath}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="info">{session.deviceType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-base-300">
                        {session.browser} · {session.os}
                      </td>
                      <td className="px-4 py-3 text-base-300">{session.country ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {visitors && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-base-400">
            <span>
              Page {visitors.page} of {totalPages} · {visitors.total} sessions
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
      </div>
    </Reveal>
  );
}
