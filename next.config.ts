import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["three"],
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
};

export default config;
