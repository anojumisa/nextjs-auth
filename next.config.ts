import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["msw", "@mswjs", "until-async", "uuid"],
};

export default nextConfig;
