import { createHash } from "node:crypto";
import { env } from "../config/env";

/**
 * One-way salted hash of a request IP. Per the plan's privacy model, the raw
 * IP is used only transiently in-memory (here, and for the Phase 11 geoip
 * lookup) — only this hash is ever persisted or returned by any API response.
 */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${env.IP_HASH_SALT}:${ip}`).digest("hex");
}
