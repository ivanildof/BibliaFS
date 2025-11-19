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

// Reading Plans
export const readingPlans = pgTable("reading_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  
  // Plan structure as JSON array of daily readings
  schedule: jsonb("schedule").$type<Array<{
    day: number;
    bibleReading: { book: string; chapter: number; verses?: string }[];
    podcastEpisode?: { title: string; url: string; duration: number };
  }>>().notNull(),
  
  currentDay: integer("current_day").default(1),
  isCompleted: boolean("is_completed").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  readingPlans: many(readingPlans),
  prayers: many(prayers),
  notes: many(notes),
  highlights: many(highlights),
  podcastSubscriptions: many(podcastSubscriptions),
  lessonsCreated: many(lessons),
  lessonProgress: many(lessonProgress),
  communityPosts: many(communityPosts),
  postLikes: many(postLikes),
  postComments: many(postComments),
}));

export const readingPlansRelations = relations(readingPlans, ({ one }) => ({
  user: one(users, {
    fields: [readingPlans.userId],
    references: [users.id],
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

// Zod Schemas for validation
export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertReadingPlanSchema = createInsertSchema(readingPlans).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  // Make schedule optional in the form, we'll generate it based on totalDays
  schedule: z.array(z.any()).optional(),
  // Add totalDays field for simple input
  totalDays: z.number().optional(),
});
export type InsertReadingPlan = z.infer<typeof insertReadingPlanSchema>;
export type ReadingPlan = typeof readingPlans.$inferSelect;

export const insertPrayerSchema = createInsertSchema(prayers).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrayer = z.infer<typeof insertPrayerSchema>;
export type Prayer = typeof prayers.$inferSelect;

export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export const insertHighlightSchema = createInsertSchema(highlights).omit({ id: true, createdAt: true });
export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type Highlight = typeof highlights.$inferSelect;

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
