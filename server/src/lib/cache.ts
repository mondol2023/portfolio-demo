interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Minimal in-memory cache-aside layer in front of public content reads (the
 * plan's "TTL ~30-60s, invalidated immediately on any admin write" design —
 * keeps the public site fast despite Sheets API latency/quota, without ever
 * serving genuinely stale data after an edit). Process-local; fine for a
 * single-instance deploy, which is the only target here.
 */
class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }
}

export const cache = new TtlCache();

const DEFAULT_TTL_MS = 45_000;

/** Read-through helper: serve the cached value if fresh, else load + cache it. */
export async function cached<T>(key: string, load: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const hit = cache.get<T>(key);
  if (hit !== undefined) return hit;
  const value = await load();
  cache.set(key, value, ttlMs);
  return value;
}
