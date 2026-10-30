import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
import { createFiles } from "@faceless/storage";
import { serve } from "@hono/node-server";

import { createRenderApp } from "./app";
import { env } from "./env.server";

const storage = createFiles(env);
const renderer = new LocalRemotionRenderer();

export const app = createRenderApp({ env, renderer, storage });

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
});

process.on("SIGINT", () => {
  server.close();
});

process.on("SIGTERM", () => {
  server.close();
});

export default app;
