import { Router, type Request, type Response, type NextFunction } from "express";
import { contactInputSchema } from "@portfolio/shared";
import { contactRepo } from "../repos/contact-repo";
import { hashIp } from "../lib/ip-hash";
import { stripHtml } from "../lib/sanitize";

export const contactRouter = Router();

contactRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = contactInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "validation_error",
        message: "Please check the highlighted fields and try again.",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, subject, message, company } = parsed.data;

    // Honeypot: real visitors never fill this in. Bots that do get a fake
    // success so they don't learn to detect and route around it — nothing
    // is persisted.
    if (company) {
      res.status(200).json({ success: true });
      return;
    }

    const ip = req.ip ?? "unknown";
    const ipHash = hashIp(ip);

    // Defense in depth: strip any markup from free-text fields before they
    // ever reach storage, even though these are validated as plain strings.
    await contactRepo.create({
      name: stripHtml(name),
      email,
      subject: stripHtml(subject),
      message: stripHtml(message),
      ipHash,
    });

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});
