// Database connection configuration
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

neonConfig.webSocketConstructor = ws;

function getDatabaseUrl(): string {
  // First, use SUPABASE_DATABASE_URL (production - external database)
  if (process.env.SUPABASE_DATABASE_URL && process.env.SUPABASE_DATABASE_URL.startsWith('postgresql://')) {
    console.log("[Database] Using Supabase database");
    return process.env.SUPABASE_DATABASE_URL;
  }

  // Fallback to internal Replit database
  try {
    const envCachePath = join(process.env.HOME || '/home/runner', 'workspace/.cache/replit/env/latest.json');
    const envCache = JSON.parse(readFileSync(envCachePath, 'utf8'));
    if (envCache.environment?.DATABASE_URL && envCache.environment.DATABASE_URL.startsWith('postgresql://')) {
      return envCache.environment.DATABASE_URL;
    }
  } catch (e) {
    // Ignore cache read errors
  }

  // Last resort - try environment variable
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    return process.env.DATABASE_URL;
  }

  throw new Error(
    "No valid database URL found. Ensure SUPABASE_DATABASE_URL is set.",
  );
}

const databaseUrl = getDatabaseUrl();
export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
