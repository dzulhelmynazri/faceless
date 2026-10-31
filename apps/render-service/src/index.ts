import { LocalRemotionRenderer } from "@faceless/remotion/server/local";
import { createFiles } from "@faceless/storage";

import { createRenderApp } from "./app";
import { ENV as env } from "./env";

const storage = createFiles(env);

const renderer = new LocalRemotionRenderer({
  browserExecutable: env.BROWSER_EXECUTABLE_PATH,
});

export const app = createRenderApp({ env, renderer, storage });

export default {
  fetch: app.fetch,
  port: env.PORT,
};
