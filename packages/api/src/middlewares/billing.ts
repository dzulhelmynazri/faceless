import { TRPCError } from "@trpc/server";

import type { Context } from "../context";
import { protectedProcedure } from "./auth";

export interface BillingCustomer {
  customerId: string;
  name: string;
  email: string;
}

export const getBillingCustomer = (ctx: {
  session: NonNullable<Context["session"]>;
}): BillingCustomer => ({
  customerId: ctx.session.user.id,
  email: ctx.session.user.email,
  name: ctx.session.user.name,
});

export const seriesProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const customer = getBillingCustomer(ctx);

  await ctx.autumn.customers.getOrCreate({
    customerId: customer.customerId,
    email: customer.email,
    name: customer.name,
  });

  const checkRes = await ctx.autumn.check({
    customerId: customer.customerId,
    featureId: "series",
    requiredBalance: 1,
  });

  if (!checkRes.allowed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Active series limit reached. Upgrade your plan or add more series to create another.",
    });
  }

  return await next({
    ctx: {
      seriesBalance: checkRes.balance?.remaining,
    },
  });
});
