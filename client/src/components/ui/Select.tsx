import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Matches `Input`'s field styling/a11y wiring — kept as its own component since a `<select>` has no shared markup with `<input>`/`<textarea>`. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, hint, id, children, ...props },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-base-200">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(
          "w-full rounded-lg border border-base-600 bg-base-800 px-3.5 py-2.5 text-sm text-base-100 transition-colors",
          "focus:border-hero focus:outline-none focus:ring-2 focus:ring-hero/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-danger aria-invalid:focus:ring-danger/30",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={`${fieldId}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-xs text-base-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
