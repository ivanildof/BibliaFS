import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean, 
  jsonb,
  index,
  unique,
  decimal,
  date
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// 1. USERS AND PROFILES
// ============================================

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Churches/Organizations table
export const churches = pgTable("churches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  denomination: varchar("denomination", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  ssoConfig: jsonb("sso_config"),
  adminId: varchar("admin_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email OTP table
export const emailOtp = pgTable(
  "email_otp",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull(),
    code: varchar("code", { length: 6 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    verified: boolean("verified").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("IDX_email_otp_email").on(table.email)]
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  username: varchar("username", { length: 255 }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  fullName: varchar("full_name", { length: 255 }),
  displayName: varchar("display_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url"),
  avatarUrl: text("avatar_url"),
  profileImage: text("profile_image"),
  
  // Profile type for role-based access
  profileType: varchar("profile_type", { length: 50 }).default("basic_user"),
  // Profiles: super_admin, church_admin, group_leader, advanced_study, premium_user, basic_user
  
  // Church association
  churchId: varchar("church_id").references(() => churches.id),
  theologicalBackground: text("theological_background"),
  
  // Role-based access control (legacy)
  role: varchar("role").default("user"), // user, admin
  
  // Custom theme settings
  customTheme: jsonb("custom_theme").$type<{
    name: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
  }>(),
  selectedTheme: varchar("selected_theme", { length: 50 }).default("classico"),
  
  // Gamification
  level: varchar("level").default("iniciante"),
  experiencePoints: integer("experience_points").default(0),
  readingStreak: integer("reading_streak").default(0),
  lastReadDate: timestamp("last_read_date"),
  
  // Teacher mode flag
  isTeacher: boolean("is_teacher").default(false),
  
  // Subscription
  subscriptionPlan: varchar("subscription_plan", { length: 20 }).default("free"), // free, monthly, annual
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  aiRequestsToday: integer("ai_requests_today").default(0),
  aiRequestsResetAt: timestamp("ai_requests_reset_at"),
  
  // AI Spending Limits (25% of budget for monthly and annual)
  aiSpendMonth: decimal("ai_spend_month", { precision: 10, scale: 4 }).default("0"),
  aiSpendYear: decimal("ai_spend_year", { precision: 10, scale: 4 }).default("0"),
  aiMonthlyBudgetLimit: decimal("ai_monthly_budget_limit", { precision: 10, scale: 4 }).default("0"),
  aiAnnualBudgetLimit: decimal("ai_annual_budget_limit", { precision: 10, scale: 4 }).default("0"),
  aiSpendMonthResetAt: timestamp("ai_spend_month_reset_at"),
  aiSpendYearResetAt: timestamp("ai_spend_year_reset_at"),
  
  preferences: jsonb("preferences").default({}),
  
  // Timestamps
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community groups table
export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  churchId: varchar("church_id").references(() => churches.id),
  leaderId: varchar("leader_id").references(() => users.id),
  isPublic: boolean("is_public").default(true),
  maxMembers: integer("max_members").default(50),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group members
export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 20 }).default("member"), // member, moderator, leader
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  uniqueGroupUser: unique().on(table.groupId, table.userId),
}));

// ============================================
// 2. BIBLE CONTENT
// ============================================

// Bible translations
export const bibleTranslations = pgTable("bible_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  language: varchar("language", { length: 50 }).default("portuguese"),
  abbreviation: varchar("abbreviation", { length: 10 }).notNull(),
  copyrightInfo: text("copyright_info"),
  isAvailable: boolean("is_available").default(true),
  accessLevel: varchar("access_level", { length: 20 }).default("free"), // free, premium, advanced
});

// Bible books
export const bibleBooks = pgTable("bible_books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  abbreviation: varchar("abbreviation", { length: 10 }).notNull(),
  testament: varchar("testament", { length: 10 }).notNull(), // old, new
  orderIndex: integer("order_index").notNull(),
  chapterCount: integer("chapter_count").notNull(),
});

// Bible chapters
export const bibleChapters = pgTable("bible_chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull().references(() => bibleBooks.id),
  chapterNumber: integer("chapter_number").notNull(),
  verseCount: integer("verse_count").notNull(),
}, (table) => ({
  uniqueBookChapter: unique().on(table.bookId, table.chapterNumber),
}));

