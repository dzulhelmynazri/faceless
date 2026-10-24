import { z } from "zod";

export const checkSeriesEntitlementOutputSchema = z.object({
  allowed: z.boolean(),
  seriesCount: z.number().int(),
  seriesLimit: z.number().int(),
});

export type CheckSeriesEntitlementOutput = z.infer<
  typeof checkSeriesEntitlementOutputSchema
>;
