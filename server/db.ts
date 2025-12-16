// Database connection configuration
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

function getDatabaseUrl(): string {
  // Use SUPABASE_DATABASE_URL only
  if (process.env.SUPABASE_DATABASE_URL && process.env.SUPABASE_DATABASE_URL.startsWith('postgresql://')) {
    console.log("[Database] Using Supabase database");
    return process.env.SUPABASE_DATABASE_URL;
  }

  throw new Error(
    "SUPABASE_DATABASE_URL environment variable is required",
  );
}

const databaseUrl = getDatabaseUrl();
export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
