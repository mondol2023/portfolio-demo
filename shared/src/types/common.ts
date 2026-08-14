import { z } from "zod";

/** Accepts only well-formed http(s) URLs — blocks javascript:/data: XSS vectors in link/image fields. */
export const httpUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "URL must start with http:// or https://",
  });

export const optionalHttpUrlSchema = z
  .union([httpUrlSchema, z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, hyphen-separated");

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Body shape for admin drag-and-drop reorder endpoints: the full id list in its new order. */
export const reorderInputSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});
export type ReorderInput = z.infer<typeof reorderInputSchema>;
