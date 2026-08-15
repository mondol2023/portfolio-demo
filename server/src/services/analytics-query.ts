import type {
  AnalyticsEvent,
  AnalyticsOverview,
  DeviceType,
  Paginated,
  VisitorSession,
  VisitorSessionDetail,
  VisitorSortField,
  VisitorTimelineEntry,
} from "@portfolio/shared";
import { analyticsRepo } from "../repos/analytics-repo";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Bot events are filtered out of the ingestion pipeline already; this is a defensive second pass. */
function isReal(e: AnalyticsEvent): boolean {
  return !e.isBot;
}

function startOfDayUTC(ts: number): number {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function dateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function buildDateRange(startMs: number, endMs: number): string[] {
  const dates: string[] = [];
  for (let t = startMs; t <= endMs; t += DAY_MS) {
    dates.push(dateKey(t));
  }
  return dates;
}

function normalizeReferrer(referrer: string): string {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

function topEntries<K extends string>(counts: Map<K, number>, limit: number): { key: K; count: number }[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

/**
 * Computes the dashboard overview rollups from the raw event log. There is
 * no persistent visitor identity by design (privacy-conscious — the
 * `sessionId` resets every browser session), so "visitors" here means
 * distinct sessions rather than distinct people.
 */
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const events = (await analyticsRepo.getAll()).filter(isReal);

  const now = Date.now();
  const todayStart = startOfDayUTC(now);
  const weekStart = todayStart - 6 * DAY_MS;
  const monthStart = todayStart - 29 * DAY_MS;

  const allSessions = new Set<string>();
  const todaySessions = new Set<string>();
  const weekSessions = new Set<string>();
  const monthSessions = new Set<string>();

  const pageCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const deviceCounts = new Map<DeviceType, number>();
  const browserCounts = new Map<string, number>();
  const osCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();

  const dayCounts = new Map<string, number>();
  const sessionDaysSeen = new Set<string>();

  for (const e of events) {
    const ts = new Date(e.timestamp).getTime();
    if (Number.isNaN(ts)) continue;

    allSessions.add(e.sessionId);
    if (ts >= todayStart) todaySessions.add(e.sessionId);
    if (ts >= weekStart) weekSessions.add(e.sessionId);
    if (ts >= monthStart) monthSessions.add(e.sessionId);

    if (e.type === "pageview") {
      pageCounts.set(e.path, (pageCounts.get(e.path) ?? 0) + 1);
      const ref = e.referrer ? normalizeReferrer(e.referrer) : "Direct";
      referrerCounts.set(ref, (referrerCounts.get(ref) ?? 0) + 1);
    }

    deviceCounts.set(e.deviceType, (deviceCounts.get(e.deviceType) ?? 0) + 1);
    browserCounts.set(e.browser, (browserCounts.get(e.browser) ?? 0) + 1);
    osCounts.set(e.os, (osCounts.get(e.os) ?? 0) + 1);
    if (e.country) countryCounts.set(e.country, (countryCounts.get(e.country) ?? 0) + 1);

    if (ts >= monthStart) {
      const key = dateKey(ts);
      const sessionDayKey = `${e.sessionId}|${key}`;
      if (!sessionDaysSeen.has(sessionDayKey)) {
        sessionDaysSeen.add(sessionDayKey);
        dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const visitorsOverTime = buildDateRange(monthStart, todayStart).map((date) => ({
    date,
    count: dayCounts.get(date) ?? 0,
  }));

  return {
    totalVisitors: events.filter((e) => e.type === "pageview").length,
    uniqueVisitors: allSessions.size,
    todayVisitors: todaySessions.size,
    weekVisitors: weekSessions.size,
    monthVisitors: monthSessions.size,
    popularPages: topEntries(pageCounts, 10).map(({ key, count }) => ({ path: key, count })),
    referrers: topEntries(referrerCounts, 10).map(({ key, count }) => ({ referrer: key, count })),
    devices: topEntries(deviceCounts, deviceCounts.size).map(({ key, count }) => ({ device: key, count })),
    browsers: topEntries(browserCounts, 8).map(({ key, count }) => ({ browser: key, count })),
    operatingSystems: topEntries(osCounts, 8).map(({ key, count }) => ({ os: key, count })),
    countries: topEntries(countryCounts, 10).map(({ key, count }) => ({ country: key, count })),
    visitorsOverTime,
  };
}

interface SessionAggregate {
  sessionId: string;
  firstTs: number;
  lastTs: number;
  entryPath: string;
  pageCount: number;
  deviceType: DeviceType;
  browser: string;
  os: string;
  referrer?: string;
  country?: string;
}

/** Folds a flat event list into one aggregate row per session, seeded by each session's earliest event. */
function buildSessionAggregates(events: AnalyticsEvent[]): Map<string, SessionAggregate> {
  const sessions = new Map<string, SessionAggregate>();
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const e of sorted) {
    const ts = new Date(e.timestamp).getTime();
    if (Number.isNaN(ts)) continue;

    let agg = sessions.get(e.sessionId);
    if (!agg) {
      agg = {
        sessionId: e.sessionId,
        firstTs: ts,
        lastTs: ts,
        entryPath: e.path,
        pageCount: 0,
        deviceType: e.deviceType,
        browser: e.browser,
        os: e.os,
        referrer: e.referrer,
        country: e.country,
      };
      sessions.set(e.sessionId, agg);
    }

    agg.lastTs = Math.max(agg.lastTs, ts);
    if (e.type === "pageview") agg.pageCount += 1;
    if (!agg.country && e.country) agg.country = e.country;
  }

  return sessions;
}

function toVisitorSession(agg: SessionAggregate): VisitorSession {
  return {
    sessionId: agg.sessionId,
    firstSeen: new Date(agg.firstTs).toISOString(),
    lastSeen: new Date(agg.lastTs).toISOString(),
    durationSeconds: Math.max(0, Math.round((agg.lastTs - agg.firstTs) / 1000)),
    entryPath: agg.entryPath,
    pageCount: agg.pageCount,
    deviceType: agg.deviceType,
    browser: agg.browser,
    os: agg.os,
    referrer: agg.referrer,
    country: agg.country,
  };
}

function sortValue(session: VisitorSession, field: VisitorSortField): number {
  switch (field) {
    case "firstSeen":
      return new Date(session.firstSeen).getTime();
    case "lastSeen":
      return new Date(session.lastSeen).getTime();
    case "pageCount":
      return session.pageCount;
    case "durationSeconds":
      return session.durationSeconds;
  }
}

export interface GetVisitorSessionsParams {
  page: number;
  pageSize: number;
  sortField?: VisitorSortField;
  sortDir?: "asc" | "desc";
}

export async function getVisitorSessions(params: GetVisitorSessionsParams): Promise<Paginated<VisitorSession>> {
  const events = (await analyticsRepo.getAll()).filter(isReal);
  const aggregates = buildSessionAggregates(events);
  const allSessions = [...aggregates.values()].map(toVisitorSession);

  const sortField = params.sortField ?? "lastSeen";
  const sortDir = params.sortDir ?? "desc";
  allSessions.sort((a, b) => {
    const diff = sortValue(a, sortField) - sortValue(b, sortField);
    return sortDir === "asc" ? diff : -diff;
  });

  const total = allSessions.length;
  const start = (params.page - 1) * params.pageSize;
  const items = allSessions.slice(start, start + params.pageSize);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function getVisitorSessionDetail(sessionId: string): Promise<VisitorSessionDetail | null> {
  const events = (await analyticsRepo.getAll()).filter((e) => isReal(e) && e.sessionId === sessionId);
  if (events.length === 0) return null;

  const aggregates = buildSessionAggregates(events);
  const agg = aggregates.get(sessionId);
  if (!agg) return null;

  const timeline: VisitorTimelineEntry[] = [...events]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((e) => ({
      type: e.type,
      path: e.path,
      eventName: e.eventName,
      eventLabel: e.eventLabel,
      timestamp: e.timestamp,
    }));

  return { session: toVisitorSession(agg), timeline };
}
