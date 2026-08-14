import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const toneClasses = {
  neutral: "bg-base-700 text-base-200",
  hero: "bg-hero/10 text-hero",
  about: "bg-about/10 text-about",
  skills: "bg-skills/10 text-skills",
  experience: "bg-experience/10 text-experience",
  projects: "bg-projects/10 text-projects",
  blog: "bg-blog/10 text-blog",
  contact: "bg-contact/10 text-contact",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
} as const;

export type BadgeTone = keyof typeof toneClasses;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
