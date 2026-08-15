import type { Experience, ExperienceInput } from "@portfolio/shared";
import { createAdminCrudHooks } from "./useAdminCrud";

export const {
  useAdminList: useAdminExperience,
  useAdminCreate: useCreateExperience,
  useAdminUpdate: useUpdateExperience,
  useAdminRemove: useRemoveExperience,
  useAdminReorder: useReorderExperience,
} = createAdminCrudHooks<Experience, ExperienceInput>("/api/admin/experience", "admin-experience");
