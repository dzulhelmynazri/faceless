import { createAuth } from "@faceless/auth";
import { createPrismaClient } from "@faceless/db";
import type { Database } from "@faceless/db";
import { createEmail } from "@faceless/email";
import { createFiles } from "@faceless/storage";
import { Autumn } from "autumn-js";

import { env } from "./env.server";

const db = createPrismaClient(env);

export const getDb = (): Database => db;

export const auth = createAuth(env, db);
export const files = createFiles(env);
export const email = createEmail(env);
export const autumn = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });
