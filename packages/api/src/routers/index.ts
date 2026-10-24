import { protectedProcedure } from "../middlewares/auth";
import { publicProcedure, router } from "../trpc";
import { billingRouter } from "./billing";
import { organizationRouter } from "./organization/index";

export const appRouter = router({
  // Root utility procedures
  healthCheck: publicProcedure.query(() => "OK"),
  privateData: protectedProcedure.query(({ ctx }) => ({
    message: "This is private",
    user: ctx.session.user,
  })),

  // Feature namespaces
  billing: billingRouter,
  organization: organizationRouter,
});

export type AppRouter = typeof appRouter;
