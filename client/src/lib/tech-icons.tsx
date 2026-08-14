import type { IconType } from "react-icons";
import {
  SiReact,
  SiTypescript,
  SiNodedotjs,
  SiTailwindcss,
  SiPostgresql,
  SiDocker,
  SiExpress,
  SiRedis,
  SiFramer,
  SiFigma,
  SiGithubactions,
  SiGooglecloud,
} from "react-icons/si";

/**
 * Brand icon + brand color per `Skill.iconKey` (see `shared/src/demo-data.ts`).
 * Shared between the hero's orbiting-badge illustration and the skills grid
 * so a given technology always renders with the same glyph/color.
 */
export interface TechIconMeta {
  Icon: IconType;
  /** Brand hex, used at low opacity so it reads on the dark theme without clashing with section accents. */
  color: string;
  label: string;
}

export const techIcons: Record<string, TechIconMeta> = {
  react: { Icon: SiReact, color: "#61DAFB", label: "React" },
  typescript: { Icon: SiTypescript, color: "#3178C6", label: "TypeScript" },
  nodejs: { Icon: SiNodedotjs, color: "#5FA04E", label: "Node.js" },
  tailwindcss: { Icon: SiTailwindcss, color: "#38BDF8", label: "Tailwind CSS" },
  postgresql: { Icon: SiPostgresql, color: "#4169E1", label: "PostgreSQL" },
  docker: { Icon: SiDocker, color: "#2496ED", label: "Docker" },
  express: { Icon: SiExpress, color: "#f3f4f6", label: "Express" },
  redis: { Icon: SiRedis, color: "#DC382D", label: "Redis" },
  framer: { Icon: SiFramer, color: "#f3f4f6", label: "Framer Motion" },
  figma: { Icon: SiFigma, color: "#F24E1E", label: "Figma" },
  githubactions: { Icon: SiGithubactions, color: "#2088FF", label: "GitHub Actions" },
  googlecloud: { Icon: SiGooglecloud, color: "#4285F4", label: "Google Cloud" },
};
