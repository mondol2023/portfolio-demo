import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router doesn't auto-scroll on navigation. Scrolls to `#hash` targets
 * (after a short delay so the target has mounted) or resets to top otherwise.
 */
export function useScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = hash.slice(1);
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => clearTimeout(timer);
  }, [hash, pathname]);
}
