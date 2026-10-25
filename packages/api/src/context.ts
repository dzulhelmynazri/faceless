import type { Auth, createAuth } from "@faceless/auth";
import type { Database } from "@faceless/db";
import type { SocialClient } from "@faceless/socials";
import type { Files } from "@faceless/storage";
import type { Autumn } from "autumn-js";

export interface Context {
  auth: Auth;
  autumn: Autumn;
  baseUrl: string;
  db: Database;
  files: Files;
  session: Awaited<
    ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>
  >;
  socials: SocialClient;
}
