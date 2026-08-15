import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { motionTokens, springs } from "@/lib/animations/tokens";
import { buttonClassNames, type ButtonSize, type ButtonVariant } from "./buttonStyles";

export type { ButtonVariant, ButtonSize } from "./buttonStyles";

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
      className={buttonClassNames({ variant, size, className })}
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