// Bible verses
export const bibleVerses = pgTable("bible_verses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  translationId: varchar("translation_id").notNull().references(() => bibleTranslations.id),
  bookId: varchar("book_id").notNull().references(() => bibleBooks.id),
  chapterNumber: integer("chapter_number").notNull(),
  verseNumber: integer("verse_number").notNull(),
  verseText: text("verse_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueVerse: unique().on(table.translationId, table.bookId, table.chapterNumber, table.verseNumber),
}));

// Cross references between verses
export const crossReferences = pgTable("cross_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceVerseId: varchar("source_verse_id").notNull().references(() => bibleVerses.id),
  targetVerseId: varchar("target_verse_id").notNull().references(() => bibleVerses.id),
  referenceType: varchar("reference_type", { length: 50 }), // parallel, explanation, prophecy
  strengthScore: decimal("strength_score", { precision: 3, scale: 2 }).default("1.0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// 3. PERSONAL STUDY
// ============================================

// Reading Plan Templates (predefined plans)
export const readingPlanTemplates = pgTable("reading_plan_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  category: varchar("category").default("bible"),
  schedule: jsonb("schedule").$type<Array<{
    day: number;
    readings: { book: string; chapter: number; verses?: string }[];
  }>>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Reading Plans
export const readingPlans = pgTable("reading_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: varchar("template_id").references(() => readingPlanTemplates.id),
  
  title: text("title").notNull(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  planType: varchar("plan_type", { length: 50 }), // chronological, thematic, book_by_book
  
  schedule: jsonb("schedule").$type<Array<{
    day: number;
    readings: { book: string; chapter: number; verses?: string }[];
    isCompleted: boolean;
  }>>().notNull(),
  
  durationDays: integer("duration_days"),
  totalDays: integer("total_days").notNull(),
  currentDay: integer("current_day").default(1),
  isPublic: boolean("is_public").default(false),
  isActive: boolean("is_active").default(true),
  isCompleted: boolean("is_completed").default(false),
  
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reading plan items
export const readingPlanItems = pgTable("reading_plan_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => readingPlans.id),
  bookId: varchar("book_id").references(() => bibleBooks.id),
  book: varchar("book", { length: 50 }),
  chapterNumber: integer("chapter_number").notNull(),
  dayNumber: integer("day_number").notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  userNotes: text("user_notes"),
});

// Reading history
export const readingHistory = pgTable("reading_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  book: varchar("book", { length: 50 }).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  translationId: varchar("translation_id").references(() => bibleTranslations.id),
  readDurationSeconds: integer("read_duration_seconds"),
  readAt: timestamp("read_at").defaultNow(),
});

// Verse highlights
export const highlights = pgTable("highlights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  verseText: text("verse_text").notNull(),
  version: varchar("version").default("nvi"),
  verseId: varchar("verse_id").references(() => bibleVerses.id),
  
  color: varchar("color").notNull(),
  highlightText: text("highlight_text"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  verseText: text("verse_text").notNull(),
  version: varchar("version").default("nvi"),
  title: varchar("title"),
  
  note: text("note"),
  tags: text("tags").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Personal notes
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse"),
  version: varchar("version").default("nvi"),
  verseId: varchar("verse_id").references(() => bibleVerses.id),
  
  noteTitle: varchar("note_title", { length: 255 }),
  content: text("content").notNull(),
  noteType: varchar("note_type", { length: 50 }).default("personal"), // personal, study, sermon
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-generated verse commentaries
export const verseCommentaries = pgTable("verse_commentaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  book: varchar("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  version: varchar("version").notNull(),
  
  commentaryType: varchar("commentary_type").notNull(),
  content: text("content").notNull(),
  commentary: text("commentary"),
  
  source: varchar("source").default("ai"),
  teacherId: varchar("teacher_id").references(() => users.id, { onDelete: "cascade" }),
  
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueCommentary: unique().on(table.userId, table.version, table.book, table.chapter, table.verse, table.commentaryType),
}));

// Prayers journal
export const prayers = pgTable("prayers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  title: text("title").notNull(),
  content: text("content"),
  prayerType: varchar("prayer_type", { length: 50 }).default("request"), // request, thanksgiving, confession
  category: varchar("category", { length: 100 }),
  emotionalState: varchar("emotional_state", { length: 50 }), // happy, sad, anxious, peaceful
  
  audioUrl: text("audio_url"),
  audioDuration: integer("audio_duration"),
  location: jsonb("location").$type<{ latitude: number; longitude: number; name?: string }>(),
  
  isAnswered: boolean("is_answered").default(false),
  answeredAt: timestamp("answered_at"),
  answerNotes: text("answer_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bible Reading Settings
export const bibleSettings = pgTable("bible_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  preferredVersion: varchar("preferred_version").default("nvi"),
  fontSize: integer("font_size").default(16),
  lineHeight: integer("line_height").default(28),
  verseNumbers: boolean("verse_numbers").default(true),
  redLetters: boolean("red_letters").default(false),
  
  lastBook: text("last_book"),
  lastChapter: integer("last_chapter"),
  lastVerse: integer("last_verse"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 4. COMMUNITY
// ============================================

// Community Posts
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: varchar("group_id").references(() => groups.id),
  verseId: varchar("verse_id").references(() => bibleVerses.id),
  
  verseReference: text("verse_reference").notNull(),
  verseText: text("verse_text").notNull(),
  scriptureReference: jsonb("scripture_reference"),
  
  title: varchar("title", { length: 255 }),
  note: text("note").notNull(),
  content: text("content"),
  postType: varchar("post_type", { length: 50 }).default("reflection"), // reflection, question, testimony
  tags: text("tags").array(),
  
  isPublic: boolean("is_public").default(true),
  likeCount: integer("like_count").default(0),
  likesCount: integer("likes_count").default(0),
  commentCount: integer("comment_count").default(0),
  commentsCount: integer("comments_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Post Likes
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniquePostUser: unique().on(table.postId, table.userId),
}));

// Community Post Comments
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentCommentId: varchar("parent_comment_id").references((): any => postComments.id),
  
  content: text("content").notNull(),
  likeCount: integer("like_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post Reactions (advanced)
export const postReactions = pgTable("post_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => communityPosts.id),
  commentId: varchar("comment_id").references(() => postComments.id),
  userId: varchar("user_id").notNull(),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // like, love, thankful, insightful
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// 5. GAMIFICATION
// ============================================

// User progress (XP, levels, streaks)
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  totalXp: integer("total_xp").default(0),
  level: integer("level").default(1),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: date("last_activity_date"),
  lastReadingDate: date("last_reading_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievement definitions
export const achievementDefinitions = pgTable("achievement_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  achievementType: varchar("achievement_type", { length: 50 }).notNull(), // reading, community, consistency
  requirementValue: integer("requirement_value").notNull(),
  requirementMetric: varchar("requirement_metric", { length: 50 }).notNull(), // days_streak, chapters_read
  tier: varchar("tier", { length: 20 }).default("bronze"), // bronze, silver, gold, platinum
});

// Achievements (legacy + new)
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  description: text("description"),
  icon: varchar("icon").default("trophy"),
  category: varchar("category").default("reading"),
  requirement: jsonb("requirement").$type<{
    type: string;
    value: number;
  }>(),
  xpReward: integer("xp_reward").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id").references(() => achievements.id, { onDelete: "cascade" }),
  achievementType: varchar("achievement_type"),
  achievementValue: integer("achievement_value").default(1),
  
  progress: integer("progress").default(0),
  progressValue: integer("progress_value").default(0),
  isUnlocked: boolean("is_unlocked").default(false),
  unlockedAt: timestamp("unlocked_at"),
  earnedAt: timestamp("earned_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// 6. CONTENT & MEDIA
// ============================================

// Podcasts
export const podcasts = pgTable("podcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  author: varchar("author", { length: 255 }),
  category: varchar("category", { length: 100 }),
  language: varchar("language", { length: 10 }).default("pt"),
  imageUrl: text("image_url"),
  rssUrl: text("rss_url"),
  rssFeed: varchar("rss_feed").unique(),
  totalEpisodes: integer("total_episodes").default(0),
  isActive: boolean("is_active").default(true),
  accessLevel: varchar("access_level", { length: 20 }).default("free"),
  
  // Creator info for user-generated podcasts
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "set null" }),
  bibleBook: varchar("bible_book", { length: 100 }),
  bibleChapter: integer("bible_chapter"),
  
  episodes: jsonb("episodes").$type<Array<{
    id: string;
    title: string;
    description: string;
    audioData: string; // base64 encoded audio
    duration: number;
    publishedAt: string;
  }>>(),
  subscriberCount: integer("subscriber_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Podcast subscriptions
export const podcastSubscriptions = pgTable("podcast_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  podcastId: varchar("podcast_id").notNull().references(() => podcasts.id, { onDelete: "cascade" }),
  
  currentEpisodeId: text("current_episode_id"),
  currentPosition: integer("current_position").default(0),
  
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserPodcast: unique().on(table.userId, table.podcastId),
}));

// Teacher Lessons
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  tags: text("tags").array(),
  
  scriptureReferences: jsonb("scripture_references").$type<Array<{
    book: string;
    chapter: number;
    verses: string;
  }>>(),
  resources: jsonb("resources"),
  
  objectives: text("objectives").array(),
  questions: jsonb("questions").$type<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>>(),
  
  scheduledFor: timestamp("scheduled_for"),
  isPublished: boolean("is_published").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student Lesson Progress / Enrollments
export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  score: integer("score"),
  answers: jsonb("answers").$type<Record<string, number>>(),
  
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional content (devotionals, study guides)
export const additionalContent = pgTable("additional_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentType: varchar("content_type", { length: 50 }).notNull(), // podcast, devotional, study_guide
  audioUrl: text("audio_url"),
  durationSeconds: integer("duration_seconds"),
  author: varchar("author", { length: 255 }),
  accessLevel: varchar("access_level", { length: 20 }).default("premium"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content-Bible verse references
export const contentVerseReferences = pgTable("content_verse_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => additionalContent.id),
  verseId: varchar("verse_id").notNull().references(() => bibleVerses.id),
  relevanceScore: decimal("relevance_score", { precision: 3, scale: 2 }).default("1.0"),
}, (table) => ({
  uniqueContentVerse: unique().on(table.contentId, table.verseId),
}));

// ============================================
// 7. DAILY & OFFLINE
// ============================================

// Daily verses
export const dailyVerses = pgTable("daily_verses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dayOfYear: integer("day_of_year").notNull().unique(),
  book: varchar("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  version: varchar("version").notNull(),
  theme: varchar("theme", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Offline content cache
export const offlineContent = pgTable("offline_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  book: varchar("book").notNull(),
  chapter: integer("chapter").notNull(),
  version: varchar("version").notNull(),
  content: jsonb("content").notNull(),
  
  size: integer("size").default(0),
  verseCount: integer("verse_count").default(0),
  
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserBookChapterVersion: unique().on(table.userId, table.book, table.chapter, table.version),
}));

// ============================================
// 8. PAYMENTS
// ============================================

// Donations
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("BRL"),
  type: varchar("type", { length: 50 }).notNull(), // one_time, recurring
  frequency: varchar("frequency"),
  destination: varchar("destination", { length: 50 }).default("app_operations"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, completed, failed, cancelled
  isAnonymous: boolean("is_anonymous").default(false),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// RELATIONS
// ============================================

export const churchesRelations = relations(churches, ({ one, many }) => ({
  admin: one(users, {
    fields: [churches.adminId],
    references: [users.id],
  }),
  groups: many(groups),
  members: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  church: one(churches, {
    fields: [users.churchId],
    references: [churches.id],
  }),
  readingPlans: many(readingPlans),
  prayers: many(prayers),
  notes: many(notes),
  highlights: many(highlights),
  bookmarks: many(bookmarks),
  podcastSubscriptions: many(podcastSubscriptions),
  lessonsCreated: many(lessons),
  lessonProgress: many(lessonProgress),
  communityPosts: many(communityPosts),
  postLikes: many(postLikes),
  postComments: many(postComments),
  userAchievements: many(userAchievements),
  groupMemberships: many(groupMembers),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  church: one(churches, {
    fields: [groups.churchId],
    references: [churches.id],
  }),
  leader: one(users, {
    fields: [groups.leaderId],
    references: [users.id],
  }),
  members: many(groupMembers),
  posts: many(communityPosts),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const bibleTranslationsRelations = relations(bibleTranslations, ({ many }) => ({
  verses: many(bibleVerses),
}));

export const bibleBooksRelations = relations(bibleBooks, ({ many }) => ({
  chapters: many(bibleChapters),
  verses: many(bibleVerses),
}));

export const bibleChaptersRelations = relations(bibleChapters, ({ one }) => ({
  book: one(bibleBooks, {
    fields: [bibleChapters.bookId],
    references: [bibleBooks.id],
  }),
}));

export const bibleVersesRelations = relations(bibleVerses, ({ one }) => ({
  translation: one(bibleTranslations, {
    fields: [bibleVerses.translationId],
    references: [bibleTranslations.id],
  }),
  book: one(bibleBooks, {
    fields: [bibleVerses.bookId],
    references: [bibleBooks.id],
  }),
}));

export const readingPlanTemplatesRelations = relations(readingPlanTemplates, ({ many }) => ({
  userPlans: many(readingPlans),
}));

export const readingPlansRelations = relations(readingPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [readingPlans.userId],
    references: [users.id],
  }),
  template: one(readingPlanTemplates, {
    fields: [readingPlans.templateId],
    references: [readingPlanTemplates.id],
  }),
  items: many(readingPlanItems),
}));

export const readingPlanItemsRelations = relations(readingPlanItems, ({ one }) => ({
  plan: one(readingPlans, {
    fields: [readingPlanItems.planId],
    references: [readingPlans.id],
  }),
  book: one(bibleBooks, {
    fields: [readingPlanItems.bookId],
    references: [bibleBooks.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const prayersRelations = relations(prayers, ({ one }) => ({
  user: one(users, {
    fields: [prayers.userId],
    references: [users.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const highlightsRelations = relations(highlights, ({ one }) => ({
  user: one(users, {
    fields: [highlights.userId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));

export const bibleSettingsRelations = relations(bibleSettings, ({ one }) => ({
  user: one(users, {
    fields: [bibleSettings.userId],
    references: [users.id],
  }),
}));

export const podcastsRelations = relations(podcasts, ({ many }) => ({
  subscriptions: many(podcastSubscriptions),
}));

export const podcastSubscriptionsRelations = relations(podcastSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [podcastSubscriptions.userId],
    references: [users.id],
  }),
  podcast: one(podcasts, {
    fields: [podcastSubscriptions.podcastId],
    references: [podcasts.id],
  }),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  teacher: one(users, {
    fields: [lessons.teacherId],
    references: [users.id],
  }),
  progress: many(lessonProgress),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
  student: one(users, {
    fields: [lessonProgress.studentId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [communityPosts.groupId],
    references: [groups.id],
  }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(communityPosts, {
    fields: [postLikes.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(communityPosts, {
    fields: [postComments.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
}));

export const offlineContentRelations = relations(offlineContent, ({ one }) => ({
  user: one(users, {
    fields: [offlineContent.userId],
    references: [users.id],
  }),
}));

// ============================================
// ZOD SCHEMAS
// ============================================

export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertChurchSchema = createInsertSchema(churches).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChurch = z.infer<typeof insertChurchSchema>;
export type Church = typeof churches.$inferSelect;

export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;

export const insertReadingPlanTemplateSchema = createInsertSchema(readingPlanTemplates).omit({ id: true, createdAt: true });
export type InsertReadingPlanTemplate = z.infer<typeof insertReadingPlanTemplateSchema>;
export type ReadingPlanTemplate = typeof readingPlanTemplates.$inferSelect;

export const insertReadingPlanSchema = createInsertSchema(readingPlans)
  .omit({ id: true, createdAt: true, updatedAt: true, startedAt: true, completedAt: true })
  .extend({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200),
    totalDays: z.number().int().min(1, "Plano deve ter pelo menos 1 dia").max(365, "Plano não pode ter mais de 365 dias"),
    currentDay: z.number().int().min(1).max(365).optional().nullable(),
  });
export type InsertReadingPlan = z.infer<typeof insertReadingPlanSchema>;
export type ReadingPlan = typeof readingPlans.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, createdAt: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, createdAt: true, unlockedAt: true });
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export const insertPrayerSchema = createInsertSchema(prayers)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200, "Título muito longo"),
    content: z.string().min(10, "Oração deve ter pelo menos 10 caracteres").max(10000, "Oração muito longa").optional().nullable(),
    audioUrl: z.string().max(5000000, "Áudio muito grande").optional().nullable(),
    audioDuration: z.number().min(1).max(600).optional().nullable(),
  });
export type InsertPrayer = z.infer<typeof insertPrayerSchema>;
export type Prayer = typeof prayers.$inferSelect;

export const insertNoteSchema = createInsertSchema(notes)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    book: z.string().min(2, "Nome do livro inválido").max(50),
    chapter: z.number().int().min(1, "Capítulo deve ser maior que 0").max(150, "Capítulo inválido"),
    verse: z.number().int().min(1).max(176).optional().nullable(),
    content: z.string().min(1, "Nota não pode estar vazia").max(5000, "Nota muito longa"),
  });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export const insertHighlightSchema = createInsertSchema(highlights)
  .omit({ id: true, createdAt: true })
  .extend({
    book: z.string().min(2, "Nome do livro inválido").max(50),
    chapter: z.number().int().min(1).max(150),
    verse: z.number().int().min(1).max(176),
    verseText: z.string().min(1).max(1000),
    color: z.enum(["yellow", "green", "blue", "purple", "pink", "orange"], {
      errorMap: () => ({ message: "Cor deve ser: yellow, green, blue, purple, pink ou orange" })
    }),
  });
export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type Highlight = typeof highlights.$inferSelect;

export const insertBookmarkSchema = createInsertSchema(bookmarks)
  .omit({ id: true, createdAt: true })
  .extend({
    book: z.string().min(2).max(50),
    chapter: z.number().int().min(1).max(150),
    verse: z.number().int().min(1).max(176),
    verseText: z.string().min(1).max(1000),
    version: z.enum(["nvi", "acf", "arc", "ra"]).optional().nullable(),
    note: z.string().max(1000).optional().nullable(),
  });
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

export const insertBibleSettingsSchema = createInsertSchema(bibleSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBibleSettings = z.infer<typeof insertBibleSettingsSchema>;
export type BibleSettings = typeof bibleSettings.$inferSelect;

export const insertPodcastSchema = createInsertSchema(podcasts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type Podcast = typeof podcasts.$inferSelect;

export const insertPodcastSubscriptionSchema = createInsertSchema(podcastSubscriptions).omit({ id: true, createdAt: true });
export type InsertPodcastSubscription = z.infer<typeof insertPodcastSubscriptionSchema>;
export type PodcastSubscription = typeof podcastSubscriptions.$inferSelect;

export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export const updateLessonSchema = createInsertSchema(lessons).omit({ id: true, teacherId: true, createdAt: true, updatedAt: true }).partial();
export type UpdateLesson = z.infer<typeof updateLessonSchema>;

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({ id: true, createdAt: true });
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;

export const insertCommunityPostSchema = createInsertSchema(communityPosts)
  .omit({ id: true, createdAt: true, updatedAt: true, likeCount: true, commentCount: true })
  .extend({
    verseReference: z.string().min(3, "Referência do versículo inválida").max(100),
    verseText: z.string().min(5, "Texto do versículo inválido").max(2000),
    note: z.string().min(10, "Reflexão deve ter pelo menos 10 caracteres").max(5000, "Reflexão muito longa"),
  });
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;

export const insertPostCommentSchema = createInsertSchema(postComments)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    content: z.string().min(1, "Comentário não pode estar vazio").max(2000, "Comentário muito longo"),
  });
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;

export const insertOfflineContentSchema = createInsertSchema(offlineContent).omit({ id: true, createdAt: true });
export type InsertOfflineContent = z.infer<typeof insertOfflineContentSchema>;
export type OfflineContent = typeof offlineContent.$inferSelect;

export const insertVerseCommentarySchema = createInsertSchema(verseCommentaries).omit({ id: true, createdAt: true, generatedAt: true });
export type InsertVerseCommentary = z.infer<typeof insertVerseCommentarySchema>;
export type VerseCommentary = typeof verseCommentaries.$inferSelect;

export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export const insertDailyVerseSchema = createInsertSchema(dailyVerses).omit({ id: true, createdAt: true });
export type InsertDailyVerse = z.infer<typeof insertDailyVerseSchema>;
export type DailyVerse = typeof dailyVerses.$inferSelect;

// ============================================
// PUSH NOTIFICATIONS
// ============================================

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  readingReminders: boolean("reading_reminders").default(true),
  readingReminderTime: varchar("reading_reminder_time", { length: 5 }).default("08:00"),
  prayerReminders: boolean("prayer_reminders").default(true),
  prayerReminderTime: varchar("prayer_reminder_time", { length: 5 }).default("07:00"),
  dailyVerseNotification: boolean("daily_verse_notification").default(true),
  dailyVerseTime: varchar("daily_verse_time", { length: 5 }).default("06:00"),
  communityActivity: boolean("community_activity").default(false),
  teacherModeUpdates: boolean("teacher_mode_updates").default(true),
  weekendOnly: boolean("weekend_only").default(false),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationHistory = pgTable("notification_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  data: jsonb("data"),
  sentAt: timestamp("sent_at").defaultNow(),
  clicked: boolean("clicked").default(false),
  clickedAt: timestamp("clicked_at"),
});

// Audio cache for chapters and verses
export const audioCache = pgTable("audio_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  language: varchar("language", { length: 10 }).notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  book: varchar("book", { length: 50 }).notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse"), // NULL for full chapters, set for verses
  audioData: text("audio_data").notNull(), // Base64 encoded MP3
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_audio_cache").on(table.language, table.version, table.book, table.chapter, table.verse),
]);

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

export const insertNotificationHistorySchema = createInsertSchema(notificationHistory).omit({ id: true, sentAt: true });
export type InsertNotificationHistory = z.infer<typeof insertNotificationHistorySchema>;
export type NotificationHistory = typeof notificationHistory.$inferSelect;

export const insertAudioCacheSchema = createInsertSchema(audioCache).omit({ id: true, createdAt: true });
export type InsertAudioCache = z.infer<typeof insertAudioCacheSchema>;
export type AudioCache = typeof audioCache.$inferSelect;

// Bible content types
export type BibleTranslation = typeof bibleTranslations.$inferSelect;
export type BibleBook = typeof bibleBooks.$inferSelect;
export type BibleChapter = typeof bibleChapters.$inferSelect;
export type BibleVerse = typeof bibleVerses.$inferSelect;
export type CrossReference = typeof crossReferences.$inferSelect;

// Group types and schemas
export type GroupMember = typeof groupMembers.$inferSelect;
export type PostReaction = typeof postReactions.$inferSelect;
export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;
export type AdditionalContent = typeof additionalContent.$inferSelect;
export type ContentVerseReference = typeof contentVerseReferences.$inferSelect;
export type ReadingPlanItem = typeof readingPlanItems.$inferSelect;
export type ReadingHistoryEntry = typeof readingHistory.$inferSelect;

// ============================================
// STUDY GROUPS (Private Groups for Community)
// ============================================

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({ id: true, joinedAt: true });
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

// Group invitations
export const groupInvites = pgTable("group_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  invitedEmail: varchar("invited_email", { length: 255 }),
  invitedPhone: varchar("invited_phone", { length: 20 }),
  inviteCode: varchar("invite_code", { length: 50 }).unique(),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, rejected, expired
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGroupInviteSchema = createInsertSchema(groupInvites).omit({ id: true, createdAt: true });
export type InsertGroupInvite = z.infer<typeof insertGroupInviteSchema>;
export type GroupInvite = typeof groupInvites.$inferSelect;

// Group messages (chat/discussion)
export const groupMessages = pgTable("group_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  replyToId: varchar("reply_to_id"),
  
  // Optional verse reference
  verseReference: text("verse_reference"),
  verseText: text("verse_text"),
  
  // Message type
  messageType: varchar("message_type", { length: 20 }).default("text"), // text, verse, prayer, lesson
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGroupMessageSchema = createInsertSchema(groupMessages)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    content: z.string().min(1, "Mensagem não pode estar vazia").max(2000, "Mensagem muito longa"),
  });
export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;
export type GroupMessage = typeof groupMessages.$inferSelect;

// ============================================
// GROUP DISCUSSIONS (AI-structured Q&A sessions)
// ============================================

export const groupDiscussions = pgTable("group_discussions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  
  // Discussion content
  title: text("title").notNull(),
  description: text("description"),
  
  // The question/prompt (generated by AI or leader)
  question: text("question").notNull(),
  
  // Bible reference for context
  verseReference: text("verse_reference"),
  verseText: text("verse_text"),
  
  // AI synthesis of all answers
  aiSynthesis: text("ai_synthesis"),
  synthesizedAt: timestamp("synthesized_at"),
  
  // Status: open, closed, synthesized
  status: varchar("status", { length: 20 }).default("open"),
  
  // Settings
  allowAnonymous: boolean("allow_anonymous").default(false),
  deadline: timestamp("deadline"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGroupDiscussionSchema = createInsertSchema(groupDiscussions)
  .omit({ id: true, createdAt: true, updatedAt: true, synthesizedAt: true, aiSynthesis: true });
export type InsertGroupDiscussion = z.infer<typeof insertGroupDiscussionSchema>;
export type GroupDiscussion = typeof groupDiscussions.$inferSelect;

// Group discussion answers (member responses)
export const groupAnswers = pgTable("group_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discussionId: varchar("discussion_id").notNull().references(() => groupDiscussions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // The answer content
  content: text("content").notNull(),
  
  // Optional verse reference in answer
  verseReference: text("verse_reference"),
  
  // Leader review
  reviewStatus: varchar("review_status", { length: 20 }).default("pending"), // pending, excellent, needs_review, approved
  reviewComment: text("review_comment"),
  reviewedById: varchar("reviewed_by_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  // Visibility
  isAnonymous: boolean("is_anonymous").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGroupAnswerSchema = createInsertSchema(groupAnswers)
  .omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true, reviewComment: true, reviewedById: true, reviewStatus: true });
export type InsertGroupAnswer = z.infer<typeof insertGroupAnswerSchema>;
export type GroupAnswer = typeof groupAnswers.$inferSelect;

// ============================================
// TEACHING OUTLINES (Structured Lesson Blocks)
// ============================================

export const teachingOutlines = pgTable("teaching_outlines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: varchar("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
  
  title: text("title").notNull(),
  description: text("description"),
  
  // Structured content blocks
  blocks: jsonb("blocks").$type<Array<{
    id: string;
    type: "text" | "verse" | "question" | "note" | "heading" | "illustration";
    content: string;
    metadata?: {
      book?: string;
      chapter?: number;
      verses?: string;
      version?: string;
      style?: "h1" | "h2" | "h3";
    };
  }>>().default([]),
  
  // Bible references
  mainScripture: jsonb("main_scripture").$type<{
    book: string;
    chapter: number;
    verses?: string;
  }>(),
  
  // Categories and tags
  category: varchar("category", { length: 50 }), // sermon, bible_study, devotional, teaching
  tags: text("tags").array(),
  
  // Sharing and visibility
  isPublic: boolean("is_public").default(false),
  sharedWithGroups: text("shared_with_groups").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeachingOutlineSchema = createInsertSchema(teachingOutlines).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTeachingOutline = z.infer<typeof insertTeachingOutlineSchema>;
export type TeachingOutline = typeof teachingOutlines.$inferSelect;

// ============================================
// OFFLINE PODCAST DOWNLOADS
// ============================================

export const podcastDownloads = pgTable("podcast_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  podcastId: varchar("podcast_id").notNull().references(() => podcasts.id, { onDelete: "cascade" }),
  episodeId: varchar("episode_id").notNull(),
  
  downloadStatus: varchar("download_status", { length: 20 }).default("pending"), // pending, downloading, completed, failed
  downloadProgress: integer("download_progress").default(0),
  fileSize: integer("file_size"),
  
  downloadedAt: timestamp("downloaded_at"),
  expiresAt: timestamp("expires_at"), // For auto-cleanup
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserPodcastEpisode: unique().on(table.userId, table.podcastId, table.episodeId),
}));

export const insertPodcastDownloadSchema = createInsertSchema(podcastDownloads).omit({ id: true, createdAt: true });
export type InsertPodcastDownload = z.infer<typeof insertPodcastDownloadSchema>;
export type PodcastDownload = typeof podcastDownloads.$inferSelect;

// ============================================
// BIBLE AUDIO PROGRESS (for syncing playback)
// ============================================

export const audioProgress = pgTable("audio_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  book: varchar("book", { length: 50 }).notNull(),
  chapter: integer("chapter").notNull(),
  version: varchar("version", { length: 20 }).default("ARA"),
  
  playbackPosition: integer("playback_position").default(0), // in seconds
  totalDuration: integer("total_duration").default(0), // in seconds
  
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
  completed: boolean("completed").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_audio_progress_user_book_chapter").on(table.userId, table.book, table.chapter),
]);

export const insertAudioProgressSchema = createInsertSchema(audioProgress).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAudioProgress = z.infer<typeof insertAudioProgressSchema>;
export type AudioProgress = typeof audioProgress.$inferSelect;
