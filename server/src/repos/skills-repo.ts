import { v4 as uuidv4 } from "uuid";
import type { Skill, SkillCategory, SkillInput, SkillLevel } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { BaseCrudRepo } from "../lib/base-crud-repo";
import { JsonTable } from "../lib/json-table";
import { SheetsTable } from "../lib/sheets-table";
import type { RecordTable } from "../lib/record-table";
import { decodeArray, encodeArray } from "../lib/cell-codec";

const HEADERS = [
  "id", "name", "category", "iconKey", "level", "yearsExperience", "relatedTechnologies", "order",
] as const;

function toRow(s: Skill): (string | number | boolean)[] {
  return [
    s.id, s.name, s.category, s.iconKey, s.level, s.yearsExperience ?? "",
    encodeArray(s.relatedTechnologies), s.order,
  ];
}

function fromRow(row: string[]): Skill {
  const [id, name, category, iconKey, level, yearsExperience, relatedTechnologies, order] = row;
  return {
    id: id ?? "",
    name: name ?? "",
    category: (category || "Other") as SkillCategory,
    iconKey: iconKey ?? "",
    level: (level || "Beginner") as SkillLevel,
    yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
    relatedTechnologies: decodeArray(relatedTechnologies),
    order: Number(order) || 0,
  };
}

class SkillsRepo extends BaseCrudRepo<Skill> {
  async create(input: SkillInput): Promise<Skill> {
    return this.append({ id: uuidv4(), ...input });
  }

  async updateSkill(id: string, input: Partial<SkillInput>): Promise<Skill | undefined> {
    return this.patch(id, input);
  }
}

const table: RecordTable<Skill> = useSheetsAdapter
  ? new SheetsTable<Skill>({ sheetName: "Skills", headers: [...HEADERS], toRow, fromRow, getId: (s) => s.id })
  : new JsonTable<Skill>("skills.json");

export const skillsRepo = new SkillsRepo(table);
