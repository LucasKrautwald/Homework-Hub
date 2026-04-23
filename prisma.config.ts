import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

// `prisma generate` does not connect; a placeholder is OK when DATABASE_URL is unset locally.
// Vercel / production: set DATABASE_URL (e.g. Supabase pooler or direct URL).
const url =
  process.env["DATABASE_URL"] ??
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url,
  },
});
