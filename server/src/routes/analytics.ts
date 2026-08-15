import { Router, type Request, type Response, type NextFunction } from "express";
import geoip from "geoip-lite";
import { trackEventInputSchema } from "@portfolio/shared";
import { hashIp } from "../lib/ip-hash";
import { parseUserAgent } from "../lib/ua-parse";
import { enqueueAnalyticsEvent } from "../lib/analytics-queue";

export const analyticsRouter = Router();

analyticsRouter.post("/track", (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = trackEventInputSchema.safeParse(req.body);
    if (!parsed.success) {
      // Beacons never block/retry on the client — a 400 just means the
      // event is dropped, so there's no need to leak validation details.
      res.status(400).json({ error: "validation_error", message: "Invalid event." });
      return;
    }

    const uaString = req.get("user-agent");
    const { deviceType, browser, os, isBot } = parseUserAgent(uaString);

    // Bot traffic still gets a normal-looking response so a scripted client
    // can't infer it was detected — the event is just never enqueued.
    if (isBot) {
      res.status(202).json({ success: true });
      return;
    }

    const ip = req.ip ?? "unknown";
    const ipHash = hashIp(ip);
    const geo = ip !== "unknown" ? geoip.lookup(ip) : null;

    const { sessionId, type, path, eventName, eventLabel, referrer, screenWidth, screenHeight, language } =
      parsed.data;

    enqueueAnalyticsEvent({
      sessionId,
      type,
      path,
      eventName,
      eventLabel,
      referrer,
      deviceType,
      browser,
      os,
      screenWidth,
      screenHeight,
      language,
      country: geo?.country ?? undefined,
      region: geo?.region ?? undefined,
      ipHash,
      isBot: false,
      timestamp: new Date().toISOString(),
    });

    res.status(202).json({ success: true });
  } catch (err) {
    next(err);
  }
});
