import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AnimatedCounterProps {
  /** Final value to count up to once the counter scrolls into view. */
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Overrides the default `Math.round(n).toLocaleString()` formatting. */
  format?: (roundedValue: number) => string;
}

function defaultFormat(n: number): string {
  return Math.round(n).toLocaleString();
}

/**
 * Counts up from 0 to `value` once scrolled into view, driven by a spring
 * on a `useMotionValue` (updates DOM text directly via a subscription
 * instead of `setState`, so it doesn't re-render React on every frame).
 * Jumps straight to the final value under `prefers-reduced-motion`.
 */
export function AnimatedCounter({ value, prefix = "", suffix = "", className, format = defaultFormat }: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {prefix}
        {format(value)}
        {suffix}
      </span>
    );
  }

  return <SpringCounter value={value} prefix={prefix} suffix={suffix} className={className} format={format} />;
}

type SpringCounterProps = Required<Pick<AnimatedCounterProps, "prefix" | "suffix" | "format">> &
  Pick<AnimatedCounterProps, "value" | "className">;

function SpringCounter({ value, prefix, suffix, className, format }: SpringCounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(spanRef, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 28, mass: 1 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (spanRef.current) spanRef.current.textContent = `${prefix}${format(latest)}${suffix}`;
    });
    return unsubscribe;
  }, [spring, prefix, suffix, format]);

  return (
    <span ref={spanRef} className={className}>
      {prefix}
      {format(0)}
      {suffix}
    </span>
  );
}
