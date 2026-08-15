import { z } from "zod";

export const deviceTypes = ["desktop", "tablet", "mobile", "bot", "unknown"] as const;
export type DeviceType = (typeof deviceTypes)[number];

export const analyticsEventTypes = ["pageview", "event"] as const;
export type AnalyticsEventType = (typeof analyticsEventTypes)[number];

/** What the client beacon sends. No IP, no raw identifiers — server derives/hashes the rest. */
export const trackEventInputSchema = z.object({
  sessionId: z.string().uuid(),
  type: z.enum(analyticsEventTypes),
  path: z.string().max(500),
  eventName: z.string().max(80).optional(), // e.g. "github_click", "contact_submit"
  eventLabel: z.string().max(200).optional(),
  referrer: z.string().max(500).optional(),
  screenWidth: z.number().int().positive().optional(),
  screenHeight: z.number().int().positive().optional(),
  language: z.string().max(20).optional(),
  timezone: z.string().max(60).optional(),
});
export type TrackEventInput = z.infer<typeof trackEventInputSchema>;

/** What actually gets persisted (one row per event) after server-side enrichment. */
export const analyticsEventSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  type: z.enum(analyticsEventTypes),
  path: z.string(),
  eventName: z.string().optional(),
  eventLabel: z.string().optional(),
  referrer: z.string().optional(),
  deviceType: z.enum(deviceTypes),
  browser: z.string(),
  os: z.string(),
  screenWidth: z.number().optional(),
  screenHeight: z.number().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  ipHash: z.string(),
  isBot: z.boolean().default(false),
  timestamp: z.string(),
});
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;

export type AnalyticsOverview = {
  totalVisitors: number;
  uniqueVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  popularPages: { path: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  devices: { device: DeviceType; count: number }[];
  browsers: { browser: string; count: number }[];
  operatingSystems: { os: string; count: number }[];
  countries: { country: string; count: number }[];
  visitorsOverTime: { date: string; count: number }[];
};

export type VisitorSession = {
  sessionId: string;
  firstSeen: string;
  lastSeen: string;
  durationSeconds: number;
  entryPath: string;
  pageCount: number;
  deviceType: DeviceType;
  browser: string;
  os: string;
  referrer?: string;
  country?: string;
};

export type VisitorTimelineEntry = Pick<
  AnalyticsEvent,
  "type" | "path" | "eventName" | "eventLabel" | "timestamp"
>;

export type VisitorSessionDetail = {
  session: VisitorSession;
  timeline: VisitorTimelineEntry[];
};

export const visitorSortFields = ["firstSeen", "lastSeen", "pageCount", "durationSeconds"] as const;
export type VisitorSortField = (typeof visitorSortFields)[number];
