-- =============================================================================
-- BIBLIA FS - BACKUP COMPLETO DO BANCO DE DADOS SUPABASE
-- Gerado em: $(date '+%Y-%m-%d %H:%M:%S')
-- =============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABELAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS achievement_definitions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    achievement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,
    requirement_metric VARCHAR(50) NOT NULL,
    tier VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name TEXT,
    description TEXT,
    icon VARCHAR(255),
    category VARCHAR(255),
    requirement JSONB,
    xp_reward INTEGER,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS additional_content (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL,
    audio_url TEXT,
    duration_seconds INTEGER,
    author VARCHAR(255),
    access_level VARCHAR(20),
    is_active BOOLEAN,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audio_cache (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    language VARCHAR(10) NOT NULL,
    version VARCHAR(20) NOT NULL,
    book VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER,
    audio_data TEXT NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bible_books (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    testament VARCHAR(10) NOT NULL,
    order_index INTEGER NOT NULL,
    chapter_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bible_chapters (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    book_id VARCHAR(255) NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bible_settings (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    preferred_version VARCHAR(255),
    font_size INTEGER,
    line_height INTEGER,
    verse_numbers BOOLEAN,
    red_letters BOOLEAN,
    last_book TEXT,
    last_chapter INTEGER,
    last_verse INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bible_translations (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(50),
    abbreviation VARCHAR(10) NOT NULL,
    copyright_info TEXT,
    is_available BOOLEAN,
    access_level VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS bible_verses (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    translation_id VARCHAR(255) NOT NULL,
    book_id VARCHAR(255) NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    version VARCHAR(255),
    title VARCHAR(255),
    note TEXT,
    tags TEXT[],
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS churches (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    denomination VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    sso_config JSONB,
    admin_id VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    group_id VARCHAR(255),
    verse_id VARCHAR(255),
    verse_reference TEXT NOT NULL,
    verse_text TEXT NOT NULL,
    scripture_reference JSONB,
    title VARCHAR(255),
    note TEXT NOT NULL,
    content TEXT,
    post_type VARCHAR(50),
    tags TEXT[],
    is_public BOOLEAN,
    like_count INTEGER,
    likes_count INTEGER,
    comment_count INTEGER,
    comments_count INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_verse_references (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    content_id VARCHAR(255) NOT NULL,
    verse_id VARCHAR(255) NOT NULL,
    relevance_score NUMERIC
);

CREATE TABLE IF NOT EXISTS cross_references (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    source_verse_id VARCHAR(255) NOT NULL,
    target_verse_id VARCHAR(255) NOT NULL,
    reference_type VARCHAR(50),
    strength_score NUMERIC,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_verses (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    day_of_year INTEGER NOT NULL,
    book VARCHAR(255) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    version VARCHAR(255) NOT NULL,
    theme VARCHAR(100),
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(10),
    type VARCHAR(50) NOT NULL,
    stripe_payment_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(20),
    created_at TIMESTAMP,
    completed_at TIMESTAMP,
    frequency VARCHAR(255),
    destination VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    is_anonymous BOOLEAN,
    message TEXT,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_otp (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    score INTEGER,
    comment TEXT,
    created_at TIMESTAMP,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS group_answers (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    discussion_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    verse_reference TEXT,
    review_status VARCHAR(20),
    review_comment TEXT,
    reviewed_by_id VARCHAR(255),
    reviewed_at TIMESTAMP,
    is_anonymous BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_discussions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL,
    created_by_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    question TEXT NOT NULL,
    verse_reference TEXT,
    verse_text TEXT,
    ai_synthesis TEXT,
    synthesized_at TIMESTAMP,
    status VARCHAR(20),
    allow_anonymous BOOLEAN,
    deadline TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_invites (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL,
    invited_email VARCHAR(255),
    invited_phone VARCHAR(20),
    invite_code VARCHAR(50),
    invited_by VARCHAR(255) NOT NULL,
    status VARCHAR(20),
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_members (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20),
    joined_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_messages (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    reply_to_id VARCHAR(255),
    verse_reference TEXT,
    verse_text TEXT,
    message_type VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    church_id VARCHAR(255),
    leader_id VARCHAR(255),
    is_public BOOLEAN,
    max_members INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS highlights (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    version VARCHAR(255),
    verse_id VARCHAR(255),
    color VARCHAR(255) NOT NULL,
    highlight_text TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    lesson_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    progress INTEGER,
    is_completed BOOLEAN,
    score INTEGER,
    answers JSONB,
    enrolled_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    teacher_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    tags TEXT[],
    scripture_references JSONB,
    resources JSONB,
    objectives TEXT[],
    questions JSONB,
    scheduled_for TIMESTAMP,
    is_published BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER,
    version VARCHAR(255),
    verse_id VARCHAR(255),
    note_title VARCHAR(255),
    content TEXT NOT NULL,
    note_type VARCHAR(50),
    tags TEXT[],
    is_public BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_history (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    sent_at TIMESTAMP,
    clicked BOOLEAN,
    clicked_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    reading_reminders BOOLEAN,
    reading_reminder_time VARCHAR(5),
    prayer_reminders BOOLEAN,
    prayer_reminder_time VARCHAR(5),
    daily_verse_notification BOOLEAN,
    daily_verse_time VARCHAR(5),
    community_activity BOOLEAN,
    teacher_mode_updates BOOLEAN,
    weekend_only BOOLEAN,
    timezone VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offline_content (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book VARCHAR(255) NOT NULL,
    chapter INTEGER NOT NULL,
    version VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    size INTEGER,
    verse_count INTEGER,
    downloaded_at TIMESTAMP,
    last_accessed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS podcast_subscriptions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    podcast_id VARCHAR(255) NOT NULL,
    current_episode_id TEXT,
    current_position INTEGER,
    subscribed_at TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS podcasts (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    author VARCHAR(255),
    category VARCHAR(100),
    language VARCHAR(10),
    image_url TEXT,
    rss_url TEXT,
    rss_feed VARCHAR(255),
    total_episodes INTEGER,
    is_active BOOLEAN,
    access_level VARCHAR(20),
    episodes JSONB,
    subscriber_count INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    creator_id VARCHAR(255),
    bible_book VARCHAR(100),
    bible_chapter INTEGER
);

CREATE TABLE IF NOT EXISTS post_comments (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    parent_comment_id VARCHAR(255),
    content TEXT NOT NULL,
    like_count INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_likes (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_reactions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    post_id VARCHAR(255),
    comment_id VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prayers (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    prayer_type VARCHAR(50),
    category VARCHAR(100),
    emotional_state VARCHAR(50),
    audio_url TEXT,
    audio_duration INTEGER,
    location JSONB,
    is_answered BOOLEAN,
    answered_at TIMESTAMP,
    answer_notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reading_history (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book VARCHAR(50) NOT NULL,
    chapter_number INTEGER NOT NULL,
    translation_id VARCHAR(255),
    read_duration_seconds INTEGER,
    read_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reading_plan_items (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    plan_id VARCHAR(255) NOT NULL,
    book_id VARCHAR(255),
    book VARCHAR(50),
    chapter_number INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    is_completed BOOLEAN,
    completed_at TIMESTAMP,
    user_notes TEXT
);

CREATE TABLE IF NOT EXISTS reading_plan_templates (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    category VARCHAR(255),
    schedule JSONB NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reading_plans (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    template_id VARCHAR(255),
    title TEXT NOT NULL,
    name VARCHAR(255),
    description TEXT,
    plan_type VARCHAR(50),
    schedule JSONB NOT NULL,
    duration_days INTEGER,
    total_days INTEGER NOT NULL,
    current_day INTEGER,
    is_public BOOLEAN,
    is_active BOOLEAN,
    is_completed BOOLEAN,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) NOT NULL PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    achievement_id VARCHAR(255),
    achievement_type VARCHAR(255),
    achievement_value INTEGER,
    progress INTEGER,
    progress_value INTEGER,
    is_unlocked BOOLEAN,
    unlocked_at TIMESTAMP,
    earned_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    total_xp INTEGER,
    level INTEGER,
    current_streak INTEGER,
    longest_streak INTEGER,
    last_activity_date DATE,
    last_reading_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    email VARCHAR(255),
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(255),
    display_name VARCHAR(255),
    profile_image_url VARCHAR(255),
    avatar_url TEXT,
    profile_image TEXT,
    profile_type VARCHAR(50),
    church_id VARCHAR(255),
    theological_background TEXT,
    role VARCHAR(255),
    custom_theme JSONB,
    selected_theme VARCHAR(50),
    level VARCHAR(255),
    experience_points INTEGER,
    reading_streak INTEGER,
    last_read_date TIMESTAMP,
    is_teacher BOOLEAN,
    subscription_expires_at TIMESTAMP,
    preferences JSONB,
    last_login TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    password_hash VARCHAR(255),
    subscription_plan VARCHAR(20),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    ai_requests_today INTEGER,
    ai_requests_reset_at TIMESTAMP,
    ai_spend_month NUMERIC,
    ai_spend_year NUMERIC,
    ai_monthly_budget_limit NUMERIC,
    ai_annual_budget_limit NUMERIC,
    ai_spend_month_reset_at TIMESTAMP,
    ai_spend_year_reset_at TIMESTAMP,
    ai_requests_count INTEGER
);

CREATE TABLE IF NOT EXISTS verse_commentaries (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book VARCHAR(255) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    version VARCHAR(255) NOT NULL,
    commentary_type VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    commentary TEXT,
    source VARCHAR(255),
    teacher_id VARCHAR(255),
    generated_at TIMESTAMP,
    created_at TIMESTAMP
);

-- =============================================================================
-- FIM DO BACKUP DE SCHEMA
-- =============================================================================
-- Para exportar os DADOS, use o painel do Supabase:
-- Database -> Backups -> Download
-- Ou exporte cada tabela via Table Editor -> Export CSV
-- =============================================================================
