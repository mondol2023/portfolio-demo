import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiExternalLink, FiTrash2 } from "react-icons/fi";
import type { Project } from "@portfolio/shared";
import { Reveal } from "@/components/animations/Reveal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReorderableList } from "@/components/admin/ReorderableList";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { Badge, Card, LinkButton, Skeleton, Switch } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api";
import {
  useAdminProjects,
  useRemoveProject,
  useReorderProjects,
  useUpdateProject,
} from "@/hooks/admin/useAdminProjects";

export function AdminProjectsListPage() {
  const { data: projects, isLoading } = useAdminProjects();
  const reorder = useReorderProjects();
  const update = useUpdateProject();
  const remove = useRemoveProject();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  function handleToggle(project: Project, field: "featured" | "published") {
    update.mutate(
      { id: project.id, patch: { [field]: !project[field] } },
      {
        onError: (err) => {
          toast({ tone: "danger", title: err instanceof ApiError ? err.message : "Update failed" });
        },
      }
    );
  }

  function handleDelete() {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast({ tone: "success", title: `Deleted "${pendingDelete.title}"` });
        setPendingDelete(null);
      },
      onError: (err) => {
        toast({ tone: "danger", title: err instanceof ApiError ? err.message : "Delete failed" });
        setPendingDelete(null);
      },
    });
  }

  return (
    <Reveal className="flex flex-col gap-6">
      <AdminPageHeader
        title="Projects"
        description="Drag to reorder how projects appear on the public site."
        action={
          <LinkButton to="/admin/projects/new" size="sm">
            New project
          </LinkButton>
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <Card className="text-center text-sm text-base-400">
          No projects yet. Create your first one to get started.
        </Card>
      ) : (
        <ReorderableList
          items={projects}
          getId={(p) => p.id}
          pending={reorder.isPending}
          onCommit={(orderedIds) =>
            reorder.mutate(orderedIds, {
              onError: (err) => toast({ tone: "danger", title: err instanceof ApiError ? err.message : "Reorder failed" }),
            })
          }
          renderItem={(project) => (
            <div className="flex flex-wrap items-center gap-4">
              <img
                src={project.thumbnailUrl}
                alt=""
                className="h-12 w-16 flex-shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-base-100">{project.title}</p>
                  <Badge tone="projects">{project.category}</Badge>
                </div>
                <p className="truncate text-xs text-base-400">{project.shortDescription}</p>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  label="Featured"
                  checked={project.featured}
                  onChange={() => handleToggle(project, "featured")}
                />
                <Switch
                  label="Published"
                  checked={project.published}
                  onChange={() => handleToggle(project, "published")}
                />
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={`/projects/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View on site"
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-base-700 hover:text-base-100"
                >
                  <FiExternalLink className="h-4 w-4" />
                </a>
                <Link
                  to={`/admin/projects/${project.id}/edit`}
                  aria-label="Edit project"
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-base-700 hover:text-base-100"
                >
                  <FiEdit2 className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  aria-label="Delete project"
                  onClick={() => setPendingDelete(project)}
                  className="rounded-md p-2 text-base-400 transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete project"
        description={`Are you sure you want to delete "${pendingDelete?.title}"? This can't be undone.`}
        isDeleting={remove.isPending}
      />
    </Reveal>
  );
}
