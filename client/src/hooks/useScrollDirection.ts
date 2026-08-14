import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";

interface ScrollState {
  /** Past the threshold — navbar should switch from transparent to blurred. */
  scrolled: boolean;
  /** Last meaningful scroll direction — drives hide-on-scroll-down/show-on-scroll-up. */
  direction: "up" | "down";
}

/**
 * Tracks scroll position for the navbar. Small deltas (<4px, e.g. iOS
 * bounce-scroll jitter) are ignored so direction doesn't flicker.
 */
export function useScrollDirection(threshold = 24): ScrollState {
  const { scrollY } = useScroll();
  const lastY = useRef(0);
  const [state, setState] = useState<ScrollState>({ scrolled: false, direction: "up" });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastY.current;
    const diff = latest - previous;
    lastY.current = latest;
    const scrolled = latest > threshold;

    setState((current) => {
      if (Math.abs(diff) < 4) {
        return current.scrolled === scrolled ? current : { ...current, scrolled };
      }
      const direction = diff > 0 ? "down" : "up";
      if (current.scrolled === scrolled && current.direction === direction) return current;
      return { scrolled, direction };
    });
  });

  return state;
}
