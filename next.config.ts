import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up the stray lockfile in $HOME.
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
