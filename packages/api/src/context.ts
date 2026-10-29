import type { Auth, createAuth, TestAuth } from "@faceless/auth";
import type { Database } from "@faceless/db";
import type { VideoRendererService } from "@faceless/remotion/server";
import type { SocialClient } from "@faceless/socials";
import type { Files } from "@faceless/storage";
import type { Autumn } from "autumn-js";

export interface Context {
  auth: Auth | TestAuth;
  autumn: Autumn;
  baseUrl: string;
  db: Database;
  files: Files;
  session: Awaited<
    ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>
  >;
  socials: SocialClient;
  videoRenderer: VideoRendererService;
}
