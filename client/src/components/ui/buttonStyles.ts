import { cn } from "@/lib/cn";

const variantClasses = {
  primary: "bg-hero text-white shadow-lg shadow-hero/25 hover:bg-indigo-400",
  secondary: "bg-base-700 text-base-100 hover:bg-base-600",
  outline: "border border-base-600 text-base-100 hover:border-hero hover:text-hero",
  ghost: "text-base-200 hover:bg-base-800 hover:text-base-50",
  danger: "bg-danger text-white hover:bg-red-400",
} as const;

const sizeClasses = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

/**
 * Shared class-generation so non-`<button>` elements (e.g. router `Link`s
 * that need to *look* like a button — see `LinkButton`) can match `Button`'s
 * visual styling exactly without rendering a real `<button>`. Lives in its
 * own module (rather than `Button.tsx`) so both components stay fast-refresh
 * friendly (files that mix component and non-component exports opt out of
 * React Fast Refresh).
 */
export function buttonClassNames({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero focus-visible:ring-offset-2 focus-visible:ring-offset-base-950",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}
