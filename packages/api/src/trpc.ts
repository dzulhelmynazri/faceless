import { initTRPC } from "@trpc/server";
import { z, ZodError } from "zod";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    return {
      ...opts.shape,
      data: {
        ...opts.shape.data,
        zodError:
          opts.error.code === "BAD_REQUEST" &&
          opts.error.cause instanceof ZodError
            ? z.treeifyError(opts.error.cause)
            : null,
      },
    };
  },
});

export const { createCallerFactory, mergeRouters, middleware, router } = t;

export const publicProcedure = t.procedure;
