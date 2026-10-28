import type { Context as ApiContext } from "@faceless/api";
import type { NextRequest } from "next/server";

import { env } from "./env.server";
import { auth, autumn, files, getDb, socials, videoRenderer } from "./services";

export const createContext = async (req: NextRequest): Promise<ApiContext> => {
  const db = getDb();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return {
    auth,
    autumn,
    baseUrl: env.BETTER_AUTH_URL,
    db,
    files,
    session,
    socials,
    videoRenderer,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
