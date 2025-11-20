// Blueprint: javascript_database and javascript_log_in_with_replit
import { 
  users,
  readingPlans,
  prayers,
  notes,
  highlights,
  bookmarks,
  bibleSettings,
  podcasts,
  podcastSubscriptions,
  lessons,
  lessonProgress,
  communityPosts,
  postLikes,
  postComments,
  type User,
  type UpsertUser,
  type InsertReadingPlan,
  type ReadingPlan,
  type InsertPrayer,
  type Prayer,
  type InsertNote,
  type Note,
  type InsertHighlight,
  type Highlight,
  type InsertBookmark,
  type Bookmark,
  type InsertBibleSettings,
  type BibleSettings,
  type InsertPodcast,
  type Podcast,
  type InsertPodcastSubscription,
  type PodcastSubscription,
  type InsertLesson,
  type Lesson,
  type InsertLessonProgress,
  type LessonProgress,
  type InsertCommunityPost,
  type CommunityPost,
  type InsertPostComment,
  type PostComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Reading Plans
  getReadingPlans(userId: string): Promise<ReadingPlan[]>;
  getReadingPlan(id: string): Promise<ReadingPlan | undefined>;
  getCurrentReadingPlan(userId: string): Promise<ReadingPlan | undefined>;
  createReadingPlan(plan: InsertReadingPlan): Promise<ReadingPlan>;
  updateReadingPlan(id: string, data: Partial<ReadingPlan>): Promise<ReadingPlan>;
  deleteReadingPlan(id: string): Promise<void>;
  
  // Prayers
  getPrayers(userId: string): Promise<Prayer[]>;
  createPrayer(prayer: InsertPrayer): Promise<Prayer>;
  updatePrayer(id: string, data: Partial<Prayer>): Promise<Prayer>;
  deletePrayer(id: string, userId: string): Promise<void>;
  
  // Notes
  getNotes(userId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: string, userId: string): Promise<void>;
  
  // Highlights
  getHighlights(userId: string): Promise<Highlight[]>;
  createHighlight(highlight: InsertHighlight): Promise<Highlight>;
  deleteHighlight(id: string, userId: string): Promise<void>;
  
  // Bookmarks
  getBookmarks(userId: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: string, userId: string): Promise<void>;
  
  // Bible Settings
  getBibleSettings(userId: string): Promise<BibleSettings | undefined>;
  upsertBibleSettings(settings: InsertBibleSettings): Promise<BibleSettings>;
  
  // Podcasts
  getPodcasts(): Promise<Podcast[]>;
  getPodcast(id: string): Promise<Podcast | undefined>;
  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  getUserPodcastSubscriptions(userId: string): Promise<(PodcastSubscription & { podcast: Podcast })[]>;
  subscribeToPodcast(subscription: InsertPodcastSubscription): Promise<PodcastSubscription>;
  unsubscribeFromPodcast(userId: string, podcastId: string): Promise<void>;
  
  // Teacher/Lessons
  getLessons(teacherId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  getLessonProgress(lessonId: string): Promise<LessonProgress[]>;
  createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  
  // Community
  getCommunityPosts(limit?: number): Promise<(CommunityPost & { user: User })[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  addComment(comment: InsertPostComment): Promise<PostComment>;
  
  // Stats
  getDashboardStats(userId: string): Promise<{ communityPosts: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Reading Plans
  async getReadingPlans(userId: string): Promise<ReadingPlan[]> {
    return await db
      .select()
      .from(readingPlans)
      .where(eq(readingPlans.userId, userId))
      .orderBy(desc(readingPlans.createdAt));
  }

  async getReadingPlan(id: string): Promise<ReadingPlan | undefined> {
    const [plan] = await db.select().from(readingPlans).where(eq(readingPlans.id, id));
    return plan;
  }

  async getCurrentReadingPlan(userId: string): Promise<ReadingPlan | undefined> {
    const [plan] = await db
      .select()
      .from(readingPlans)
      .where(and(
        eq(readingPlans.userId, userId),
        eq(readingPlans.isCompleted, false)
      ))
      .orderBy(desc(readingPlans.createdAt))
      .limit(1);
    return plan;
  }

  async createReadingPlan(plan: InsertReadingPlan): Promise<ReadingPlan> {
    const [created] = await db.insert(readingPlans).values(plan).returning();
    return created;
  }

  async updateReadingPlan(id: string, data: Partial<ReadingPlan>): Promise<ReadingPlan> {
    const [updated] = await db
      .update(readingPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(readingPlans.id, id))
      .returning();
    return updated;
  }

  async deleteReadingPlan(id: string): Promise<void> {
    await db.delete(readingPlans).where(eq(readingPlans.id, id));
  }

  // Prayers
  async getPrayers(userId: string): Promise<Prayer[]> {
    return await db
      .select()
      .from(prayers)
      .where(eq(prayers.userId, userId))
      .orderBy(desc(prayers.createdAt));
  }

  async createPrayer(prayer: InsertPrayer): Promise<Prayer> {
    const [created] = await db.insert(prayers).values(prayer).returning();
    return created;
  }

  async updatePrayer(id: string, data: Partial<Prayer>): Promise<Prayer> {
    const [updated] = await db
      .update(prayers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(prayers.id, id))
      .returning();
    return updated;
  }

  async deletePrayer(id: string, userId: string): Promise<void> {
    await db.delete(prayers).where(and(eq(prayers.id, id), eq(prayers.userId, userId)));
  }

  // Notes
  async getNotes(userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [created] = await db.insert(notes).values(note).returning();
    return created;
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  }

  // Highlights
  async getHighlights(userId: string): Promise<Highlight[]> {
    return await db
      .select()
      .from(highlights)
      .where(eq(highlights.userId, userId))
      .orderBy(desc(highlights.createdAt));
  }

  async createHighlight(highlight: InsertHighlight): Promise<Highlight> {
    const [created] = await db.insert(highlights).values(highlight).returning();
    return created;
  }

  async deleteHighlight(id: string, userId: string): Promise<void> {
    await db.delete(highlights).where(and(eq(highlights.id, id), eq(highlights.userId, userId)));
  }

  // Bookmarks
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const [created] = await db.insert(bookmarks).values(bookmark).returning();
    return created;
  }

  async deleteBookmark(id: string, userId: string): Promise<void> {
    await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));
  }

  // Bible Settings
  async getBibleSettings(userId: string): Promise<BibleSettings | undefined> {
    const [settings] = await db
      .select()
      .from(bibleSettings)
      .where(eq(bibleSettings.userId, userId));
    return settings;
  }

  async upsertBibleSettings(settingsData: InsertBibleSettings): Promise<BibleSettings> {
    const [settings] = await db
      .insert(bibleSettings)
      .values(settingsData)
      .onConflictDoUpdate({
        target: bibleSettings.userId,
        set: {
          ...settingsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
  }

  // Podcasts
  async getPodcasts(): Promise<Podcast[]> {
    return await db.select().from(podcasts).orderBy(desc(podcasts.subscriberCount));
  }

  async getPodcast(id: string): Promise<Podcast | undefined> {
    const [podcast] = await db.select().from(podcasts).where(eq(podcasts.id, id));
    return podcast;
  }

  async createPodcast(podcastData: InsertPodcast): Promise<Podcast> {
    const [podcast] = await db.insert(podcasts).values(podcastData).returning();
    return podcast;
  }

  async getUserPodcastSubscriptions(userId: string): Promise<(PodcastSubscription & { podcast: Podcast })[]> {
    const subs = await db
      .select({
        subscription: podcastSubscriptions,
        podcast: podcasts,
      })
      .from(podcastSubscriptions)
      .innerJoin(podcasts, eq(podcastSubscriptions.podcastId, podcasts.id))
      .where(eq(podcastSubscriptions.userId, userId));
    
    return subs.map(s => ({
      ...s.subscription,
      podcast: s.podcast,
    }));
  }

  async subscribeToPodcast(subscription: InsertPodcastSubscription): Promise<PodcastSubscription> {
    const [sub] = await db.insert(podcastSubscriptions).values(subscription).returning();
    
    // Increment subscriber count
    await db
      .update(podcasts)
      .set({ subscriberCount: sql`${podcasts.subscriberCount} + 1` })
      .where(eq(podcasts.id, subscription.podcastId));
    
    return sub;
  }

  async unsubscribeFromPodcast(userId: string, podcastId: string): Promise<void> {
    await db.delete(podcastSubscriptions)
      .where(and(
        eq(podcastSubscriptions.userId, userId),
        eq(podcastSubscriptions.podcastId, podcastId)
      ));
    
    // Decrement subscriber count
    await db
      .update(podcasts)
      .set({ subscriberCount: sql`${podcasts.subscriberCount} - 1` })
      .where(eq(podcasts.id, podcastId));
  }

  // Teacher/Lessons
  async getLessons(teacherId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.teacherId, teacherId))
      .orderBy(desc(lessons.createdAt));
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [created] = await db.insert(lessons).values(lesson).returning();
    return created;
  }

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
    const [updated] = await db
      .update(lessons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lessons.id, id))
      .returning();
    return updated;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  async getLessonProgress(lessonId: string): Promise<LessonProgress[]> {
    return await db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.lessonId, lessonId));
  }

  async createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress> {
    const [created] = await db.insert(lessonProgress).values(progress).returning();
    return created;
  }

  // Community
  async getCommunityPosts(limit: number = 50): Promise<(CommunityPost & { user: User })[]> {
    const posts = await db
      .select({
        post: communityPosts,
        user: users,
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);
    
    return posts.map(p => ({
      ...p.post,
      user: p.user,
    }));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [created] = await db.insert(communityPosts).values(post).returning();
    return created;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    await db.insert(postLikes).values({ postId, userId });
    
    // Increment like count
    await db
      .update(communityPosts)
      .set({ likeCount: sql`${communityPosts.likeCount} + 1` })
      .where(eq(communityPosts.id, postId));
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    await db.delete(postLikes)
      .where(and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      ));
    
    // Decrement like count
    await db
      .update(communityPosts)
      .set({ likeCount: sql`${communityPosts.likeCount} - 1` })
      .where(eq(communityPosts.id, postId));
  }

  async addComment(comment: InsertPostComment): Promise<PostComment> {
    const [created] = await db.insert(postComments).values(comment).returning();
    
    // Increment comment count
    await db
      .update(communityPosts)
      .set({ commentCount: sql`${communityPosts.commentCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));
    
    return created;
  }

  // Stats
  async getDashboardStats(userId: string): Promise<{ communityPosts: number }> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityPosts)
      .where(eq(communityPosts.userId, userId));
    
    return {
      communityPosts: result?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
