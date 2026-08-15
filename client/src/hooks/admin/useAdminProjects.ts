import type { Project, ProjectInput } from "@portfolio/shared";
import { createAdminCrudHooks } from "./useAdminCrud";

export const {
  useAdminList: useAdminProjects,
  useAdminItem: useAdminProject,
  useAdminCreate: useCreateProject,
  useAdminUpdate: useUpdateProject,
  useAdminRemove: useRemoveProject,
  useAdminReorder: useReorderProjects,
} = createAdminCrudHooks<Project, ProjectInput>("/api/admin/projects", "admin-projects");
