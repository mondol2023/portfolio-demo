import { v4 as uuidv4 } from "uuid";
import type { AnalyticsEvent, AnalyticsEventType, DeviceType } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { BaseCrudRepo } from "../lib/base-crud-repo";
import { JsonTable } from "../lib/json-table";
import { SheetsTable } from "../lib/sheets-table";
import type { RecordTable } from "../lib/record-table";

const HEADERS = [
  "id", "sessionId", "type", "path", "eventName", "eventLabel", "referrer",
  "deviceType", "browser", "os", "screenWidth", "screenHeight", "language",
  "country", "region", "ipHash", "isBot", "timestamp",
] as const;

function toRow(e: AnalyticsEvent): (string | number | boolean)[] {
  return [
    e.id, e.sessionId, e.type, e.path, e.eventName ?? "", e.eventLabel ?? "", e.referrer ?? "",
    e.deviceType, e.browser, e.os, e.screenWidth ?? "", e.screenHeight ?? "", e.language ?? "",
    e.country ?? "", e.region ?? "", e.ipHash, e.isBot, e.timestamp,
  ];
}

function fromRow(row: string[]): AnalyticsEvent {
  const [
    id, sessionId, type, path, eventName, eventLabel, referrer,
    deviceType, browser, os, screenWidth, screenHeight, language,
    country, region, ipHash, isBot, timestamp,
  ] = row;
  return {
    id: id ?? "",
    sessionId: sessionId ?? "",
    type: (type || "pageview") as AnalyticsEventType,
    path: path ?? "",
    eventName: eventName || undefined,
    eventLabel: eventLabel || undefined,
    referrer: referrer || undefined,
    deviceType: (deviceType || "unknown") as DeviceType,
    browser: browser ?? "",
    os: os ?? "",
    screenWidth: screenWidth ? Number(screenWidth) : undefined,
    screenHeight: screenHeight ? Number(screenHeight) : undefined,
    language: language || undefined,
    country: country || undefined,
    region: region || undefined,
    ipHash: ipHash ?? "",
    isBot: isBot === "true",
    timestamp: timestamp ?? "",
  };
}

export type NewAnalyticsEvent = Omit<AnalyticsEvent, "id">;

/**
 * Append-mostly log of pageview/event rows. Query helpers for the analytics
 * dashboard (overview rollups, visitor sessions, per-session timelines) land
 * in Phase 11 alongside the tracking beacon and batched-write queue this
 * repo is designed to sit behind (`getAll()` is the read side either way).
 */
class AnalyticsRepo extends BaseCrudRepo<AnalyticsEvent> {
  async create(input: NewAnalyticsEvent): Promise<AnalyticsEvent> {
    return this.append({ id: uuidv4(), ...input });
  }

  async createMany(inputs: NewAnalyticsEvent[]): Promise<void> {
    for (const input of inputs) {
      await this.append({ id: uuidv4(), ...input });
    }
  }
}

const table: RecordTable<AnalyticsEvent> = useSheetsAdapter
  ? new SheetsTable<AnalyticsEvent>({ sheetName: "AnalyticsEvents", headers: [...HEADERS], toRow, fromRow, getId: (e) => e.id })
  : new JsonTable<AnalyticsEvent>("analytics-events.json");

export const analyticsRepo = new AnalyticsRepo(table);
