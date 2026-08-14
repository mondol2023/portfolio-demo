import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

/**
 * Parses `req.body` against `schema`, replacing it with the validated
 * (and zod-transformed/defaulted) value on success. Mirrors the inline
 * `safeParse` pattern used in `routes/contact.ts` and `routes/auth.ts`,
 * factored out so every admin CRUD route doesn't repeat it.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "validation_error",
        message: "Please check the highlighted fields and try again.",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
