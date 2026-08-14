import type { SkillLevel } from "@portfolio/shared";
import { skillLevels } from "@portfolio/shared";
import { cn } from "@/lib/cn";

interface SkillLevelDotsProps {
  level: SkillLevel;
  /** Tailwind background-color class for filled dots, e.g. "bg-skills". */
  fillClassName?: string;
  className?: string;
}

/**
 * Renders proficiency as four filled/unfilled dots against `skillLevels`
 * (Beginner..Expert) — a discrete, honest indicator rather than a decorative
 * percentage bar (there's no such thing as "73% React").
 */
export function SkillLevelDots({ level, fillClassName = "bg-skills", className }: SkillLevelDotsProps) {
  const filledCount = skillLevels.indexOf(level) + 1;

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={`Proficiency: ${level}`}
    >
      {skillLevels.map((levelName, index) => (
        <span
          key={levelName}
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            index < filledCount ? fillClassName : "bg-base-700"
          )}
        />
      ))}
    </span>
  );
}
