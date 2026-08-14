import { useReducedMotion as useFramerReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/animations/tokens";

/**
 * Re-exported so call sites only ever import reduced-motion utilities from
 * `@/hooks/useReducedMotion`, never `framer-motion` directly — keeps the
 * "respect prefers-reduced-motion" policy enforceable in one place.
 */
export const useReducedMotion = useFramerReducedMotion;

interface SafeMotionResult {
  initial: Record<string, number>;
  animate: Record<string, number>;
  exit: Record<string, number>;
}

/**
 * Builds an initial/animate/exit triple that collapses to an opacity-only
 * fade (no transform motion) when the user has requested reduced motion,
 * and a full transform+opacity animation otherwise. `distance` is the
 * y-offset (px) to travel on entrance — pass one of `motionTokens.distance`.
 */
export function useSafeMotion(distance: number = motionTokens.distance.sm): SafeMotionResult {
  const prefersReducedMotion = useFramerReducedMotion();

  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: distance },
  };
}
