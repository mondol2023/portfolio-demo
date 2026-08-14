import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { springs } from "@/lib/animations/tokens";

export interface CardProps extends HTMLMotionProps<"div"> {
  /** Lifts + glows slightly on hover — use for interactive/clickable cards. */
  interactive?: boolean;
  /**
   * Set false for media cards (e.g. an edge-to-edge image) that manage their
   * own inner spacing — avoids relying on a later `className` utility to
   * override the default padding, which isn't guaranteed by class order.
   */
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive = false, padded = true, children, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileHover={interactive ? { y: -4 } : undefined}
      transition={springs.gentle}
      className={cn(
        "rounded-xl border border-base-700 bg-base-800/60 backdrop-blur-sm",
        padded && "p-6",
        interactive && "cursor-pointer transition-colors hover:border-base-500",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});
