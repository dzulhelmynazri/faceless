import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../prisma/generated/client";
import type { DatabaseConfig } from "./config";

export const createPrismaClient = (env: DatabaseConfig) => {
  const adapter = new PrismaNeon({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
};

export type Database = ReturnType<typeof createPrismaClient>;
