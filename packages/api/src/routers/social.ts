import {
  disconnectSocialInputSchema,
  disconnectSocialOutputSchema,
  getOAuthUrlInputSchema,
  getOAuthUrlOutputSchema,
  getSocialConnectionsOutputSchema,
  PLATFORM_TO_SDK_MAP,
} from "@faceless/contracts/social";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../middlewares/auth";
import { router } from "../trpc";

export const socialRouter = router({
  getConnections: protectedProcedure
    .output(getSocialConnectionsOutputSchema)
    .query(async ({ ctx }) => {
      const connections = await ctx.db.socialConnection.findMany({
        where: {
          status: "CONNECTED",
          userId: ctx.session.user.id,
        },
        select: {
          avatarUrl: true,
          createdAt: true,
          id: true,
          platform: true,
          platformUserName: true,
          status: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return connections.map((conn) => ({
        avatarUrl: conn.avatarUrl,
        connectedAt: conn.createdAt.toISOString(),
        id: conn.id,
        platform: conn.platform,
        platformUserName: conn.platformUserName,
        status: conn.status,
      }));
    }),

  disconnect: protectedProcedure
    .input(disconnectSocialInputSchema)
    .output(disconnectSocialOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.socialConnection.findFirst({
        where: {
          platform: input.platform,
          userId: ctx.session.user.id,
        },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No active connection found for ${input.platform}`,
        });
      }

      await ctx.db.socialConnection.delete({
        where: { id: existing.id },
      });

      return { success: true };
    }),

  getOAuthUrl: protectedProcedure
    .input(getOAuthUrlInputSchema)
    .output(getOAuthUrlOutputSchema)
    .mutation(({ ctx, input }) => {
      const platformParam = PLATFORM_TO_SDK_MAP[input.platform];

      const state = encodeURIComponent(
        JSON.stringify({ platform: input.platform, ts: Date.now() })
      );

      const url = `${ctx.baseUrl}/api/social/oauth/${platformParam}?state=${state}&redirect_uri=${encodeURIComponent(
        input.redirectUri
      )}`;

      return { url };
    }),
});
