import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type {
  AnalyticsOverview,
  ApiSuccess,
  Paginated,
  VisitorSession,
  VisitorSessionDetail,
  VisitorSortField,
} from "@portfolio/shared";
import { adminApiFetch } from "@/lib/adminApi";

/** Dashboard rollups — totals, popular pages, referrers, device/browser/OS/geo breakdowns, the visitors-over-time chart. */
export function useAdminAnalyticsOverview() {
  return useQuery({
    queryKey: ["admin-analytics-overview"] as const,
    queryFn: async () => (await adminApiFetch<ApiSuccess<AnalyticsOverview>>("/api/admin/analytics/overview")).data,
    // Rolls up the full event log server-side on every call — a light poll
    // keeps the dashboard reasonably fresh without hammering it on every render.
    refetchInterval: 60_000,
  });
}

export interface UseAdminVisitorsParams {
  page: number;
  pageSize?: number;
  sortField?: VisitorSortField;
  sortDir?: "asc" | "desc";
}

/** Paginated/sortable session list — mirrors `GET /api/admin/analytics/visitors`. */
export function useAdminVisitors({ page, pageSize = 25, sortField = "lastSeen", sortDir = "desc" }: UseAdminVisitorsParams) {
  return useQuery({
    queryKey: ["admin-analytics-visitors", page, pageSize, sortField, sortDir] as const,
    queryFn: async () =>
      (
        await adminApiFetch<ApiSuccess<Paginated<VisitorSession>>>(
          `/api/admin/analytics/visitors?page=${page}&pageSize=${pageSize}&sortField=${sortField}&sortDir=${sortDir}`
        )
      ).data,
    placeholderData: keepPreviousData,
  });
}

/** One session's full event timeline — mirrors `GET /api/admin/analytics/visitors/:sessionId`. */
export function useAdminVisitorSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["admin-analytics-visitor", sessionId] as const,
    queryFn: async () =>
      (await adminApiFetch<ApiSuccess<VisitorSessionDetail>>(`/api/admin/analytics/visitors/${sessionId}`)).data,
    enabled: Boolean(sessionId),
    retry: false,
  });
}
