import { isNonEmptyString } from "@faceless/utils";
import { TRPCError } from "@trpc/server";

import type { Context } from "../context";
import { protectedProcedure } from "./auth";

export interface BillingCustomer {
  customerId: string;
  name: string;
  email: string;
}

export const getBillingCustomer = async (ctx: {
  db: Context["db"];
  session: NonNullable<Context["session"]>;
}): Promise<BillingCustomer> => {
  const activeOrgId = ctx.session.session.activeOrganizationId;

  if (isNonEmptyString(activeOrgId)) {
    const org = await ctx.db.organization.findUnique({
      where: { id: activeOrgId },
      select: { id: true, name: true },
    });

    if (org) {
      return {
        customerId: org.id,
        email: org.id,
        name: org.name,
      };
    }
  }

  return {
    customerId: ctx.session.user.id,
    email: ctx.session.user.email,
    name: ctx.session.user.name,
  };
};

export const creditProcedure = (requiredCredits: number) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const customer = await getBillingCustomer(ctx);

    await ctx.autumn.customers.getOrCreate({
      customerId: customer.customerId,
      email: customer.email,
      name: customer.name,
    });

    const checkRes = await ctx.autumn.check({
      customerId: customer.customerId,
      featureId: "credits",
      requiredBalance: requiredCredits,
      sendEvent: true,
    });

    if (!checkRes.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Insufficient credits. Required: ${requiredCredits}, remaining: ${checkRes.balance?.remaining ?? 0}.`,
      });
    }

    return await next({
      ctx: {
        remainingCredits: checkRes.balance?.remaining,
      },
    });
  });
