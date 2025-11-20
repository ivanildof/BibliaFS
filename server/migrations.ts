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

    // Add missing columns to reading_plans table
    await db.execute(sql`
      ALTER TABLE reading_plans 
      ADD COLUMN IF NOT EXISTS total_days INTEGER
    `);

    await db.execute(sql`
      ALTER TABLE reading_plans 
      ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT NOW()
    `);

    await db.execute(sql`
      ALTER TABLE reading_plans 
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP
    `);

    // Update existing plans with total_days from schedule length
    await db.execute(sql`
      UPDATE reading_plans 
      SET total_days = jsonb_array_length(schedule) 
      WHERE total_days IS NULL
    `);

    // Create audio tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audio_sources (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        fileset_id VARCHAR NOT NULL UNIQUE,
        version VARCHAR NOT NULL,
        language VARCHAR NOT NULL,
        display_name TEXT NOT NULL,
        audio_type VARCHAR DEFAULT 'drama',
        metadata JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audio_progress (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        book VARCHAR NOT NULL,
        chapter INTEGER NOT NULL,
        version VARCHAR NOT NULL,
        "current_time" INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT false,
        playback_speed VARCHAR DEFAULT '1.0',
        last_played_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create offline_content table for offline mode
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS offline_content (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        book VARCHAR NOT NULL,
        chapter INTEGER NOT NULL,
        version VARCHAR NOT NULL,
        size INTEGER DEFAULT 0,
        verse_count INTEGER DEFAULT 0,
        downloaded_at TIMESTAMP DEFAULT NOW(),
        last_accessed_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create index for faster offline lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_offline_content_user_book 
      ON offline_content(user_id, book, chapter, version)
    `);

    // Create daily_verses table for Versículo do Dia feature
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS daily_verses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        day_of_year INTEGER NOT NULL UNIQUE,
        book VARCHAR NOT NULL,
        chapter INTEGER NOT NULL,
        verse_number INTEGER NOT NULL,
        version VARCHAR DEFAULT 'nvi',
        "text" TEXT NOT NULL,
        reference VARCHAR NOT NULL,
        theme VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create donations table for Stripe integration
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS donations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        currency VARCHAR DEFAULT 'brl' NOT NULL,
        "type" VARCHAR NOT NULL,
        frequency VARCHAR,
        destination VARCHAR DEFAULT 'app_operations' NOT NULL,
        stripe_payment_intent_id VARCHAR,
        stripe_customer_id VARCHAR,
        stripe_subscription_id VARCHAR,
        status VARCHAR DEFAULT 'pending' NOT NULL,
        is_anonymous BOOLEAN DEFAULT false,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    // Don't throw - let the app continue even if migrations fail
  }
}
