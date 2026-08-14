import { z } from "zod";

export const contactInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(4000),
  /**
   * Honeypot field — real users never see or fill it in (hidden off-screen
   * in the UI); bots that autofill every field often do. Deliberately
   * permissive here (no max(0)/literal("") restriction) so a filled-in value
   * still passes validation and reaches the route handler, which returns a
   * fake success without persisting — a strict schema would instead surface
   * a 400 validation error, leaking the detection mechanism to the bot.
   */
  company: z.string().max(200).optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactInputSchema>;

export const contactSubmissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  ipHash: z.string(),
  status: z.enum(["new", "read", "archived"]).default("new"),
  createdAt: z.string(),
});
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
