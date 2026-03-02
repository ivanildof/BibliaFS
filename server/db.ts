// Database connection configuration
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

function getDatabaseUrl(): string | null {
  // Use SUPABASE_DATABASE_URL only
  if (process.env.SUPABASE_DATABASE_URL && process.env.SUPABASE_DATABASE_URL.startsWith('postgresql://')) {
    console.log("[Database] Using Supabase database");
    return process.env.SUPABASE_DATABASE_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn("[Database] no SUPABASE_DATABASE_URL provided, running in preview mode");
    return null;
  }

  throw new Error(
    "SUPABASE_DATABASE_URL environment variable is required",
  );
}

const databaseUrl = getDatabaseUrl();

// Flag that other modules can check to see if a real database is configured.
export const hasDatabase = Boolean(databaseUrl);

// If we don't have a database URL we create a dummy pool which resolves with
// empty results. This allows the server to start and the client to load
// without crashing while we configure Supabase later.
class DummyPool {
  query() {
    return Promise.resolve({ rows: [] });
  }
}

export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : new DummyPool() as any;
export const db = databaseUrl ? drizzle({ client: pool as Pool, schema }) : {} as any;
