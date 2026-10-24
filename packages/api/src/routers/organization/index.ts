import { createOrganizationSchema } from "@faceless/contracts";
import { deleteTenantFiles } from "@faceless/storage";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../../middlewares/auth";
import {
  orgAdminProcedure,
  orgProcedure,
} from "../../middlewares/organization";
import { router } from "../../trpc";
import { invitationRouter } from "./invitations";
import { memberRouter } from "./members";

export const organizationRouter = router({
  // Root organization procedures
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.organization.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An organization with this slug already exists",
        });
      }

      const orgId = crypto.randomUUID();
      const memberId = crypto.randomUUID();

      return await ctx.db.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            id: orgId,
            logo: input.logo,
            name: input.name,
            slug: input.slug,
          },
        });

        await tx.member.create({
          data: {
            id: memberId,
            organizationId: orgId,
            role: "owner",
            userId: ctx.session.user.id,
          },
        });

        return organization;
      });
    }),

  delete: orgAdminProcedure.mutation(async ({ ctx }) => {
    if (ctx.orgMember.role !== "owner") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the organization owner can delete the organization",
      });
    }

    const orgId = ctx.org.id;

    // 1. Purge all uploaded files in R2 storage
    const { deleted, failed } = await deleteTenantFiles(ctx.files, orgId);

    // 2. Reset activeOrganizationId on any active sessions
    await ctx.db.session.updateMany({
      data: { activeOrganizationId: null },
      where: { activeOrganizationId: orgId },
    });

    // 3. Delete organization in database (cascades to members and invitations)
    await ctx.db.organization.delete({
      where: { id: orgId },
    });

    return {
      filesDeleted: deleted,
      filesFailed: failed.length,
      success: true,
    };
  }),

  current: orgProcedure.query(({ ctx }) => ({
    currentRole: ctx.orgMember.role,
    organization: ctx.org,
  })),

  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.member.findMany({
      include: {
        organization: true,
      },
      orderBy: { createdAt: "asc" },
      where: { userId: ctx.session.user.id },
    });

    return memberships.map((membership) => ({
      organization: membership.organization,
      role: membership.role,
    }));
  }),

  // Verification & test routes
  allUser: orgProcedure.query(({ ctx }) => ({
    message: "Success: Accessible by all organization members",
    organization: ctx.org.name,
    organizationId: ctx.org.id,
    role: ctx.orgMember.role,
  })),

  onlyAdmin: orgAdminProcedure.query(({ ctx }) => ({
    message: "Success: Accessible only by organization admins and owners",
    organization: ctx.org.name,
    organizationId: ctx.org.id,
    role: ctx.orgMember.role,
  })),

  // Sub-routers
  invitations: invitationRouter,
  members: memberRouter,
});
