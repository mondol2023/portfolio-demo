import type { Skill, SkillInput } from "@portfolio/shared";
import { createAdminCrudHooks } from "./useAdminCrud";

export const {
  useAdminList: useAdminSkills,
  useAdminCreate: useCreateSkill,
  useAdminUpdate: useUpdateSkill,
  useAdminRemove: useRemoveSkill,
  useAdminReorder: useReorderSkills,
} = createAdminCrudHooks<Skill, SkillInput>("/api/admin/skills", "admin-skills");
