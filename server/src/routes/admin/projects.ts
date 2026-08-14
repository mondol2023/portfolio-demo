import { projectInputSchema, type Project, type ProjectInput } from "@portfolio/shared";
import { projectsRepo } from "../../repos/projects-repo";
import { buildAdminCrudRouter } from "../../lib/admin-crud-route";
import { sanitizeRichText } from "../../lib/sanitize";
import { invalidateProjectsCache } from "../projects";

export const adminProjectsRouter = buildAdminCrudRouter<Project, ProjectInput>({
  entityLabel: "project",
  inputSchema: projectInputSchema,
  updateInputSchema: projectInputSchema.partial(),
  getAll: () => projectsRepo.getAll(),
  getById: (id) => projectsRepo.getById(id),
  create: (input) => projectsRepo.create(input),
  update: (id, patch) => projectsRepo.updateProject(id, patch),
  remove: (id) => projectsRepo.remove(id),
  invalidateCache: invalidateProjectsCache,
  sortForList: (a, b) => a.order - b.order,
  supportsReorder: true,
  sanitize: (input: Partial<ProjectInput>) => ({
    ...input,
    ...(input.longDescriptionHtml !== undefined
      ? { longDescriptionHtml: sanitizeRichText(input.longDescriptionHtml) }
      : {}),
  }),
});
