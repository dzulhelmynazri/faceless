import { checkSeriesEntitlementOutputSchema } from "@faceless/contracts/billing";

import { protectedProcedure } from "../middlewares/auth";
import { getBillingCustomer } from "../middlewares/billing";
import { router } from "../trpc";

export const billingRouter = router({
  checkSeriesEntitlement: protectedProcedure
    .output(checkSeriesEntitlementOutputSchema)
    .query(async ({ ctx }) => {
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

      return {
        allowed: checkRes.allowed,
        seriesCount: checkRes.balance?.usage ?? 0,
        seriesLimit: checkRes.balance?.granted ?? 0,
      };
    }),
});
