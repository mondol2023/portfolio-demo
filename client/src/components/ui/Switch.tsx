import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { springs } from "@/lib/animations/tokens";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: string;
  hint?: string;
}

/** Boolean toggle (`featured`/`published`/`isCurrent`, …) — a real checkbox under the hood for native a11y/form semantics, styled as a pill switch with an animated thumb. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, label, hint, id, checked, ...props },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label htmlFor={fieldId} className={cn("flex cursor-pointer items-start gap-3", className)}>
      <span className="relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          checked={checked}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full transition-colors",
            checked ? "bg-hero" : "bg-base-600",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-hero peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-base-950"
          )}
        />
        <motion.span
          aria-hidden="true"
          className="relative h-4.5 w-4.5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 22 : 4 }}
          transition={springs.snappy}
        />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-base-200">{label}</span>
        {hint && <span className="text-xs text-base-400">{hint}</span>}
      </span>
    </label>
  );
});
