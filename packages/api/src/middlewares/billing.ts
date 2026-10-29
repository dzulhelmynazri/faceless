import { TRPCError } from "@trpc/server";

import type { Context } from "../context";
import { protectedProcedure } from "./auth";

export const SERIES_FEATURE_ID = "series" as const;

export interface BillingCustomer {
  customerId: string;
  email: string;
  name: string;
}

export const getBillingCustomer = (ctx: {
  session: NonNullable<Context["session"]>;
}): BillingCustomer => ({
  customerId: ctx.session.user.id,
  email: ctx.session.user.email,
  name: ctx.session.user.name,
});

export const checkSeriesEntitlement = async (ctx: {
  autumn: Context["autumn"];
  session: NonNullable<Context["session"]>;
}) => {
  const customer = getBillingCustomer(ctx);

  await ctx.autumn.customers.getOrCreate(customer);

  return await ctx.autumn.check({
    customerId: customer.customerId,
    featureId: SERIES_FEATURE_ID,
  });
};

export const seriesProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const checkRes = await checkSeriesEntitlement(ctx);

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
