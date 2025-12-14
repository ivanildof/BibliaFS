// Blueprint: javascript_database
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

neonConfig.webSocketConstructor = ws;

function getDatabaseUrl(): string {
  // First, try to get from envCache (Replit's internal database)
  try {
    const envCachePath = join(process.env.HOME || '/home/runner', 'workspace/.cache/replit/env/latest.json');
    const envCache = JSON.parse(readFileSync(envCachePath, 'utf8'));
    if (envCache.environment?.DATABASE_URL && envCache.environment.DATABASE_URL.startsWith('postgresql://')) {
      return envCache.environment.DATABASE_URL;
    }
  } catch (e) {
    // Ignore cache read errors
  }

  // Fallback to environment variable if it's a valid PostgreSQL URL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    return process.env.DATABASE_URL;
  }

  // Try SUPABASE_DATABASE_URL as last resort
  if (process.env.SUPABASE_DATABASE_URL && process.env.SUPABASE_DATABASE_URL.startsWith('postgresql://')) {
    return process.env.SUPABASE_DATABASE_URL;
  }

  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const databaseUrl = getDatabaseUrl();
export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
