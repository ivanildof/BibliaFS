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

    // Add creator_id and bible reference columns to podcasts
    await db.execute(sql`
      ALTER TABLE podcasts 
      ADD COLUMN IF NOT EXISTS creator_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS bible_book VARCHAR(100),
      ADD COLUMN IF NOT EXISTS bible_chapter INTEGER
    `);

    // Seed podcast data with sample episodes
    await db.execute(sql`
      INSERT INTO podcasts (id, title, description, author, category, language, image_url, total_episodes, is_active, access_level, episodes, created_at, updated_at) 
      SELECT 'pod-1', 'Seara News', 'Notícias e comentários cristãos semanais', 'Seara News Team', 'Notícias', 'pt', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop', 3, true, 'free', 
      '[{"id":"ep-1","title":"Episódio 1: Boas Novas","description":"Introdução ao podcast","audioData":"","duration":180,"publishedAt":"2024-01-01"},{"id":"ep-2","title":"Episódio 2: Fé e Esperança","description":"Mensagem de esperança","audioData":"","duration":240,"publishedAt":"2024-01-08"}]'::jsonb,
      NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM podcasts WHERE id = 'pod-1')
    `);

    await db.execute(sql`
      INSERT INTO podcasts (id, title, description, author, category, language, image_url, total_episodes, is_active, access_level, episodes, created_at, updated_at) 
      SELECT 'pod-2', 'Palavra de Deus', 'Reflexões diárias sobre a Palavra de Deus', 'Pastor João', 'Estudos', 'pt', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', 2, true, 'free',
      '[{"id":"ep-3","title":"Gênesis 1: A Criação","description":"Estudo sobre a criação","audioData":"","duration":300,"publishedAt":"2024-01-15"}]'::jsonb,
      NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM podcasts WHERE id = 'pod-2')
    `);

    await db.execute(sql`
      INSERT INTO podcasts (id, title, description, author, category, language, image_url, total_episodes, is_active, access_level, episodes, created_at, updated_at) 
      SELECT 'pod-3', 'Estudos Bíblicos', 'Análise profunda de passagens e contexto histórico', 'Dra. Maria Silva', 'Teologia', 'pt', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', 2, true, 'free',
      '[{"id":"ep-4","title":"O Evangelho de João","description":"Estudo teológico profundo","audioData":"","duration":360,"publishedAt":"2024-01-22"}]'::jsonb,
      NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM podcasts WHERE id = 'pod-3')
    `);
    
    // Create group_invites table for group invitations
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS group_invites (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id VARCHAR NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        invited_email VARCHAR(255),
        invited_phone VARCHAR(20),
        invite_code VARCHAR(50) UNIQUE,
        invited_by VARCHAR NOT NULL REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'pending',
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create group_messages table for group discussions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS group_messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id VARCHAR NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        reply_to_id VARCHAR,
        verse_reference TEXT,
        verse_text TEXT,
        message_type VARCHAR(20) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create index for faster message lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_group_messages_group 
      ON group_messages(group_id, created_at DESC)
    `);

    // Create group_discussions table for AI-structured Q&A sessions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS group_discussions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id VARCHAR NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        created_by_id VARCHAR NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        question TEXT NOT NULL,
        verse_reference TEXT,
        verse_text TEXT,
        ai_synthesis TEXT,
        synthesized_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'open',
        allow_anonymous BOOLEAN DEFAULT false,
        deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create group_answers table for member responses
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS group_answers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        discussion_id VARCHAR NOT NULL REFERENCES group_discussions(id) ON DELETE CASCADE,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        verse_reference TEXT,
        review_status VARCHAR(20) DEFAULT 'pending',
        review_comment TEXT,
        reviewed_by_id VARCHAR REFERENCES users(id),
        reviewed_at TIMESTAMP,
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for faster lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_group_discussions_group 
      ON group_discussions(group_id, created_at DESC)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_group_answers_discussion 
      ON group_answers(discussion_id, created_at DESC)
    `);

    // Create email_otp table for OTP verification
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS email_otp (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_email_otp_email 
      ON email_otp(email)
    `);

    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    // Don't throw - let the app continue even if migrations fail
  }
}
