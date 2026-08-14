import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/animations/variants";

interface RevealProps {
  children: ReactNode;
  /** Variant to animate through; defaults to the standard fade-up-on-scroll. */
  variants?: Variants;
  className?: string;
  /** Forwarded to `viewport.margin` — how far before entering the viewport to trigger. */
  margin?: string;
}

/**
 * Scroll-triggered reveal wrapper. Always fires once (`viewport={{ once: true }}`
 * per the motion-patterns rule — repeating entrances on scroll-out is
 * distracting, not informative).
 *
 * For a staggered group of items, wrap the list in a `motion.ul`/`motion.div`
 * using `staggerContainer` (from `@/lib/animations/variants`) with
 * `whileInView="visible"` instead of nesting multiple `Reveal`s — that keeps
 * the stagger interval centrally defined.
 */
export function Reveal({ children, variants = fadeUp, className, margin = "-80px" }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
