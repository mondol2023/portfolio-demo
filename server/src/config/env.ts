import "dotenv/config";
import { z } from "zod";

// `.env` files commonly ship keys with blank values (`FOO=`) as a documented
// placeholder. dotenv loads that as `""`, which is *defined*, so zod's
// `.default()` would never kick in and `.min()` would reject it. Treat an
// empty string the same as "unset" for every field below so blank optional
// lines in `.env`/`.env.example` behave as intended.
const blankToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalString = () => z.preprocess(blankToUndefined, z.string().optional());
const withDefault = <T extends z.ZodTypeAny>(schema: T, fallback: z.output<T>) =>
  z.preprocess(blankToUndefined, schema.default(fallback));

const envSchema = z.object({
  NODE_ENV: withDefault(z.enum(["development", "production", "test"]), "development"),
  PORT: withDefault(z.coerce.number().int().positive(), 4000),
  CLIENT_ORIGIN: withDefault(z.string(), "http://localhost:5173"),

  // Auth secrets — required to have *some* value in all envs; the dev fallback below
  // is only ever used locally and is never a real production secret.
  JWT_ACCESS_SECRET: withDefault(z.string().min(16), "dev-only-access-secret-change-me-32chars!"),
  JWT_REFRESH_SECRET: withDefault(
    z.string().min(16),
    "dev-only-refresh-secret-change-me-32chars!"
  ),
  IP_HASH_SALT: withDefault(z.string().min(8), "dev-only-ip-salt-change-me"),

  // Google Sheets — optional. When absent, the server transparently falls back
  // to the local JSON-file data adapter for development/testing.
  GOOGLE_SHEET_ID: optionalString(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: optionalString(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: optionalString(),

  // Seed admin account (used only by `npm run seed`)
  SEED_ADMIN_EMAIL: withDefault(z.string().email(), "admin@example.com"),
  SEED_ADMIN_PASSWORD: withDefault(z.string().min(8), "ChangeMe123!"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";

export const useSheetsAdapter = Boolean(
  env.GOOGLE_SHEET_ID && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
);

const usingDevSecrets =
  env.JWT_ACCESS_SECRET.startsWith("dev-only") ||
  env.JWT_REFRESH_SECRET.startsWith("dev-only") ||
  env.IP_HASH_SALT.startsWith("dev-only");

if (isProduction && usingDevSecrets) {
  throw new Error(
    "Refusing to start in production with default development secrets. Set JWT_ACCESS_SECRET, JWT_REFRESH_SECRET and IP_HASH_SALT."
  );
}

if (!isProduction) {
  if (usingDevSecrets) {
    console.warn(
      "⚠️  Using default development JWT/IP-hash secrets. Set real secrets in .env before deploying."
    );
  }
  if (!useSheetsAdapter) {
    console.warn(
      "⚠️  Google Sheets credentials not configured — using local JSON file data store (server/.data). See README for Sheets setup."
    );
  }
}
