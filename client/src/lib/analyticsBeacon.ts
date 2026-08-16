import type { TrackEventInput } from "@portfolio/shared";

const SESSION_STORAGE_KEY = "portfolio_analytics_session";
const TRACK_ENDPOINT = "/api/analytics/track";

/**
 * One id per browser tab session (`sessionStorage`, not persisted across
 * restarts and never sent as a cookie) — just enough to stitch a visit's
 * pageviews/events into a timeline without tracking a person across visits,
 * matching the plan's privacy-conscious analytics model: no fingerprinting,
 * the server never sees anything beyond this random id plus a salted IP hash.
 */
function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    // sessionStorage unavailable (e.g. some private-browsing contexts) —
    // fall back to a one-off id rather than losing tracking entirely; each
    // event just becomes its own single-event "session".
    return crypto.randomUUID();
  }
}

function isDoNotTrackEnabled(): boolean {
  const nav = navigator as Navigator & { doNotTrack?: string };
  const win = window as Window & { doNotTrack?: string };
  const dnt = nav.doNotTrack ?? win.doNotTrack;
  return dnt === "1" || dnt === "yes";
}

type BeaconInput = Pick<TrackEventInput, "type" | "path" | "eventName" | "eventLabel" | "referrer">;

function send(input: BeaconInput): void {
  if (isDoNotTrackEnabled()) return;

  const payload: TrackEventInput = {
    ...input,
    sessionId: getSessionId(),
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  const body = JSON.stringify(payload);

  // sendBeacon fires-and-forgets even during page unload (the common case for
  // the *last* pageview of a session) without blocking navigation. Fall back
  // to a keepalive fetch for the rare context without it.
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const delivered = navigator.sendBeacon(TRACK_ENDPOINT, blob);
    if (delivered) return;
  }

  void fetch(TRACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Best-effort only — a dropped beacon should never surface to the visitor.
  });
}

export function trackPageview(path: string, referrer?: string): void {
  send({ type: "pageview", path, referrer });
}

export function trackEvent(path: string, eventName: string, eventLabel?: string): void {
  send({ type: "event", path, eventName, eventLabel });
}
