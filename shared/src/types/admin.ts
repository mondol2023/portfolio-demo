import { z } from "zod";

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string().trim().toLowerCase().email(),
  passwordHash: z.string(),
  role: z.literal("admin").default("admin"),
  createdAt: z.string(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

/** Safe subset returned to the client — never includes passwordHash. */
export type AdminUserPublic = Omit<AdminUser, "passwordHash">;

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});
export type LoginInput = z.infer<typeof loginInputSchema>;
