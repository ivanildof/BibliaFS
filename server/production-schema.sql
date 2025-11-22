-- Bíblia+ v2.0 - Complete Production Database Schema
-- Execute this SQL file manually in your production PostgreSQL database
-- Last updated: 2025-11-22

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (managed by Replit Auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  username VARCHAR NOT NULL,
  email VARCHAR,
  display_name VARCHAR,
  profile_image VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (managed by connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);

-- Reading plans
CREATE TABLE IF NOT EXISTS reading_plans (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  schedule JSONB NOT NULL,
  total_days INTEGER,
  current_day INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reading_plans_user_id ON reading_plans (user_id);

-- Prayers
CREATE TABLE IF NOT EXISTS prayers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT,
  category VARCHAR,
  audio_url VARCHAR,
  audio_duration INTEGER,
  location JSONB,
  is_answered BOOLEAN DEFAULT false,
  answered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers (user_id);

-- Highlights
CREATE TABLE IF NOT EXISTS highlights (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  book VARCHAR NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  version VARCHAR NOT NULL,
  color VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON highlights (user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_location ON highlights (book, chapter);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  book VARCHAR NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER,
  version VARCHAR NOT NULL,
  title VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  book VARCHAR NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER,
  version VARCHAR NOT NULL,
  content TEXT NOT NULL,
  tags VARCHAR[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes (user_id);
CREATE INDEX IF NOT EXISTS idx_notes_location ON notes (book, chapter);

-- Podcasts
CREATE TABLE IF NOT EXISTS podcasts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  author VARCHAR,
  category VARCHAR,
  language VARCHAR DEFAULT 'pt',
  rss_feed VARCHAR NOT NULL UNIQUE,
  image_url VARCHAR,
  total_episodes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Podcast subscriptions
CREATE TABLE IF NOT EXISTS podcast_subscriptions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  podcast_id VARCHAR NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_podcast_subs_user_id ON podcast_subscriptions (user_id);

-- Lessons (Teacher Mode)
CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  content TEXT,
  tags VARCHAR[],
  scripture_references JSONB,
  resources JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons (teacher_id);

-- Lesson enrollments (students)
CREATE TABLE IF NOT EXISTS lesson_enrollments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id VARCHAR NOT NULL,
  student_id VARCHAR NOT NULL,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_enrollments_lesson_id ON lesson_enrollments (lesson_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON lesson_enrollments (student_id);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  scripture_reference JSONB,
  tags VARCHAR[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts (user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts (created_at DESC);

-- Community post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes (post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes (user_id);

-- Gamification: User progress
CREATE TABLE IF NOT EXISTS user_progress (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id);

-- Gamification: Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  achievement_type VARCHAR NOT NULL,
  achievement_value INTEGER DEFAULT 1,
  earned_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements (user_id);

-- Daily verses
CREATE TABLE IF NOT EXISTS daily_verses (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_year INTEGER NOT NULL UNIQUE,
  book VARCHAR NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  version VARCHAR NOT NULL,
  theme VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_daily_verses_day ON daily_verses (day_of_year);

-- Offline content (user-specific chapter downloads)
CREATE TABLE IF NOT EXISTS offline_content (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  book VARCHAR NOT NULL,
  chapter INTEGER NOT NULL,
  version VARCHAR NOT NULL,
  content JSONB NOT NULL,
  downloaded_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book, chapter, version)
);
CREATE INDEX IF NOT EXISTS idx_offline_content_user_id ON offline_content (user_id);

-- Donations (Stripe integration foundation - requires completion)
CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR DEFAULT 'BRL',
  type VARCHAR NOT NULL,
  stripe_payment_id VARCHAR,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations (user_id);

-- Update trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_reading_plans_updated_at BEFORE UPDATE ON reading_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayers_updated_at BEFORE UPDATE ON prayers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON podcasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- End of schema
