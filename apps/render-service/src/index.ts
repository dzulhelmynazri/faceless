import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
import { createFiles } from "@faceless/storage";

import { createRenderApp } from "./app";
import { env } from "./env.server";

const storage = createFiles(env);
const renderer = new LocalRemotionRenderer();

export const app = createRenderApp({ env, renderer, storage });

export default {
  fetch: app.fetch,
  port: env.PORT,
};
