import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://postgres.psmhiraadbjpmjyzybti:ucvChTOmziTbxIEn@aws-1-us-east-2.pooler.supabase.com:5432/postgres",
  },
});
