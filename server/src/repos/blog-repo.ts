import { v4 as uuidv4 } from "uuid";
import type { BlogPost, BlogPostInput, BlogStatus } from "@portfolio/shared";
import { useSheetsAdapter } from "../config/env";
import { BaseCrudRepo } from "../lib/base-crud-repo";
import { JsonTable } from "../lib/json-table";
import { SheetsTable } from "../lib/sheets-table";
import type { RecordTable } from "../lib/record-table";
import { decodeArray, encodeArray } from "../lib/cell-codec";

const HEADERS = [
  "id", "slug", "title", "coverImageUrl", "excerpt", "contentHtml", "tags",
  "status", "publishedAt", "scheduledAt", "author", "readingTimeMinutes",
  "createdAt", "updatedAt",
] as const;

function toRow(p: BlogPost): (string | number | boolean)[] {
  return [
    p.id, p.slug, p.title, p.coverImageUrl, p.excerpt, p.contentHtml, encodeArray(p.tags),
    p.status, p.publishedAt ?? "", p.scheduledAt ?? "", p.author, p.readingTimeMinutes,
    p.createdAt, p.updatedAt,
  ];
}

function fromRow(row: string[]): BlogPost {
  const [
    id, slug, title, coverImageUrl, excerpt, contentHtml, tags,
    status, publishedAt, scheduledAt, author, readingTimeMinutes,
    createdAt, updatedAt,
  ] = row;
  return {
    id: id ?? "",
    slug: slug ?? "",
    title: title ?? "",
    coverImageUrl: coverImageUrl ?? "",
    excerpt: excerpt ?? "",
    contentHtml: contentHtml ?? "",
    tags: decodeArray(tags),
    status: (status || "draft") as BlogStatus,
    publishedAt: publishedAt || null,
    scheduledAt: scheduledAt || null,
    author: author || "Alex Rivera",
    readingTimeMinutes: Number(readingTimeMinutes) || 1,
    createdAt: createdAt ?? "",
    updatedAt: updatedAt ?? "",
  };
}

/** ~200 words/minute, rounded up, minimum 1 — derived server-side so admin editors never set it by hand. */
function estimateReadingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

class BlogRepo extends BaseCrudRepo<BlogPost> {
  async getBySlug(slug: string): Promise<BlogPost | undefined> {
    return (await this.getAll()).find((p) => p.slug === slug);
  }

  async create(input: BlogPostInput): Promise<BlogPost> {
    const now = new Date().toISOString();
    return this.append({
      id: uuidv4(),
      readingTimeMinutes: estimateReadingTime(input.contentHtml),
      createdAt: now,
      updatedAt: now,
      ...input,
    });
  }

  async updatePost(id: string, input: Partial<BlogPostInput>): Promise<BlogPost | undefined> {
    const readingTimeMinutes =
      input.contentHtml !== undefined ? estimateReadingTime(input.contentHtml) : undefined;
    return this.patch(id, {
      ...input,
      ...(readingTimeMinutes !== undefined ? { readingTimeMinutes } : {}),
      updatedAt: new Date().toISOString(),
    });
  }
}

const table: RecordTable<BlogPost> = useSheetsAdapter
  ? new SheetsTable<BlogPost>({ sheetName: "BlogPosts", headers: [...HEADERS], toRow, fromRow, getId: (p) => p.id })
  : new JsonTable<BlogPost>("blog-posts.json");

export const blogRepo = new BlogRepo(table);
