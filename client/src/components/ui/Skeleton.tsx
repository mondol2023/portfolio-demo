import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Set for circular avatars/badges instead of the default rounded-rect. */
  circle?: boolean;
}

/**
 * Loading placeholder. Uses a plain CSS pulse (not Framer Motion) since
 * it's typically rendered many-at-once and needs to be cheap; still respects
 * `prefers-reduced-motion` via the global rule in index.css.
 */
export function Skeleton({ className, circle = false, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-base-700", circle ? "rounded-full" : "rounded-md", className)}
      {...props}
    />
  );
}
