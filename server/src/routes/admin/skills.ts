import { skillInputSchema, type Skill, type SkillInput } from "@portfolio/shared";
import { skillsRepo } from "../../repos/skills-repo";
import { buildAdminCrudRouter } from "../../lib/admin-crud-route";
import { invalidateSkillsCache } from "../skills";

export const adminSkillsRouter = buildAdminCrudRouter<Skill, SkillInput>({
  entityLabel: "skill",
  inputSchema: skillInputSchema,
  updateInputSchema: skillInputSchema.partial(),
  getAll: () => skillsRepo.getAll(),
  getById: (id) => skillsRepo.getById(id),
  create: (input) => skillsRepo.create(input),
  update: (id, patch) => skillsRepo.updateSkill(id, patch),
  remove: (id) => skillsRepo.remove(id),
  invalidateCache: invalidateSkillsCache,
  sortForList: (a, b) => a.order - b.order,
  supportsReorder: true,
});
