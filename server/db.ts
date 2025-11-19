// Blueprint: javascript_database
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

neonConfig.webSocketConstructor = ws;

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  try {
    const envCachePath = join(process.env.HOME || '/home/runner', 'workspace/.cache/replit/env/latest.json');
    const envCache = JSON.parse(readFileSync(envCachePath, 'utf8'));
    if (envCache.environment?.DATABASE_URL) {
      return envCache.environment.DATABASE_URL;
    }
  } catch (e) {
  }

  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const databaseUrl = getDatabaseUrl();
export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
