import { analyticsRepo, type NewAnalyticsEvent } from "../repos/analytics-repo";

type QueuedEvent = NewAnalyticsEvent;

/**
 * In-process batched-write queue for analytics events. Buffers events in
 * memory and flushes them to the repo (a single `createMany` call) every
 * `FLUSH_INTERVAL_MS` or once `FLUSH_THRESHOLD` events accumulate, whichever
 * comes first — this keeps the tracking beacon fast and avoids hammering the
 * Sheets API with one append per pageview.
 */
const FLUSH_INTERVAL_MS = 10_000;
const FLUSH_THRESHOLD = 20;

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_INTERVAL_MS);
  flushTimer.unref?.();
}

async function flush(): Promise<void> {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue;
  queue = [];
  try {
    await analyticsRepo.createMany(batch);
  } catch (err) {
    // Best-effort: don't crash the process over a lost analytics batch.
    // Put the batch back so the next flush retries it.
    queue = [...batch, ...queue];
    console.error("[analytics-queue] flush failed, re-queued batch:", err);
  } finally {
    flushing = false;
  }
}

/** Adds an already-enriched event to the batch queue. Never throws. */
export function enqueueAnalyticsEvent(event: QueuedEvent): void {
  queue.push(event);
  if (queue.length >= FLUSH_THRESHOLD) {
    void flush();
    return;
  }
  scheduleFlush();
}

// Best-effort flush on shutdown so the last partial batch isn't silently lost.
process.on("beforeExit", () => {
  void flush();
});
