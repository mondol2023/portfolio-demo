/**
 * Motion foundation: duration/easing/scale/distance tokens + named spring
 * presets. Every animated component in this app imports from here rather
 * than inlining raw numbers, so the whole site's motion feel stays
 * consistent and is tunable from one place.
 *
 * (The `motion-patterns` skill this project follows expects a
 * `motion-foundations` skill to provide this file's shape — that skill
 * isn't available in this environment, so it's hand-authored here instead,
 * matching the conventions `motion-patterns`'s own examples assume:
 * `motionTokens.duration.*`, `motionTokens.easing.*`, `motionTokens.scale.*`,
 * `motionTokens.distance.*`, `springs.gentle`, `springs.snappy`.)
 */

import type { Transition } from "framer-motion";

export const motionTokens = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
  easing: {
    // cubic-bezier "smooth" ease-out, used for most enter transitions
    smooth: [0.16, 1, 0.3, 1] as const,
    // standard ease-in-out, used for symmetric/reversible transitions
    standard: [0.65, 0, 0.35, 1] as const,
  },
  scale: {
    subtle: 0.97,
    press: 0.95,
    pop: 1.03,
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 32,
    xl: 48,
  },
} as const;

export const springs = {
  /** Soft, settled motion — entrances, reveals, modal open. */
  gentle: {
    type: "spring",
    stiffness: 220,
    damping: 26,
    mass: 1,
  } satisfies Transition,
  /** Quick, responsive motion — button feedback, toasts, hover states. */
  snappy: {
    type: "spring",
    stiffness: 420,
    damping: 32,
    mass: 0.9,
  } satisfies Transition,
  /** Slow, weighty motion — large layout shifts, hero elements. */
  slow: {
    type: "spring",
    stiffness: 140,
    damping: 24,
    mass: 1.2,
  } satisfies Transition,
} as const;
