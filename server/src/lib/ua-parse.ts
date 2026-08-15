import { UAParser } from "ua-parser-js";
import type { DeviceType } from "@portfolio/shared";

/**
 * Signatures for bots/crawlers/HTTP clients that should never be persisted
 * as a real visit. Matched case-insensitively against the raw UA string.
 * An empty/missing UA is also treated as a bot (see `isBotUserAgent`).
 */
const BOT_PATTERNS: RegExp[] = [
  /bot/i,
  /spider/i,
  /crawl/i,
  /slurp/i,
  /mediapartners/i,
  /facebookexternalhit/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /slackbot/i,
  /pingdom/i,
  /uptimerobot/i,
  /headlesschrome/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /python-urllib/i,
  /axios\//i,
  /go-http-client/i,
  /okhttp/i,
  /libwww-perl/i,
  /scrapy/i,
  /apachebench/i,
  /postmanruntime/i,
  /insomnia/i,
];

/** Returns true when the UA string looks like a bot, crawler, or scripted HTTP client. */
export function isBotUserAgent(uaString: string | undefined | null): boolean {
  if (!uaString || uaString.trim().length === 0) return true;
  return BOT_PATTERNS.some((pattern) => pattern.test(uaString));
}

function toDeviceType(rawType: string | undefined, isBot: boolean): DeviceType {
  if (isBot) return "bot";
  switch (rawType) {
    case "tablet":
      return "tablet";
    case "mobile":
      return "mobile";
    case "wearable":
    case "console":
    case "smarttv":
    case "embedded":
      return "unknown";
    default:
      // ua-parser-js leaves `device.type` undefined for regular desktop UAs.
      return "desktop";
  }
}

export interface ParsedUserAgent {
  deviceType: DeviceType;
  browser: string;
  os: string;
  isBot: boolean;
}

/** Parses a raw User-Agent string into the fields persisted on an analytics event. */
export function parseUserAgent(uaString: string | undefined | null): ParsedUserAgent {
  const bot = isBotUserAgent(uaString);
  const result = new UAParser(uaString ?? "").getResult();

  const browserName = result.browser.name;
  const browserVersion = result.browser.version?.split(".")[0];
  const browser = browserName
    ? browserVersion
      ? `${browserName} ${browserVersion}`
      : browserName
    : "Unknown";

  const osName = result.os.name;
  const osVersion = result.os.version;
  const os = osName ? (osVersion ? `${osName} ${osVersion}` : osName) : "Unknown";

  return {
    deviceType: toDeviceType(result.device.type, bot),
    browser,
    os,
    isBot: bot,
  };
}
