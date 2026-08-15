import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui";

export interface TagListInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  rows?: number;
}

/**
 * One-entry-per-line editor for a `string[]` field (technologies,
 * screenshot URLs, tags, responsibilities, …) — a plain textarea is a far
 * lighter UI than a bespoke chip/dynamic-row editor per field, and every
 * array field on these entities is just a flat list of short strings.
 */
export function TagListInput({ label, value, onChange, hint, error, placeholder, rows = 4 }: TagListInputProps) {
  const [text, setText] = useState(value.join("\n"));

  // Re-sync if the parent value changes out from under us (e.g. form reset
  // after the entity finishes loading), without fighting the user's typing.
  useEffect(() => {
    setText((current) => (current === value.join("\n") ? current : value.join("\n")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Textarea
      label={label}
      hint={hint ?? "One per line"}
      error={error}
      placeholder={placeholder}
      rows={rows}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
        );
      }}
    />
  );
}
