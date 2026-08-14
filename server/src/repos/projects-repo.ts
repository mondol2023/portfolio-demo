import { v4 as uuidv4 } from "uuid";
import type { Project, ProjectCategory, ProjectInput } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { BaseCrudRepo } from "../lib/base-crud-repo";
import { JsonTable } from "../lib/json-table";
import { SheetsTable } from "../lib/sheets-table";
import type { RecordTable } from "../lib/record-table";
import { decodeArray, encodeArray } from "../lib/cell-codec";

const HEADERS = [
  "id", "slug", "title", "shortDescription", "longDescriptionHtml", "thumbnailUrl",
  "screenshotUrls", "technologies", "category", "githubUrl", "liveUrl", "featured",
  "published", "order", "problem", "solution", "architecture", "features",
  "challenges", "lessonsLearned", "createdAt", "updatedAt",
] as const;

function toRow(p: Project): (string | number | boolean)[] {
  return [
    p.id, p.slug, p.title, p.shortDescription, p.longDescriptionHtml, p.thumbnailUrl,
    encodeArray(p.screenshotUrls), encodeArray(p.technologies), p.category,
    p.githubUrl ?? "", p.liveUrl ?? "", p.featured, p.published, p.order,
    p.problem, p.solution, p.architecture, encodeArray(p.features), p.challenges,
    p.lessonsLearned, p.createdAt, p.updatedAt,
  ];
}

function fromRow(row: string[]): Project {
  const [
    id, slug, title, shortDescription, longDescriptionHtml, thumbnailUrl,
    screenshotUrls, technologies, category, githubUrl, liveUrl, featured,
    published, order, problem, solution, architecture, features,
    challenges, lessonsLearned, createdAt, updatedAt,
  ] = row;
  return {
    id: id ?? "",
    slug: slug ?? "",
    title: title ?? "",
    shortDescription: shortDescription ?? "",
    longDescriptionHtml: longDescriptionHtml ?? "",
    thumbnailUrl: thumbnailUrl ?? "",
    screenshotUrls: decodeArray(screenshotUrls),
    technologies: decodeArray(technologies),
    category: (category || "Full-Stack") as ProjectCategory,
    githubUrl: githubUrl || undefined,
    liveUrl: liveUrl || undefined,
    featured: featured === "true",
    published: published !== "false",
    order: Number(order) || 0,
    problem: problem ?? "",
    solution: solution ?? "",
    architecture: architecture ?? "",
    features: decodeArray(features),
    challenges: challenges ?? "",
    lessonsLearned: lessonsLearned ?? "",
    createdAt: createdAt ?? "",
    updatedAt: updatedAt ?? "",
  };
}

class ProjectsRepo extends BaseCrudRepo<Project> {
  async getBySlug(slug: string): Promise<Project | undefined> {
    return (await this.getAll()).find((p) => p.slug === slug);
  }

  async create(input: ProjectInput): Promise<Project> {
    const now = new Date().toISOString();
    return this.append({ id: uuidv4(), createdAt: now, updatedAt: now, ...input });
  }

  async updateProject(id: string, input: Partial<ProjectInput>): Promise<Project | undefined> {
    return this.patch(id, { ...input, updatedAt: new Date().toISOString() });
  }
}

const table: RecordTable<Project> = useSheetsAdapter
  ? new SheetsTable<Project>({ sheetName: "Projects", headers: [...HEADERS], toRow, fromRow, getId: (p) => p.id })
  : new JsonTable<Project>("projects.json");

export const projectsRepo = new ProjectsRepo(table);
