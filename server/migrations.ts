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

    // Add password_hash column to users table for email/password auth
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);

    // Add subscription columns to users table
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free'
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255)
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ai_requests_today INTEGER DEFAULT 0
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ai_requests_reset_at TIMESTAMP
    `);

    // Add AI spending tracking columns for 25% budget limit
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ai_spend_month NUMERIC(10, 4) DEFAULT 0
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ai_spend_year NUMERIC(10, 4) DEFAULT 0
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ai_monthly_budget_limit NUMERIC(10, 4) DEFAULT 0
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ai_annual_budget_limit NUMERIC(10, 4) DEFAULT 0
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ai_spend_month_reset_at TIMESTAMP
    `);

    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ai_spend_year_reset_at TIMESTAMP
    `);

    // Create audio_cache table for caching generated TTS audio
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audio_cache (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        language VARCHAR(10) NOT NULL,
        version VARCHAR(20) NOT NULL,
        book VARCHAR(50) NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER,
        audio_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create index for faster audio cache lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_audio_cache 
      ON audio_cache(language, version, book, chapter, verse)
    `);

    // Add missing category column to podcasts table
    await db.execute(sql`
      ALTER TABLE podcasts 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100)
    `);
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    // Don't throw - let the app continue even if migrations fail
  }
}
