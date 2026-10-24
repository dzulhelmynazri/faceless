import { isNonEmptyString } from "@faceless/utils";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "./auth";

export const orgProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  let activeOrgId = ctx.session.session.activeOrganizationId;

  if (!isNonEmptyString(activeOrgId)) {
    const defaultMember = await ctx.db.member.findFirst({
      include: {
        organization: true,
      },
      orderBy: { createdAt: "asc" },
      where: {
        userId: ctx.session.user.id,
      },
    });

    if (!defaultMember) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active organization selected",
      });
    }

    activeOrgId = defaultMember.organizationId;

    await ctx.db.session.update({
      data: { activeOrganizationId: defaultMember.organizationId },
      where: { id: ctx.session.session.id },
    });

    return await next({
      ctx: {
        org: defaultMember.organization,
        orgMember: defaultMember,
      },
    });
  }

  const member = await ctx.db.member.findFirst({
    include: {
      organization: true,
    },
    where: {
      organizationId: activeOrgId,
      userId: ctx.session.user.id,
    },
  });

  if (!member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this organization",
    });
  }

  return await next({
    ctx: {
      org: member.organization,
      orgMember: member,
    },
  });
});

export const orgAdminProcedure = orgProcedure.use(async ({ ctx, next }) => {
  if (ctx.orgMember.role !== "owner" && ctx.orgMember.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin or Owner permissions required",
    });
  }

  return await next({ ctx });
});
