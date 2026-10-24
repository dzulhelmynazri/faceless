import { createFilesRouter } from "files-sdk/api";
import { createRouteHandler } from "files-sdk/next";

import { env } from "@/env.server";
import { userPolicy } from "@/lib/files-policy";
import { auth, files } from "@/services";

const router = createFilesRouter({
  allowedOrigins: [env.BETTER_AUTH_URL],
  authorize: userPolicy({
    files,
    getSession: async (headers) => await auth.api.getSession({ headers }),
  }),
  files,
  secret: env.BETTER_AUTH_SECRET,
});

export const { GET, POST, PUT } = createRouteHandler(router);
