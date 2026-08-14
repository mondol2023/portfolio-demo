import { experienceInputSchema, type Experience, type ExperienceInput } from "@portfolio/shared";
import { experienceRepo } from "../../repos/experience-repo";
import { buildAdminCrudRouter } from "../../lib/admin-crud-route";
import { invalidateExperienceCache } from "../experience";

export const adminExperienceRouter = buildAdminCrudRouter<Experience, ExperienceInput>({
  entityLabel: "experience",
  inputSchema: experienceInputSchema,
  updateInputSchema: experienceInputSchema.partial(),
  getAll: () => experienceRepo.getAll(),
  getById: (id) => experienceRepo.getById(id),
  create: (input) => experienceRepo.create(input),
  update: (id, patch) => experienceRepo.updateExperience(id, patch),
  remove: (id) => experienceRepo.remove(id),
  invalidateCache: invalidateExperienceCache,
  sortForList: (a, b) => a.order - b.order,
  supportsReorder: true,
});
