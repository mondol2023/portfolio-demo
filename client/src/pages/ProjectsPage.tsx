import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projectCategories, type ProjectCategory } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { springs } from "@/lib/animations/tokens";
import { cn } from "@/lib/cn";
import { useProjects } from "@/hooks/useApiQueries";

type FilterValue = "All" | ProjectCategory;

export function ProjectsPage() {
  const [filter, setFilter] = useState<FilterValue>("All");
  const { data: projects, isLoading } = useProjects();
  const allProjects = useMemo(() => projects ?? [], [projects]);

  const availableCategories = useMemo(() => {
    const present = new Set(allProjects.map((p) => p.category));
    return projectCategories.filter((category) => present.has(category));
  }, [allProjects]);

  const filterOptions: FilterValue[] = ["All", ...availableCategories];
  const filteredProjects = filter === "All" ? allProjects : allProjects.filter((p) => p.category === filter);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-projects">Projects</span>
        <h1 className="mt-2 text-3xl font-semibold text-base-50 sm:text-4xl">Everything I&apos;ve shipped</h1>
        <p className="mx-auto mt-3 max-w-xl text-base-300">
          A mix of client work, side projects, and open source. Filter by category to narrow it down.
        </p>
      </Reveal>

      {!isLoading && (
        <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter projects by category">
          {filterOptions.map((category) => {
            const isActive = filter === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                aria-pressed={isActive}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive ? "text-base-950" : "text-base-300 hover:text-base-50"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="project-filter-active"
                    className="absolute inset-0 rounded-full bg-projects"
                    transition={springs.snappy}
                  />
                )}
                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <>
          <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={springs.gentle}
                >
                  <ProjectCard project={project} maxTechnologies={4} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProjects.length === 0 && (
            <p className="mt-16 text-center text-base-400">No projects in this category yet.</p>
          )}
        </>
      )}
    </div>
  );
}
