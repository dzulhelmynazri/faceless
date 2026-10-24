import { z } from "zod";

export const checkCreditsInputSchema = z.object({
  requiredCredits: z.number().int().min(1).default(5),
});

export type CheckCreditsInput = z.infer<typeof checkCreditsInputSchema>;

export const checkCreditsOutputSchema = z.object({
  allowed: z.boolean(),
  remaining: z.number().int(),
  required: z.number().int(),
});

export type CheckCreditsOutput = z.infer<typeof checkCreditsOutputSchema>;

export const consumeCreditsInputSchema = z.object({
  amount: z.number().int().min(1).default(25),
});

export type ConsumeCreditsInput = z.infer<typeof consumeCreditsInputSchema>;

export const consumeCreditsOutputSchema = z.object({
  consumed: z.number().int(),
  remaining: z.number().int(),
  success: z.boolean(),
});

export type ConsumeCreditsOutput = z.infer<typeof consumeCreditsOutputSchema>;
