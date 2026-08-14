import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiExternalLink, FiGithub } from "react-icons/fi";
import type { Project } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { Badge, Button } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProject } from "@/hooks/useApiQueries";

function caseStudySections(project: Project) {
  return [
    { heading: "The problem", body: project.problem },
    { heading: "The solution", body: project.solution },
    { heading: "Architecture", body: project.architecture },
    { heading: "Challenges", body: project.challenges },
    { heading: "Lessons learned", body: project.lessonsLearned },
  ].filter((section) => section.body);
}

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = useProject(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-6 h-9 w-2/3" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-10 aspect-video w-full" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <Reveal className="flex flex-col items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-base-400">404</span>
          <h1 className="text-2xl font-semibold text-base-50">Project not found</h1>
          <p className="text-base-300">It may have been renamed, unpublished, or the link is wrong.</p>
          <Button onClick={() => navigate("/projects")}>
            <FiArrowLeft aria-hidden="true" /> Back to projects
          </Button>
        </Reveal>
      </div>
    );
  }

  const sections = caseStudySections(project);

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-base-400 transition-colors hover:text-base-50"
        >
          <FiArrowLeft aria-hidden="true" /> All projects
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge tone="projects">{project.category}</Badge>
          {project.featured && <Badge tone="neutral">Featured</Badge>}
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-base-50 sm:text-4xl">{project.title}</h1>
        <p className="mt-3 text-lg text-base-300">{project.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} tone="projects">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {project.liveUrl && (
            <Button onClick={() => window.open(project.liveUrl, "_blank", "noopener,noreferrer")}>
              <FiExternalLink aria-hidden="true" /> Visit live site
            </Button>
          )}
          {project.githubUrl && (
            <Button variant="outline" onClick={() => window.open(project.githubUrl, "_blank", "noopener,noreferrer")}>
              <FiGithub aria-hidden="true" /> View source
            </Button>
          )}
        </div>
      </Reveal>

      <Reveal margin="-40px" className="mt-10">
        <img
          src={project.thumbnailUrl}
          alt=""
          className="aspect-video w-full rounded-2xl border border-base-800 object-cover"
        />
      </Reveal>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <Reveal key={section.heading} margin="-60px">
            <h2 className="text-xl font-semibold text-base-50">{section.heading}</h2>
            <p className="mt-2 text-base-300">{section.body}</p>
          </Reveal>
        ))}

        {project.features.length > 0 && (
          <Reveal margin="-60px">
            <h2 className="text-xl font-semibold text-base-50">Key features</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {project.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-base-300">
                  <FiCheck aria-hidden="true" className="mt-1 shrink-0 text-projects" />
                  {feature}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {project.screenshotUrls.length > 0 && (
          <Reveal margin="-60px">
            <h2 className="text-xl font-semibold text-base-50">Screenshots</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {project.screenshotUrls.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  loading="lazy"
                  className="aspect-video w-full rounded-xl border border-base-800 object-cover"
                />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}
