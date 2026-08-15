import { motion } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { buttonClassNames, type ButtonSize, type ButtonVariant } from "./buttonStyles";
import { motionTokens, springs } from "@/lib/animations/tokens";

const MotionLink = motion.create(Link);

// `LinkProps` carries DOM-event-shaped animation-lifecycle props
// (`onAnimationStart`/`onAnimationEnd`/the `onDrag*` family) that collide
// with Framer Motion's own same-named-but-differently-typed props on
// `MotionLink` — omit the DOM versions so the Motion ones apply instead.
type OmittedLinkProps =
  | "children"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd";

export interface LinkButtonProps extends Omit<LinkProps, OmittedLinkProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

/**
 * `Button`'s visual styling + hover/tap feedback on a router `<Link>` — for
 * primary actions that navigate (e.g. "New Project") rather than submit.
 * `Button` itself is a `motion.button` with no `asChild`/polymorphic prop, so
 * this is a sibling component sharing `buttonClassNames` rather than a mode
 * of `Button`.
 */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { className, variant = "primary", size = "md", children, ...props },
  ref
) {
  return (
    <MotionLink
      ref={ref}
      whileHover={{ scale: motionTokens.scale.pop }}
      whileTap={{ scale: motionTokens.scale.press }}
      transition={springs.snappy}
      className={buttonClassNames({ variant, size, className })}
      {...props}
    >
      {children}
    </MotionLink>
  );
});
