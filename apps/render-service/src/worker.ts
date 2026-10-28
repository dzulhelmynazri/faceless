import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export class RemotionRendererContainer extends Container {
  defaultPort = 8080;
  sleepAfter = "10m";
}

interface Env {
  REMOTION_RENDERER: DurableObjectNamespace<RemotionRendererContainer>;
}

const app = new Hono<{ Bindings: Env }>();

app.all("*", async (c) => {
  const container = getContainer(c.env.REMOTION_RENDERER, "default-renderer");

  return await container.fetch(c.req.raw);
});

export default app;
