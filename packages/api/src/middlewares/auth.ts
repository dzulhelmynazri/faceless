import { TRPCError } from "@trpc/server";

import { middleware, publicProcedure } from "../trpc";

export const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      cause: "No session",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  return await next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(authMiddleware);
