import { Link } from "react-router-dom";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import type { Project } from "@portfolio/shared";
import { Card, Badge } from "@/components/ui";

interface ProjectCardProps {
  project: Project;
  /** Caps the number of tech badges shown before a "+N more" pill; omit to show all. */
  maxTechnologies?: number;
}

/** Shared by the home page's featured picks and the full `/projects` grid. */
export function ProjectCard({ project, maxTechnologies }: ProjectCardProps) {
  const technologies = maxTechnologies ? project.technologies.slice(0, maxTechnologies) : project.technologies;
  const hiddenCount = maxTechnologies ? Math.max(0, project.technologies.length - maxTechnologies) : 0;

  return (
    <Card interactive padded={false} className="flex h-full flex-col overflow-hidden">
      <Link to={`/projects/${project.slug}`} className="block" tabIndex={-1}>
        <img src={project.thumbnailUrl} alt="" loading="lazy" className="h-48 w-full object-cover" />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="projects">{project.category}</Badge>
          {project.featured && <Badge tone="neutral">Featured</Badge>}
        </div>
        <Link to={`/projects/${project.slug}`} className="mt-3 block">
          <h3 className="text-lg font-semibold text-base-50 transition-colors hover:text-projects">{project.title}</h3>
        </Link>
        <p className="mt-2 flex-1 text-sm text-base-300">{project.shortDescription}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge key={tech} tone="projects">
              {tech}
            </Badge>
          ))}
          {hiddenCount > 0 && <Badge tone="neutral">+{hiddenCount} more</Badge>}
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="relative z-10 inline-flex items-center gap-1 text-projects hover:underline"
            >
              Live site <FiExternalLink aria-hidden="true" />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="relative z-10 inline-flex items-center gap-1 text-base-300 hover:text-base-50"
            >
              <FiGithub aria-hidden="true" /> Source
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
