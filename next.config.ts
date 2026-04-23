import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7 + pg: keep native/runtime pieces external so Turbopack/webpack resolve correctly on Vercel.
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "pg",
    "@prisma/adapter-pg",
  ],
  // Custom Prisma output lives outside node_modules — ensure server bundles include it.
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
