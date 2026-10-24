import type { Auth, createAuth } from "@faceless/auth";
import type { Database } from "@faceless/db";
import type { Files } from "@faceless/storage";
import type { Autumn } from "autumn-js";

export interface Context {
  auth: Auth;
  autumn: Autumn;
  db: Database;
  files: Files;
  session: Awaited<
    ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>
  >;
}
