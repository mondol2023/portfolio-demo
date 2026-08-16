import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "@/lib/analyticsBeacon";

/**
 * Fires one pageview beacon per route change. Mounted once at the
 * `RootLayout` level, so it only ever sees the public route tree — the
 * admin SPA renders through `AdminLayout` outside `RootLayout` and is never
 * tracked as visitor traffic.
 *
 * `document.referrer` is only meaningful for the very first pageview of a
 * hard page load; SPA route changes after that have no browser referrer, so
 * it's captured once via a ref instead of re-read on every navigation.
 */
export function useAnalyticsTracking(): void {
  const location = useLocation();
  const initialReferrer = useRef<string | undefined>(document.referrer || undefined);

  useEffect(() => {
    trackPageview(location.pathname, initialReferrer.current);
    initialReferrer.current = undefined;
  }, [location.pathname]);
}
