import { sql } from "drizzle-orm";
import { db } from "./db";

export async function runMigrations() {
  try {
    console.log("Running database migrations...");
    
    // Add missing columns to bookmarks table
    await db.execute(sql`
      ALTER TABLE bookmarks 
      ADD COLUMN IF NOT EXISTS version VARCHAR DEFAULT 'nvi'
    `);
    
    await db.execute(sql`
      ALTER TABLE bookmarks 
      ADD COLUMN IF NOT EXISTS note TEXT
    `);
    
    await db.execute(sql`
      ALTER TABLE bookmarks 
      ADD COLUMN IF NOT EXISTS tags TEXT[]
    `);
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    // Don't throw - let the app continue even if migrations fail
  }
}
