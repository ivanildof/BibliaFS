-- ============================================
-- BÍBLIA+ v2.0 - Production Database Schema
-- Execute this SQL in your production PostgreSQL database
-- Last updated: 2025-11-25
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS AND PROFILES
-- ============================================

-- Main users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR(255),
    username VARCHAR(255),
    full_name VARCHAR(255),
    display_name VARCHAR(255),
    avatar_url TEXT,
    profile_image TEXT,
    profile_type VARCHAR(50) NOT NULL DEFAULT 'basic_user',
    -- Profiles: super_admin, church_admin, group_leader, advanced_study, premium_user, basic_user
    church_id VARCHAR REFERENCES churches(id),
    theological_background TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    subscription_expires_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}'::JSONB,
    selected_theme VARCHAR(50) DEFAULT 'default',
    custom_theme JSONB
);

-- Sessions table (managed by connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);

-- Churches/Organizations table
CREATE TABLE IF NOT EXISTS churches (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    denomination VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    sso_config JSONB,
    admin_id VARCHAR REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community groups table
CREATE TABLE IF NOT EXISTS groups (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    church_id VARCHAR REFERENCES churches(id),
    leader_id VARCHAR REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members
CREATE TABLE IF NOT EXISTS group_members (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    group_id VARCHAR REFERENCES groups(id) NOT NULL,
    user_id VARCHAR REFERENCES users(id) NOT NULL,
    role VARCHAR(20) DEFAULT 'member', -- member, moderator, leader
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- ============================================
-- 2. BIBLE CONTENT
-- ============================================

-- Bible translations
CREATE TABLE IF NOT EXISTS bible_translations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL, -- 'NVI', 'ARA', 'ACF', etc.
    language VARCHAR(50) NOT NULL DEFAULT 'portuguese',
    abbreviation VARCHAR(10) NOT NULL,
    copyright_info TEXT,
    is_available BOOLEAN DEFAULT true,
    access_level VARCHAR(20) DEFAULT 'free' -- free, premium, advanced
);

-- Bible books
CREATE TABLE IF NOT EXISTS bible_books (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    testament VARCHAR(10) NOT NULL, -- old, new
    order_index INTEGER NOT NULL,
    chapter_count INTEGER NOT NULL
);

-- Bible chapters
CREATE TABLE IF NOT EXISTS bible_chapters (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    book_id VARCHAR REFERENCES bible_books(id) NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_count INTEGER NOT NULL,
    UNIQUE(book_id, chapter_number)
);

-- Bible verses
CREATE TABLE IF NOT EXISTS bible_verses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    translation_id VARCHAR REFERENCES bible_translations(id) NOT NULL,
    book_id VARCHAR REFERENCES bible_books(id) NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(translation_id, book_id, chapter_number, verse_number)
);

-- Cross references between verses
CREATE TABLE IF NOT EXISTS cross_references (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source_verse_id VARCHAR REFERENCES bible_verses(id) NOT NULL,
    target_verse_id VARCHAR REFERENCES bible_verses(id) NOT NULL,
    reference_type VARCHAR(50), -- parallel, explanation, prophecy, etc.
    strength_score DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PERSONAL STUDY
-- ============================================

-- Reading plans
CREATE TABLE IF NOT EXISTS reading_plans (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR REFERENCES users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) NOT NULL, -- chronological, thematic, book_by_book
    schedule JSONB NOT NULL,
    duration_days INTEGER NOT NULL,
    total_days INTEGER,
    current_day INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading plan items
CREATE TABLE IF NOT EXISTS reading_plan_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_id VARCHAR REFERENCES reading_plans(id) NOT NULL,
    book_id VARCHAR REFERENCES bible_books(id),
    book VARCHAR(50),
    chapter_number INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    user_notes TEXT
);

-- Reading history
CREATE TABLE IF NOT EXISTS reading_history (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR REFERENCES users(id) NOT NULL,
    book VARCHAR(50) NOT NULL,
    chapter_number INTEGER NOT NULL,
    translation_id VARCHAR REFERENCES bible_translations(id),
    read_duration_seconds INTEGER,
    read_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verse highlights
CREATE TABLE IF NOT EXISTS highlights (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    book VARCHAR NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    version VARCHAR NOT NULL,
    verse_id VARCHAR REFERENCES bible_verses(id),
    color VARCHAR(20) NOT NULL, -- yellow, blue, green, pink, purple, orange
    highlight_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    book VARCHAR NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER,
    version VARCHAR NOT NULL,
    title VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal notes
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    book VARCHAR NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER,
    version VARCHAR NOT NULL,
    verse_id VARCHAR REFERENCES bible_verses(id),
    note_title VARCHAR(255),
    content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'personal', -- personal, study, sermon
    tags VARCHAR[],
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated verse commentaries
CREATE TABLE IF NOT EXISTS verse_commentaries (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    book VARCHAR NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    version VARCHAR NOT NULL,
    commentary TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prayers journal
CREATE TABLE IF NOT EXISTS prayers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    prayer_type VARCHAR(50) DEFAULT 'request', -- request, thanksgiving, confession
    category VARCHAR(100),
    emotional_state VARCHAR(50), -- happy, sad, anxious, peaceful
    audio_url VARCHAR,
    audio_duration INTEGER,
    location JSONB,
    is_answered BOOLEAN DEFAULT false,
    answered_at TIMESTAMPTZ,
    answer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. COMMUNITY
-- ============================================

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    group_id VARCHAR REFERENCES groups(id),
    verse_id VARCHAR REFERENCES bible_verses(id),
    scripture_reference JSONB,
    title VARCHAR(255),
    content TEXT NOT NULL,
    post_type VARCHAR(50) DEFAULT 'reflection', -- reflection, question, testimony
    tags VARCHAR[],
    is_public BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id VARCHAR REFERENCES community_posts(id) NOT NULL,
    user_id VARCHAR NOT NULL,
    parent_comment_id VARCHAR REFERENCES post_comments(id), -- For replies
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id VARCHAR REFERENCES community_posts(id),
    user_id VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Reactions (advanced)
CREATE TABLE IF NOT EXISTS post_reactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id VARCHAR REFERENCES community_posts(id),
    comment_id VARCHAR REFERENCES post_comments(id),
    user_id VARCHAR NOT NULL,
    reaction_type VARCHAR(20) NOT NULL, -- like, love, thankful, insightful
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. GAMIFICATION
-- ============================================

-- User progress (XP, levels, streaks)
CREATE TABLE IF NOT EXISTS user_progress (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL UNIQUE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    last_reading_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements definitions
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    achievement_type VARCHAR(50) NOT NULL, -- reading, community, consistency
    requirement_value INTEGER NOT NULL,
    requirement_metric VARCHAR(50) NOT NULL, -- days_streak, chapters_read, etc.
    tier VARCHAR(20) DEFAULT 'bronze' -- bronze, silver, gold, platinum
);

-- User achievements
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    achievement_type VARCHAR NOT NULL,
    achievement_id VARCHAR REFERENCES achievement_definitions(id),
    achievement_value INTEGER DEFAULT 1,
    progress_value INTEGER DEFAULT 0,
    is_unlocked BOOLEAN DEFAULT false,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CONTENT & MEDIA
-- ============================================

-- Podcasts
CREATE TABLE IF NOT EXISTS podcasts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(255),
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'pt',
    rss_feed VARCHAR NOT NULL UNIQUE,
    image_url TEXT,
    total_episodes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    access_level VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Podcast subscriptions
CREATE TABLE IF NOT EXISTS podcast_subscriptions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    podcast_id VARCHAR REFERENCES podcasts(id) NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, podcast_id)
);

-- Lessons (Teacher Mode)
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    teacher_id VARCHAR NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    tags VARCHAR[],
    scripture_references JSONB,
    resources JSONB,
    objectives TEXT[],
    content_blocks JSONB,
    questions JSONB,
    is_published BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson enrollments
CREATE TABLE IF NOT EXISTS lesson_enrollments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lesson_id VARCHAR REFERENCES lessons(id) NOT NULL,
    student_id VARCHAR NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ
);

-- Additional content (devotionals, study guides)
CREATE TABLE IF NOT EXISTS additional_content (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL, -- podcast, devotional, study_guide
    audio_url TEXT,
    duration_seconds INTEGER,
    author VARCHAR(255),
    access_level VARCHAR(20) DEFAULT 'premium',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content-Bible verse references
CREATE TABLE IF NOT EXISTS content_verse_references (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_id VARCHAR REFERENCES additional_content(id) NOT NULL,
    verse_id VARCHAR REFERENCES bible_verses(id) NOT NULL,
    relevance_score DECIMAL(3,2) DEFAULT 1.0,
    UNIQUE(content_id, verse_id)
);

-- ============================================
-- 7. DAILY & OFFLINE
-- ============================================

-- Daily verses
CREATE TABLE IF NOT EXISTS daily_verses (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    day_of_year INTEGER NOT NULL UNIQUE,
    book VARCHAR NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    version VARCHAR NOT NULL,
    theme VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offline content cache
CREATE TABLE IF NOT EXISTS offline_content (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    book VARCHAR NOT NULL,
    chapter INTEGER NOT NULL,
    version VARCHAR NOT NULL,
    content JSONB NOT NULL,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, book, chapter, version)
);

-- ============================================
-- 8. PAYMENTS (STRIPE)
-- ============================================

-- Donations
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'BRL',
    type VARCHAR(50) NOT NULL, -- one_time, recurring
    stripe_payment_id VARCHAR,
    stripe_subscription_id VARCHAR,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_church ON users(church_id);

-- Bible content indexes
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter_verse ON bible_verses(book_id, chapter_number, verse_number);
CREATE INDEX IF NOT EXISTS idx_bible_verses_translation ON bible_verses(translation_id);
CREATE INDEX IF NOT EXISTS idx_bible_verses_text_search ON bible_verses USING gin(to_tsvector('portuguese', verse_text));

-- User data indexes
CREATE INDEX IF NOT EXISTS idx_reading_history_user_date ON reading_history(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_location ON highlights(book, chapter);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_location ON notes(book, chapter);
CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_user_created ON prayers(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_commentaries_user ON verse_commentaries(user_id, book, chapter, verse);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_created ON community_posts(group_id, created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created ON post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_progress ON achievements(user_id, is_unlocked, progress_value);

-- Reading plans indexes
CREATE INDEX IF NOT EXISTS idx_reading_plans_user_id ON reading_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_plans_user_active ON reading_plans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_reading_plan_items_plan_day ON reading_plan_items(plan_id, day_number);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_lesson_id ON lesson_enrollments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON lesson_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_podcast_subs_user_id ON podcast_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_verses_day ON daily_verses(day_of_year);
CREATE INDEX IF NOT EXISTS idx_offline_content_user_id ON offline_content(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);

-- ============================================
-- 10. TRIGGERS
-- ============================================

-- Update trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'users', 'churches', 'groups', 'reading_plans', 'prayers', 
        'notes', 'highlights', 'podcasts', 'lessons', 'community_posts',
        'post_comments', 'user_progress', 'achievements'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at 
            BEFORE UPDATE ON %s 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END;
$$;

-- ============================================
-- 11. INITIAL DATA (Optional)
-- ============================================

-- Insert default achievement definitions
INSERT INTO achievement_definitions (id, name, description, achievement_type, requirement_value, requirement_metric, tier) VALUES
    ('ach_first_chapter', 'Primeiro Capítulo', 'Leia seu primeiro capítulo', 'reading', 1, 'chapters_read', 'bronze'),
    ('ach_10_chapters', 'Leitor Dedicado', 'Leia 10 capítulos', 'reading', 10, 'chapters_read', 'bronze'),
    ('ach_50_chapters', 'Estudioso', 'Leia 50 capítulos', 'reading', 50, 'chapters_read', 'silver'),
    ('ach_100_chapters', 'Mestre da Palavra', 'Leia 100 capítulos', 'reading', 100, 'chapters_read', 'gold'),
    ('ach_7_streak', 'Semana de Fé', '7 dias consecutivos', 'consistency', 7, 'days_streak', 'bronze'),
    ('ach_30_streak', 'Mês de Fidelidade', '30 dias consecutivos', 'consistency', 30, 'days_streak', 'silver'),
    ('ach_100_streak', 'Centurião', '100 dias consecutivos', 'consistency', 100, 'days_streak', 'gold'),
    ('ach_365_streak', 'Ano de Devoção', '365 dias consecutivos', 'consistency', 365, 'days_streak', 'platinum'),
    ('ach_first_post', 'Voz Ativa', 'Faça seu primeiro post', 'community', 1, 'posts_created', 'bronze'),
    ('ach_10_posts', 'Comunicador', 'Faça 10 posts', 'community', 10, 'posts_created', 'silver'),
    ('ach_first_prayer', 'Oração Registrada', 'Registre sua primeira oração', 'prayer', 1, 'prayers_created', 'bronze'),
    ('ach_50_prayers', 'Guerreiro de Oração', 'Registre 50 orações', 'prayer', 50, 'prayers_created', 'gold'),
    ('ach_first_highlight', 'Destaque', 'Faça seu primeiro destaque', 'study', 1, 'highlights_created', 'bronze'),
    ('ach_first_note', 'Anotador', 'Faça sua primeira anotação', 'study', 1, 'notes_created', 'bronze'),
    ('ach_complete_plan', 'Plano Completo', 'Complete um plano de leitura', 'reading', 1, 'plans_completed', 'silver'),
    ('ach_nt_complete', 'Novo Testamento', 'Leia todo o Novo Testamento', 'reading', 260, 'nt_chapters', 'gold'),
    ('ach_ot_complete', 'Antigo Testamento', 'Leia todo o Antigo Testamento', 'reading', 929, 'ot_chapters', 'platinum'),
    ('ach_bible_complete', 'Bíblia Completa', 'Leia a Bíblia inteira', 'reading', 1189, 'total_chapters', 'platinum')
ON CONFLICT DO NOTHING;

-- ============================================
-- END OF SCHEMA
-- ============================================
