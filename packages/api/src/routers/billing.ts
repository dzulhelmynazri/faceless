import {
  checkCreditsInputSchema,
  checkCreditsOutputSchema,
  consumeCreditsInputSchema,
  consumeCreditsOutputSchema,
} from "@faceless/contracts/billing";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../middlewares/auth";
import { getBillingCustomer } from "../middlewares/billing";
import { router } from "../trpc";

export const billingRouter = router({
  checkCredits: protectedProcedure
    .input(checkCreditsInputSchema)
    .output(checkCreditsOutputSchema)
    .query(async ({ ctx, input }) => {
      const customer = getBillingCustomer(ctx);

      await ctx.autumn.customers.getOrCreate({
        customerId: customer.customerId,
        email: customer.email,
        name: customer.name,
      });

      const checkRes = await ctx.autumn.check({
        customerId: customer.customerId,
        featureId: "credits",
        requiredBalance: input.requiredCredits,
      });

      return {
        allowed: checkRes.allowed,
        remaining: checkRes.balance?.remaining ?? 0,
        required: input.requiredCredits,
      };
    }),

  consumeCredits: protectedProcedure
    .input(consumeCreditsInputSchema)
    .output(consumeCreditsOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const customer = getBillingCustomer(ctx);

      await ctx.autumn.customers.getOrCreate({
        customerId: customer.customerId,
        email: customer.email,
        name: customer.name,
      });

      const checkRes = await ctx.autumn.check({
        customerId: customer.customerId,
        featureId: "credits",
        requiredBalance: input.amount,
        sendEvent: true,
      });

      if (!checkRes.allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Insufficient credits. Required: ${input.amount}, remaining: ${checkRes.balance?.remaining ?? 0}.`,
        });
      }

      return {
        consumed: input.amount,
        remaining: checkRes.balance?.remaining ?? 0,
        success: true,
      };
    }),
});
