import { defineNodeInstrumentation } from "evlog/next/instrumentation";

export const { register, onRequestError } = defineNodeInstrumentation(
  async () => await import("./src/lib/evlog")
);
