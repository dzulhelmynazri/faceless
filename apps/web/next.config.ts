import { varlockNextConfigPlugin } from "@varlock/nextjs-integration/plugin";
import type { NextConfig } from "next";

const withVarlock = varlockNextConfigPlugin();

const nextConfig: NextConfig = {
  cacheComponents: true,
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

export default withVarlock(nextConfig);
