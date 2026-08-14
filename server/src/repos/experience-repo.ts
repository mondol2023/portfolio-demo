import { v4 as uuidv4 } from "uuid";
import type { Experience, ExperienceInput } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { BaseCrudRepo } from "../lib/base-crud-repo";
import { JsonTable } from "../lib/json-table";
import { SheetsTable } from "../lib/sheets-table";
import type { RecordTable } from "../lib/record-table";
import { decodeArray, encodeArray } from "../lib/cell-codec";

const HEADERS = [
  "id", "company", "position", "startDate", "endDate", "isCurrent",
  "description", "responsibilities", "technologies", "order",
] as const;

function toRow(e: Experience): (string | number | boolean)[] {
  return [
    e.id, e.company, e.position, e.startDate, e.endDate ?? "", e.isCurrent,
    e.description, encodeArray(e.responsibilities), encodeArray(e.technologies), e.order,
  ];
}

function fromRow(row: string[]): Experience {
  const [id, company, position, startDate, endDate, isCurrent, description, responsibilities, technologies, order] = row;
  return {
    id: id ?? "",
    company: company ?? "",
    position: position ?? "",
    startDate: startDate ?? "",
    endDate: endDate || null,
    isCurrent: isCurrent === "true",
    description: description ?? "",
    responsibilities: decodeArray(responsibilities),
    technologies: decodeArray(technologies),
    order: Number(order) || 0,
  };
}

class ExperienceRepo extends BaseCrudRepo<Experience> {
  async create(input: ExperienceInput): Promise<Experience> {
    return this.append({ id: uuidv4(), ...input });
  }

  async updateExperience(id: string, input: Partial<ExperienceInput>): Promise<Experience | undefined> {
    return this.patch(id, input);
  }
}

const table: RecordTable<Experience> = useSheetsAdapter
  ? new SheetsTable<Experience>({ sheetName: "Experience", headers: [...HEADERS], toRow, fromRow, getId: (e) => e.id })
  : new JsonTable<Experience>("experience.json");

export const experienceRepo = new ExperienceRepo(table);
