// Database connection - Compatible with Supabase/PostgreSQL
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

function getDatabaseUrl(): string {
  // Check for DATABASE_URL environment variable (should be set as Replit secret)
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database or add the secret?",
    );
  }
  
  // Validate it looks like a proper connection string
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('DATABASE_URL does not appear to be a valid PostgreSQL connection string');
    console.error('Expected format: postgresql://user:password@host:port/database');
    throw new Error('Invalid DATABASE_URL format');
  }
  
  // Log connection info (without password) for debugging
  try {
    const url = new URL(dbUrl);
    console.log(`Connecting to database: ${url.hostname}:${url.port}${url.pathname}`);
  } catch (e) {
    console.log('Connecting to database...');
  }
  
  return dbUrl;
}

const databaseUrl = getDatabaseUrl();
export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});
export const db = drizzle(pool, { schema });
