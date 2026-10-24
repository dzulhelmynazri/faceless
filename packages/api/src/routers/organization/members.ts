import {
  removeMemberSchema,
  updateMemberRoleSchema,
} from "@faceless/contracts";
import { TRPCError } from "@trpc/server";

import {
  orgAdminProcedure,
  orgProcedure,
} from "../../middlewares/organization";
import { router } from "../../trpc";

export const memberRouter = router({
  list: orgProcedure.query(
    async ({ ctx }) =>
      await ctx.db.member.findMany({
        include: {
          user: {
            select: {
              email: true,
              id: true,
              image: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        where: { organizationId: ctx.org.id },
      })
  ),

  remove: orgAdminProcedure
    .input(removeMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const targetMember = await ctx.db.member.findUnique({
        where: { id: input.memberId },
      });

      if (!targetMember || targetMember.organizationId !== ctx.org.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found in this organization",
        });
      }

      if (targetMember.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the organization owner",
        });
      }

      if (targetMember.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove yourself from the organization",
        });
      }

      return await ctx.db.member.delete({
        where: { id: input.memberId },
      });
    }),

  updateRole: orgAdminProcedure
    .input(updateMemberRoleSchema)
    .mutation(async ({ ctx, input }) => {
      const targetMember = await ctx.db.member.findUnique({
        where: { id: input.memberId },
      });

      if (!targetMember || targetMember.organizationId !== ctx.org.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found in this organization",
        });
      }

      if (targetMember.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change the organization owner role",
        });
      }

      return await ctx.db.member.update({
        data: { role: input.role },
        where: { id: input.memberId },
      });
    }),
});
