import { createFilesRouter } from "files-sdk/api";
import { createRouteHandler } from "files-sdk/next";

import { env } from "@/env.server";
import { tenantPolicy } from "@/lib/files-policy";
import { auth, files, getDb } from "@/services";

const router = createFilesRouter({
  allowedOrigins: [env.BETTER_AUTH_URL],
  authorize: tenantPolicy({
    files,
    getRole: async (userId, orgId) => {
      const member = await getDb().member.findUnique({
        select: { role: true },
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId,
          },
        },
      });

      return member?.role ?? null;
    },
    getSession: async (headers) => await auth.api.getSession({ headers }),
  }),
  files,
  secret: env.BETTER_AUTH_SECRET,
});

export const { GET, POST, PUT } = createRouteHandler(router);
