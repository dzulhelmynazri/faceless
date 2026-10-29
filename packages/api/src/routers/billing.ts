import { checkSeriesEntitlementOutputSchema } from "@faceless/contracts/billing";

import { protectedProcedure } from "../middlewares/auth";
import { checkSeriesEntitlement } from "../middlewares/billing";
import { router } from "../trpc";

export const billingRouter = router({
  checkSeriesEntitlement: protectedProcedure
    .output(checkSeriesEntitlementOutputSchema)
    .query(async ({ ctx }) => {
      const { allowed, balance } = await checkSeriesEntitlement(ctx);

      return {
        allowed,
        seriesCount: balance?.usage ?? 0,
        seriesLimit: balance?.granted ?? 0,
      };
    }),
});
