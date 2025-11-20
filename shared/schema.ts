import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean, 
  jsonb,
  index 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Custom theme settings
  customTheme: jsonb("custom_theme").$type<{
    name: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
  }>(),
  selectedTheme: varchar("selected_theme").default("classico"), // classico, noite_sagrada, luz_do_dia, terra_santa, custom
  
  // Gamification
  level: varchar("level").default("iniciante"), // iniciante, crescendo, discipulo, professor
  experiencePoints: integer("experience_points").default(0),
  readingStreak: integer("reading_streak").default(0),
  lastReadDate: timestamp("last_read_date"),
  
  // Teacher mode flag
  isTeacher: boolean("is_teacher").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reading Plan Templates (predefined plans)
export const readingPlanTemplates = pgTable("reading_plan_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // days
  category: varchar("category").default("bible"), // bible, devotional, topical
  
  // Plan structure as JSON array of daily readings
  schedule: jsonb("schedule").$type<Array<{
    day: number;
    readings: { book: string; chapter: number; verses?: string }[];
  }>>().notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User Reading Plans (user's active plans based on templates)
export const readingPlans = pgTable("reading_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: varchar("template_id").references(() => readingPlanTemplates.id),
  
  title: text("title").notNull(),
  description: text("description"),
  
  // Plan structure as JSON array of daily readings
  schedule: jsonb("schedule").$type<Array<{
    day: number;
    readings: { book: string; chapter: number; verses?: string }[];
    isCompleted: boolean;
  }>>().notNull(),
  
  currentDay: integer("current_day").default(1),
  totalDays: integer("total_days").notNull(),
  isCompleted: boolean("is_completed").default(false),
  
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Achievements (conquistas)
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: varchar("icon").default("trophy"), // lucide icon name
  category: varchar("category").default("reading"), // reading, streak, social, special
  requirement: jsonb("requirement").$type<{
    type: string; // chapters_read, streak_days, plan_completed, etc
    value: number;
  }>().notNull(),
  xpReward: integer("xp_reward").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User Achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  
  progress: integer("progress").default(0),
  isUnlocked: boolean("is_unlocked").default(false),
  unlockedAt: timestamp("unlocked_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayers
export const prayers = pgTable("prayers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  
  // Audio recording (if user recorded prayer)
  audioUrl: text("audio_url"),
  audioDuration: integer("audio_duration"), // in seconds
  
  // Location tagging (optional)
  location: jsonb("location").$type<{ latitude: number; longitude: number; name?: string }>(),
  
  isAnswered: boolean("is_answered").default(false),
  answeredAt: timestamp("answered_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bible Notes
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Verse reference
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse"),
  
  content: text("content").notNull(),
  tags: text("tags").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bible Highlights
export const highlights = pgTable("highlights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Verse reference
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  verseText: text("verse_text").notNull(),
  
  color: varchar("color").notNull(), // yellow, green, blue, purple, pink, orange
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Bible Bookmarks (Favoritos)
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Verse reference
  book: text("book").notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  verseText: text("verse_text").notNull(),
  version: varchar("version").default("nvi"), // nvi, acf, arc, ra
  
  // Optional note
  note: text("note"),
  tags: text("tags").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Bible Reading Settings
export const bibleSettings = pgTable("bible_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  
  // Preferred Bible version
  preferredVersion: varchar("preferred_version").default("nvi"), // nvi, acf, arc, ra
  
  // Reading preferences
  fontSize: integer("font_size").default(16),
  lineHeight: integer("line_height").default(28),
  verseNumbers: boolean("verse_numbers").default(true),
  redLetters: boolean("red_letters").default(false), // Jesus' words in red
  
  // Last reading position
  lastBook: text("last_book"),
  lastChapter: integer("last_chapter"),
  lastVerse: integer("last_verse"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Podcasts
export const podcasts = pgTable("podcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  rssUrl: text("rss_url").notNull().unique(),
  author: text("author"),
  
  // Cached episodes
  episodes: jsonb("episodes").$type<Array<{
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    duration: number;
    publishedAt: string;
  }>>(),
  
  subscriberCount: integer("subscriber_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Podcast Subscriptions
export const podcastSubscriptions = pgTable("podcast_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  podcastId: varchar("podcast_id").notNull().references(() => podcasts.id, { onDelete: "cascade" }),
  
  // Playback state
  currentEpisodeId: text("current_episode_id"),
  currentPosition: integer("current_position").default(0), // in seconds
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Teacher Lessons
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  title: text("title").notNull(),
  description: text("description"),
  
  // Scripture base (optional for MVP - can be added later)
  scriptureReferences: jsonb("scripture_references").$type<Array<{
    book: string;
    chapter: number;
    verses: string;
  }>>(),
  
  // Lesson objectives
  objectives: text("objectives").array(),
  
  // Questions for quiz
  questions: jsonb("questions").$type<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>>(),
  
  // Scheduled time
  scheduledFor: timestamp("scheduled_for"),
  
  isPublished: boolean("is_published").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student Lesson Progress
export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  isCompleted: boolean("is_completed").default(false),
  score: integer("score"), // quiz score percentage
  answers: jsonb("answers").$type<Record<string, number>>(), // questionId -> selected answer index
  
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Posts
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Shared verse
  verseReference: text("verse_reference").notNull(), // e.g., "João 3:16"
  verseText: text("verse_text").notNull(),
  
  // User's personal note/reflection
  note: text("note").notNull(),
  
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Post Likes
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Post Comments
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  content: text("content").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bible Audio Sources (cached from Bible Brain API)
export const audioSources = pgTable("audio_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Bible Brain API identifiers
  filesetId: varchar("fileset_id").notNull().unique(), // e.g., "PORNTPN2DA"
  version: varchar("version").notNull(), // e.g., "nvi", "acf"
  language: varchar("language").notNull(), // e.g., "por"
  
  // Audio metadata
  displayName: text("display_name").notNull(), // e.g., "Nova Versão Internacional"
  audioType: varchar("audio_type").default("drama"), // drama, non-drama
  
  // Cache metadata from Bible Brain API
  metadata: jsonb("metadata").$type<{
    bitrate?: string;
    codec?: string;
    duration?: number;
  }>(),
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Audio Progress (track listening progress)
export const audioProgress = pgTable("audio_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Bible reference
  book: varchar("book").notNull(), // book abbreviation: "gn", "mt", etc
  chapter: integer("chapter").notNull(),
  version: varchar("version").notNull(), // "nvi", "acf", etc
  
  // Playback state
  currentTime: integer("current_time").default(0), // seconds
  duration: integer("duration").default(0), // seconds
  isCompleted: boolean("is_completed").default(false),
  playbackSpeed: varchar("playback_speed").default("1.0"), // "0.5", "1.0", "1.5", "2.0"
  
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
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
}));

export const readingPlanTemplatesRelations = relations(readingPlanTemplates, ({ many }) => ({
  userPlans: many(readingPlans),
}));

export const readingPlansRelations = relations(readingPlans, ({ one }) => ({
  user: one(users, {
    fields: [readingPlans.userId],
    references: [users.id],
  }),
  template: one(readingPlanTemplates, {
    fields: [readingPlans.templateId],
    references: [readingPlanTemplates.id],
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

export const audioProgressRelations = relations(audioProgress, ({ one }) => ({
  user: one(users, {
    fields: [audioProgress.userId],
    references: [users.id],
  }),
}));

// Zod Schemas for validation
export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertReadingPlanTemplateSchema = createInsertSchema(readingPlanTemplates).omit({ id: true, createdAt: true });
export type InsertReadingPlanTemplate = z.infer<typeof insertReadingPlanTemplateSchema>;
export type ReadingPlanTemplate = typeof readingPlanTemplates.$inferSelect;

export const insertReadingPlanSchema = createInsertSchema(readingPlans).omit({ id: true, createdAt: true, updatedAt: true, startedAt: true, completedAt: true });
export type InsertReadingPlan = z.infer<typeof insertReadingPlanSchema>;
export type ReadingPlan = typeof readingPlans.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, createdAt: true });
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, createdAt: true, unlockedAt: true });
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export const insertPrayerSchema = createInsertSchema(prayers).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrayer = z.infer<typeof insertPrayerSchema>;
export type Prayer = typeof prayers.$inferSelect;

export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export const insertHighlightSchema = createInsertSchema(highlights).omit({ id: true, createdAt: true });
export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type Highlight = typeof highlights.$inferSelect;

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true });
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

export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  // Accept simple text input for MVP
  scriptureBase: z.string().optional(),
});
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({ id: true, createdAt: true });
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export const insertPostCommentSchema = createInsertSchema(postComments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;

export const insertAudioSourceSchema = createInsertSchema(audioSources).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAudioSource = z.infer<typeof insertAudioSourceSchema>;
export type AudioSource = typeof audioSources.$inferSelect;

export const insertAudioProgressSchema = createInsertSchema(audioProgress).omit({ id: true, createdAt: true, updatedAt: true, lastPlayedAt: true });
export type InsertAudioProgress = z.infer<typeof insertAudioProgressSchema>;
export type AudioProgress = typeof audioProgress.$inferSelect;
