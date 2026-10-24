import { appRouter } from "@faceless/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { createContext } from "@/context";
import { withEvlog } from "@/lib/evlog";
import { identifyEvlogUser } from "@/lib/evlog-auth";

const handler = async (req: NextRequest) => {
  await identifyEvlogUser(req);

  return await fetchRequestHandler({
    createContext: async () => await createContext(req),
    endpoint: "/api/trpc",
    req,
    router: appRouter,
  });
};

export const GET = withEvlog(handler);
export const POST = withEvlog(handler);
