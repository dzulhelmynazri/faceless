import {
  cancelInvitationSchema,
  inviteMemberSchema,
} from "@faceless/contracts";
import { TRPCError } from "@trpc/server";

import { orgAdminProcedure } from "../../middlewares/organization";
import { router } from "../../trpc";

const INVITATION_EXPIRY_DAYS = 7;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const invitationRouter = router({
  cancel: orgAdminProcedure
    .input(cancelInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.findFirst({
        where: {
          id: input.invitationId,
          organizationId: ctx.org.id,
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      return await ctx.db.invitation.update({
        data: { status: "canceled" },
        where: { id: input.invitationId },
      });
    }),

  invite: orgAdminProcedure
    .input(inviteMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const existingMember = await ctx.db.member.findFirst({
        where: {
          organizationId: ctx.org.id,
          user: { email: input.email },
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this organization",
        });
      }

      const pendingInvite = await ctx.db.invitation.findFirst({
        where: {
          email: input.email,
          organizationId: ctx.org.id,
          status: "pending",
        },
      });

      if (pendingInvite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An active invitation has already been sent to this email",
        });
      }

      const expiresAt = new Date(
        Date.now() + INVITATION_EXPIRY_DAYS * MS_IN_DAY
      );

      const invitation = await ctx.db.invitation.create({
        data: {
          email: input.email,
          expiresAt,
          id: crypto.randomUUID(),
          inviterId: ctx.session.user.id,
          organizationId: ctx.org.id,
          role: input.role,
          status: "pending",
        },
      });

      return {
        invitation,
        success: true,
      };
    }),

  list: orgAdminProcedure.query(
    async ({ ctx }) =>
      await ctx.db.invitation.findMany({
        orderBy: { createdAt: "desc" },
        where: {
          organizationId: ctx.org.id,
          status: "pending",
        },
      })
  ),
});
