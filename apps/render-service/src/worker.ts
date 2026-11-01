import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export interface Env {
  NODE_ENV: string;
  PORT: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_BUCKET: string;
  R2_PUBLIC_BASE_URL: string;
  R2_SECRET_ACCESS_KEY: string;
  REMOTION_RENDERER: DurableObjectNamespace<RemotionRendererContainer>;
  RENDER_SERVICE_TOKEN: string;
  RENDER_WEBHOOK_SECRET: string;
}

export class RemotionRendererContainer extends Container<Env> {
  defaultPort = 8080;
  enableInternet = true;
  sleepAfter = "10m";

  constructor(ctx: ConstructorParameters<typeof Container>[0], env: Env) {
    super(ctx, env);
    this.envVars = {
      BROWSER_EXECUTABLE_PATH: "/usr/bin/chromium",
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      PUPPETEER_EXECUTABLE_PATH: "/usr/bin/chromium",
      PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: "true",
      R2_ACCOUNT_ID: env.R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
      R2_BUCKET: env.R2_BUCKET,
      R2_PUBLIC_BASE_URL: env.R2_PUBLIC_BASE_URL,
      R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
      RENDER_SERVICE_TOKEN: env.RENDER_SERVICE_TOKEN,
      RENDER_WEBHOOK_SECRET: env.RENDER_WEBHOOK_SECRET,
    };
  }
}

const app = new Hono<{ Bindings: Env }>();

app.all("*", async (c) => {
  const container = getContainer(c.env.REMOTION_RENDERER, "default-renderer");

  return await container.fetch(c.req.raw);
});

export default app;
