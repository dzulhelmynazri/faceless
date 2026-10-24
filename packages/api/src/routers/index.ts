import { protectedProcedure } from "../middlewares/auth";
import { publicProcedure, router } from "../trpc";
import { billingRouter } from "./billing";

export const appRouter = router({
  // Root utility procedures
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),

  // Feature namespaces
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
