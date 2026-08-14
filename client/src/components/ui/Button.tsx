import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { motionTokens, springs } from "@/lib/animations/tokens";

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

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children?: ReactNode;
}

/**
 * Base button. Hover/tap feedback follows the motion-patterns "Button
 * feedback" recipe (scale pop on hover, scale press on tap, snappy spring).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      disabled={disabled || isLoading}
      whileHover={disabled || isLoading ? undefined : { scale: motionTokens.scale.pop }}
      whileTap={disabled || isLoading ? undefined : { scale: motionTokens.scale.press }}
      transition={springs.snappy}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero focus-visible:ring-offset-2 focus-visible:ring-offset-base-950",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </motion.button>
  );
});
