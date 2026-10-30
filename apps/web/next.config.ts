import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";
import { withEve } from "eve/next";
import type { NextConfig } from "next";

const withVarlock = varlockNextConfigPlugin();

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "esbuild",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
    turbopackRustReactCompiler: true,
    agentUpgrade: "security",
    agentFeedback: true,
    turbopackGc: true,
    turbopackLazyDynamicImports: true,
  },
  output: "standalone",
  partialPrefetching: true,
  reactCompiler: true,
  transpilePackages: [
    "@faceless/agent",
    "@faceless/api",
    "@faceless/auth",
    "@faceless/contracts",
    "@faceless/db",
    "@faceless/email",
    "@faceless/storage",
    "@faceless/ui",
    "@faceless/utils",
  ],
  devIndicators: false,
};

export default withVarlock(
  withEve(nextConfig, {
    eveRoot: "../../packages/agent",
  })
);
