import type { Context as ApiContext } from "@faceless/api";
import type { NextRequest } from "next/server";

import { auth, autumn, files, getDb } from "./services";

export const createContext = async (req: NextRequest): Promise<ApiContext> => {
  const db = getDb();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return {
    auth,
    autumn,
    db,
    files,
    session,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
