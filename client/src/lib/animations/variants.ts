/**
 * Shared Framer Motion variants library. Sections/components compose these
 * instead of hand-rolling animation configs, so entrance/exit motion stays
 * consistent site-wide. All numbers come from `motionTokens`/`springs`.
 */

import type { Variants } from "framer-motion";
import { motionTokens, springs } from "./tokens";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: motionTokens.distance.lg },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -motionTokens.distance.lg },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth },
  },
};

export const slideIn: Variants = {
  hidden: { opacity: 0, x: -motionTokens.distance.xl },
  visible: {
    opacity: 1,
    x: 0,
    transition: springs.gentle,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: motionTokens.scale.subtle },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.gentle,
  },
};

/**
 * Wrap a list with this on the parent (`initial="hidden" animate="visible"`)
 * and give each child a variant with matching `hidden`/`visible` keys (e.g.
 * `fadeUp`) — stagger interval stays within the 0.05s–0.10s rule.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Route-level transition — pair with `AnimatePresence mode="wait"` keyed on pathname. */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: motionTokens.distance.sm },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth },
  },
  exit: {
    opacity: 0,
    y: -motionTokens.distance.sm,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.easing.standard },
  },
};

/** Modal panel transition — pair with the overlay's own opacity fade. */
export const modalTransition: Variants = {
  hidden: {
    opacity: 0,
    scale: motionTokens.scale.press,
    y: motionTokens.distance.sm,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    scale: motionTokens.scale.press,
    y: motionTokens.distance.sm,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.easing.standard },
  },
};
