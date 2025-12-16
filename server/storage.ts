// Database storage implementation
import { 
  users,
  readingPlanTemplates,
  readingPlans,
  achievements,
  userAchievements,
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
  type InsertReadingPlanTemplate,
  type ReadingPlanTemplate,
  type InsertReadingPlan,
  type ReadingPlan,
  type InsertAchievement,
  type Achievement,
  type InsertUserAchievement,
  type UserAchievement,
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
  offlineContent,
  type InsertOfflineContent,
  type OfflineContent,
  verseCommentaries,
  type InsertVerseCommentary,
  type VerseCommentary,
  dailyVerses,
  type InsertDailyVerse,
  type DailyVerse,
  donations,
  type InsertDonation,
  type Donation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUserWithPassword(data: { email: string; passwordHash: string; firstName: string; lastName: string; role: string }): Promise<User>;
  updateUserLastLogin(userId: string): Promise<void>;
  updateUserRole(userId: string, role: string): Promise<User>;
  updateUserStats(userId: string, data: { experiencePoints?: number; readingStreak?: number; level?: string; lastReadDate?: Date }): Promise<User>;
  updateUserTheme(userId: string, data: { selectedTheme?: string; customTheme?: any }): Promise<User>;
  updateUserImage(userId: string, imageData: string): Promise<User>;
  updateUserPassword(userId: string, passwordHash: string): Promise<User>;
  trackAISpending(userId: string, cost: number): Promise<{ user: User; withinBudget: boolean; monthlyRemaining: number; yearlyRemaining: number }>;
  
  // Gamification (transactional)
  processGamificationRewards(userId: string, xpEarned: number, newStreak: number, lastReadDate: Date): Promise<{ user: User; unlockedAchievements: UserAchievement[] }>;
  
  // Reading Plan Templates
  getReadingPlanTemplates(): Promise<ReadingPlanTemplate[]>;
  getReadingPlanTemplate(id: string): Promise<ReadingPlanTemplate | undefined>;
  createReadingPlanTemplate(template: InsertReadingPlanTemplate): Promise<ReadingPlanTemplate>;
  
  // User Reading Plans
  getReadingPlans(userId: string): Promise<ReadingPlan[]>;
  getReadingPlan(id: string): Promise<ReadingPlan | undefined>;
  getCurrentReadingPlan(userId: string): Promise<ReadingPlan | undefined>;
  createReadingPlan(plan: InsertReadingPlan): Promise<ReadingPlan>;
  updateReadingPlan(id: string, userId: string, data: Partial<ReadingPlan>): Promise<ReadingPlan | null>;
  markDayCompleted(planId: string, day: number, userId: string): Promise<ReadingPlan>;
  deleteReadingPlan(id: string, userId: string): Promise<boolean>;
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement>;
  
  // Prayers
  getPrayers(userId: string): Promise<Prayer[]>;
  getPrayer(id: string, userId: string): Promise<Prayer | undefined>;
  createPrayer(prayer: InsertPrayer): Promise<Prayer>;
  updatePrayer(id: string, userId: string, data: Partial<Prayer>): Promise<Prayer | null>;
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
  updatePodcast(id: string, data: Partial<Podcast>): Promise<Podcast | null>;
  getUserPodcasts(userId: string): Promise<Podcast[]>;
  getUserPodcastSubscriptions(userId: string): Promise<(PodcastSubscription & { podcast: Podcast })[]>;
  subscribeToPodcast(subscription: InsertPodcastSubscription): Promise<PodcastSubscription>;
  unsubscribeFromPodcast(userId: string, podcastId: string): Promise<void>;
  
  // Teacher/Lessons
  getLessons(teacherId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, teacherId: string, data: Partial<Lesson>): Promise<Lesson | null>;
  deleteLesson(id: string, teacherId: string): Promise<boolean>;
  getLessonProgress(lessonId: string): Promise<LessonProgress[]>;
  createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  
  // Community
  getCommunityPosts(limit?: number, userId?: string): Promise<(CommunityPost & { user: User; isLikedByCurrentUser?: boolean })[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  addComment(comment: InsertPostComment): Promise<PostComment>;
  
  // Offline Content
  getOfflineContent(userId: string): Promise<OfflineContent[]>;
  getOfflineChapter(userId: string, book: string, chapter: number, version: string): Promise<OfflineContent | undefined>;
  saveOfflineContent(content: InsertOfflineContent): Promise<OfflineContent>;
  deleteOfflineContent(id: string, userId: string): Promise<void>;
  deleteUserOfflineContent(userId: string): Promise<void>;
  
  // Verse Commentaries (with userId for user-isolation and global cache support)
  getVerseCommentary(userId: string, book: string, chapter: number, verse: number, version: string, commentaryType: string): Promise<VerseCommentary | undefined>;
  createVerseCommentary(commentary: InsertVerseCommentary): Promise<VerseCommentary>;
  
  // Daily Verse
  getDailyVerse(dayOfYear: number): Promise<DailyVerse | undefined>;
  createDailyVerse(verse: InsertDailyVerse): Promise<DailyVerse>;
  getAllDailyVerses(): Promise<DailyVerse[]>;
  
  // Donations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonations(userId: string): Promise<Donation[]>;
  getDonation(id: string): Promise<Donation | undefined>;
  updateDonationStatus(id: string, status: string, stripePaymentIntentId?: string): Promise<Donation>;
  
  // Stats
  getDashboardStats(userId: string): Promise<{ communityPosts: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserWithPassword(data: { email: string; passwordHash: string; firstName: string; lastName: string; role: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string, data: { experiencePoints?: number; readingStreak?: number; level?: string; lastReadDate?: Date }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserTheme(userId: string, data: { selectedTheme?: string; customTheme?: any }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserImage(userId: string, imageData: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ profileImageUrl: imageData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async trackAISpending(userId: string, cost: number): Promise<{ user: User; withinBudget: boolean; monthlyRemaining: number; yearlyRemaining: number }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    const now = new Date();
    
    // Reset monthly budget if needed
    let aiSpendMonth = user.aiSpendMonth ? Number(user.aiSpendMonth) : 0;
    let aiMonthlyBudgetLimit = user.aiMonthlyBudgetLimit ? Number(user.aiMonthlyBudgetLimit) : 0;
    let aiSpendMonthResetAt = user.aiSpendMonthResetAt;
    
    if (!aiSpendMonthResetAt || now > aiSpendMonthResetAt) {
      aiSpendMonth = 0;
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      aiSpendMonthResetAt = nextMonth;
    }

    // Reset yearly budget if needed
    let aiSpendYear = user.aiSpendYear ? Number(user.aiSpendYear) : 0;
    let aiAnnualBudgetLimit = user.aiAnnualBudgetLimit ? Number(user.aiAnnualBudgetLimit) : 0;
    let aiSpendYearResetAt = user.aiSpendYearResetAt;

    if (!aiSpendYearResetAt || now > aiSpendYearResetAt) {
      aiSpendYear = 0;
      const nextYear = new Date(now);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      aiSpendYearResetAt = nextYear;
    }

    // Add cost
    aiSpendMonth += cost;
    aiSpendYear += cost;

    // Update user with new spending
    const [updatedUser] = await db
      .update(users)
      .set({
        aiSpendMonth: aiSpendMonth.toString(),
        aiSpendYear: aiSpendYear.toString(),
        aiSpendMonthResetAt,
        aiSpendYearResetAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    const monthlyRemaining = Math.max(0, aiMonthlyBudgetLimit - aiSpendMonth);
    const yearlyRemaining = Math.max(0, aiAnnualBudgetLimit - aiSpendYear);
    const withinBudget = aiSpendMonth <= aiMonthlyBudgetLimit && aiSpendYear <= aiAnnualBudgetLimit;

    return { user: updatedUser, withinBudget, monthlyRemaining, yearlyRemaining };
  }

  async processGamificationRewards(
    userId: string, 
    xpEarned: number, 
    newStreak: number, 
    lastReadDate: Date
  ): Promise<{ user: User; unlockedAchievements: UserAchievement[] }> {
    return await db.transaction(async (tx) => {
      // 1. Get current user data
      const [currentUser] = await tx.select().from(users).where(eq(users.id, userId));
      if (!currentUser) {
        throw new Error("User not found");
      }

      // 2. Update user stats (XP, streak, lastReadDate) atomically
      const newXP = (currentUser.experiencePoints || 0) + xpEarned;
      const [updatedUser] = await tx
        .update(users)
        .set({
          experiencePoints: newXP,
          readingStreak: newStreak,
          lastReadDate,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      // 3. Get all achievements and user's current achievements
      const allAchievements = await tx.select().from(achievements);
      const userAchs = await tx
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      // 4. Check and unlock eligible achievements atomically
      const newlyUnlocked: UserAchievement[] = [];
      
      for (const achievement of allAchievements) {
        const isUnlocked = userAchs.some(
          ua => ua.achievementId === achievement.id && ua.isUnlocked
        );

        if (!isUnlocked && achievement.category === "streak") {
          let shouldUnlock = false;

          if (achievement.requirement === "Streak de 7 dias" && newStreak >= 7) {
            shouldUnlock = true;
          } else if (achievement.requirement === "Streak de 30 dias" && newStreak >= 30) {
            shouldUnlock = true;
          } else if (achievement.requirement === "Streak de 100 dias" && newStreak >= 100) {
            shouldUnlock = true;
          }

          if (shouldUnlock) {
            const existingUserAch = userAchs.find(ua => ua.achievementId === achievement.id);
            
            let unlocked: UserAchievement;
            if (existingUserAch) {
              const [updated] = await tx
                .update(userAchievements)
                .set({
                  isUnlocked: true,
                  unlockedAt: new Date(),
                })
                .where(eq(userAchievements.id, existingUserAch.id))
                .returning();
              unlocked = updated;
            } else {
              const [created] = await tx
                .insert(userAchievements)
                .values({
                  userId,
                  achievementId: achievement.id,
                  isUnlocked: true,
                  unlockedAt: new Date(),
                  progress: 100,
                })
                .returning();
              unlocked = created;
            }
            
            newlyUnlocked.push(unlocked);
          }
        }
      }

      return { user: updatedUser, unlockedAchievements: newlyUnlocked };
    });
  }

  // Reading Plan Templates
  async getReadingPlanTemplates(): Promise<ReadingPlanTemplate[]> {
    return await db
      .select()
      .from(readingPlanTemplates)
      .orderBy(readingPlanTemplates.duration);
  }

  async getReadingPlanTemplate(id: string): Promise<ReadingPlanTemplate | undefined> {
    const [template] = await db.select().from(readingPlanTemplates).where(eq(readingPlanTemplates.id, id));
    return template;
  }

  async createReadingPlanTemplate(template: InsertReadingPlanTemplate): Promise<ReadingPlanTemplate> {
    const [created] = await db.insert(readingPlanTemplates).values(template).returning();
    return created;
  }

  // User Reading Plans
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

  async updateReadingPlan(id: string, userId: string, data: Partial<ReadingPlan>): Promise<ReadingPlan | null> {
    // Validar ownership
    const existing = await this.getReadingPlan(id);
    if (!existing || existing.userId !== userId) {
      return null;
    }
    
    const [updated] = await db
      .update(readingPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(readingPlans.id, id), eq(readingPlans.userId, userId)))
      .returning();
    return updated || null;
  }

  async markDayCompleted(planId: string, day: number, userId: string): Promise<ReadingPlan> {
    const plan = await this.getReadingPlan(planId);
    if (!plan || plan.userId !== userId) {
      throw new Error("Plan not found or unauthorized");
    }

    const updatedSchedule = plan.schedule.map((item: any) => 
      item.day === day ? { ...item, isCompleted: true } : item
    );

    const completedDays = updatedSchedule.filter((item: any) => item.isCompleted).length;
    const isCompleted = completedDays >= plan.totalDays;

    const [updated] = await db
      .update(readingPlans)
      .set({
        schedule: updatedSchedule,
        currentDay: Math.min(day + 1, plan.totalDays),
        isCompleted,
        completedAt: isCompleted ? new Date() : plan.completedAt,
        updatedAt: new Date(),
      })
      .where(eq(readingPlans.id, planId))
      .returning();

    return updated;
  }

  async deleteReadingPlan(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(readingPlans)
      .where(and(eq(readingPlans.id, id), eq(readingPlans.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .orderBy(achievements.category, achievements.xpReward);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [created] = await db.insert(achievements).values(achievement).returning();
    return created;
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    return await db
      .select()
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .then(rows => rows.map(row => ({
        ...row.user_achievements!,
        achievement: row.achievements!
      })));
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));

    if (existing) {
      const [updated] = await db
        .update(userAchievements)
        .set({
          isUnlocked: true,
          unlockedAt: new Date(),
        })
        .where(eq(userAchievements.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        isUnlocked: true,
        unlockedAt: new Date(),
        progress: 100,
      })
      .returning();
    return created;
  }

  async updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));

    if (existing) {
      const [updated] = await db
        .update(userAchievements)
        .set({ progress })
        .where(eq(userAchievements.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        progress,
        isUnlocked: false,
      })
      .returning();
    return created;
  }

  // Prayers
  async getPrayers(userId: string): Promise<Prayer[]> {
    return await db
      .select()
      .from(prayers)
      .where(eq(prayers.userId, userId))
      .orderBy(desc(prayers.createdAt));
  }

  async getPrayer(id: string, userId: string): Promise<Prayer | undefined> {
    const [prayer] = await db
      .select()
      .from(prayers)
      .where(and(eq(prayers.id, id), eq(prayers.userId, userId)));
    return prayer;
  }

  async createPrayer(prayer: InsertPrayer): Promise<Prayer> {
    const [created] = await db.insert(prayers).values(prayer).returning();
    return created;
  }

  async updatePrayer(id: string, userId: string, data: Partial<Prayer>): Promise<Prayer | null> {
    // Validar ownership antes de atualizar
    const existing = await this.getPrayer(id, userId);
    if (!existing) {
      return null;
    }
    
    const [updated] = await db
      .update(prayers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(prayers.id, id), eq(prayers.userId, userId)))
      .returning();
    return updated || null;
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
    try {
      return await db.select().from(podcasts).orderBy(desc(podcasts.subscriberCount));
    } catch (error) {
      console.error("[Podcasts] Error fetching podcasts:", error);
      return [];
    }
  }

  async getPodcast(id: string): Promise<Podcast | undefined> {
    const [podcast] = await db.select().from(podcasts).where(eq(podcasts.id, id));
    return podcast;
  }

  async createPodcast(podcastData: InsertPodcast): Promise<Podcast> {
    const [podcast] = await db.insert(podcasts).values(podcastData).returning();
    return podcast;
  }

  async updatePodcast(id: string, data: Partial<Podcast>): Promise<Podcast | null> {
    const [podcast] = await db
      .update(podcasts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(podcasts.id, id))
      .returning();
    return podcast || null;
  }

  async getUserPodcasts(userId: string): Promise<Podcast[]> {
    return await db
      .select()
      .from(podcasts)
      .where(eq(podcasts.creatorId, userId))
      .orderBy(desc(podcasts.createdAt));
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

  async updateLesson(id: string, teacherId: string, data: Partial<Lesson>): Promise<Lesson | null> {
    // Validar ownership - apenas o professor dono pode editar
    const existing = await this.getLesson(id);
    if (!existing || existing.teacherId !== teacherId) {
      return null;
    }
    
    const [updated] = await db
      .update(lessons)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(lessons.id, id), eq(lessons.teacherId, teacherId)))
      .returning();
    return updated || null;
  }

  async deleteLesson(id: string, teacherId: string): Promise<boolean> {
    // Validar ownership via WHERE clause e retornar se algo foi deletado
    const result = await db.delete(lessons)
      .where(and(eq(lessons.id, id), eq(lessons.teacherId, teacherId)))
      .returning();
    return result.length > 0;
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
  async getCommunityPosts(limit: number = 50, userId?: string): Promise<(CommunityPost & { user: User; isLikedByCurrentUser?: boolean })[]> {
    const posts = await db
      .select({
        post: communityPosts,
        user: users,
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);
    
    if (!userId) {
      return posts.map(p => ({
        ...p.post,
        user: p.user,
        isLikedByCurrentUser: false,
      }));
    }

    const likes = await db
      .select({ postId: postLikes.postId })
      .from(postLikes)
      .where(eq(postLikes.userId, userId));

    const likedPostIds = new Set(likes.map(l => l.postId));
    
    return posts.map(p => ({
      ...p.post,
      user: p.user,
      isLikedByCurrentUser: likedPostIds.has(p.post.id),
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

  // Offline Content
  async getOfflineContent(userId: string): Promise<OfflineContent[]> {
    return await db.select().from(offlineContent).where(eq(offlineContent.userId, userId)).orderBy(desc(offlineContent.downloadedAt));
  }

  async getOfflineChapter(userId: string, book: string, chapter: number, version: string): Promise<OfflineContent | undefined> {
    const [content] = await db.select().from(offlineContent).where(
      and(
        eq(offlineContent.userId, userId),
        eq(offlineContent.book, book),
        eq(offlineContent.chapter, chapter),
        eq(offlineContent.version, version)
      )
    );
    return content;
  }

  async saveOfflineContent(content: InsertOfflineContent): Promise<OfflineContent> {
    // Check if already exists
    const existing = await this.getOfflineChapter(
      content.userId,
      content.book,
      content.chapter,
      content.version
    );

    if (existing) {
      // Update last accessed time
      const [updated] = await db
        .update(offlineContent)
        .set({ lastAccessedAt: new Date() })
        .where(eq(offlineContent.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(offlineContent).values(content).returning();
      return created;
    }
  }

  async deleteOfflineContent(id: string, userId: string): Promise<void> {
    await db.delete(offlineContent).where(
      and(
        eq(offlineContent.id, id),
        eq(offlineContent.userId, userId)
      )
    );
  }

  async deleteUserOfflineContent(userId: string): Promise<void> {
    await db.delete(offlineContent).where(eq(offlineContent.userId, userId));
  }

  // Verse Commentaries (User-isolated)
  async getVerseCommentary(userId: string, book: string, chapter: number, verse: number, version: string, commentaryType: string): Promise<VerseCommentary | undefined> {
    const [commentary] = await db.select().from(verseCommentaries).where(
      and(
        eq(verseCommentaries.userId, userId),
        eq(verseCommentaries.book, book),
        eq(verseCommentaries.chapter, chapter),
        eq(verseCommentaries.verse, verse),
        eq(verseCommentaries.version, version),
        eq(verseCommentaries.commentaryType, commentaryType)
      )
    );
    return commentary;
  }

  async createVerseCommentary(commentary: InsertVerseCommentary): Promise<VerseCommentary> {
    const [created] = await db.insert(verseCommentaries).values(commentary).returning();
    return created;
  }

  // Daily Verse
  async getDailyVerse(dayOfYear: number): Promise<DailyVerse | undefined> {
    const [verse] = await db.select().from(dailyVerses).where(eq(dailyVerses.dayOfYear, dayOfYear));
    return verse;
  }

  async createDailyVerse(verse: InsertDailyVerse): Promise<DailyVerse> {
    const [created] = await db.insert(dailyVerses).values(verse).returning();
    return created;
  }

  async getAllDailyVerses(): Promise<DailyVerse[]> {
    return await db.select().from(dailyVerses);
  }

  // Donations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [created] = await db.insert(donations).values(donation).returning();
    return created;
  }

  async getDonations(userId: string): Promise<Donation[]> {
    return await db.select().from(donations).where(eq(donations.userId, userId)).orderBy(desc(donations.createdAt));
  }

  async getDonation(id: string): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation;
  }

  async updateDonationStatus(id: string, status: string, stripePaymentIntentId?: string): Promise<Donation> {
    const [updated] = await db
      .update(donations)
      .set({ 
        status, 
        ...(stripePaymentIntentId && { stripePaymentIntentId })
      })
      .where(eq(donations.id, id))
      .returning();
    return updated;
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

  // Subscription Management
  async updateUserSubscription(userId: string, data: {
    subscriptionPlan?: string;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    aiRequestsToday?: number;
    aiRequestsResetAt?: Date | null;
  }): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }

  async incrementAiRequests(userId: string): Promise<{ count: number; resetAt: Date }> {
    const now = new Date();
    const user = await this.getUser(userId);
    
    let count = user?.aiRequestsToday || 0;
    let resetAt = user?.aiRequestsResetAt;

    // Reset if it's a new day
    if (!resetAt || now > resetAt) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      count = 1;
      resetAt = tomorrow;
    } else {
      count++;
    }

    await this.updateUserSubscription(userId, {
      aiRequestsToday: count,
      aiRequestsResetAt: resetAt,
    });

    return { count, resetAt };
  }
}

export const storage = new DatabaseStorage();
