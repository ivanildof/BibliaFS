// Blueprint: javascript_log_in_with_replit, javascript_openai, and javascript_stripe
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import {
  insertReadingPlanSchema,
  insertReadingPlanTemplateSchema,
  insertAchievementSchema,
  insertPrayerSchema,
  insertNoteSchema,
  insertHighlightSchema,
  insertBookmarkSchema,
  insertBibleSettingsSchema,
  insertPodcastSchema,
  insertPodcastSubscriptionSchema,
  insertLessonSchema,
  insertCommunityPostSchema,
  insertAudioProgressSchema,
  insertOfflineContentSchema,
  insertDailyVerseSchema,
  insertDonationSchema,
} from "@shared/schema";
import { readingPlanTemplates } from "./seed-reading-plans";
import { achievements as seedAchievements } from "./seed-achievements";
import { runMigrations } from "./migrations";

// Initialize Stripe (from javascript_stripe blueprint)
// User will need to configure STRIPE_SECRET_KEY in environment variables
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-11-20.acacia",
  });
} else {
  console.warn("⚠️  STRIPE_SECRET_KEY not found - donation features will be disabled");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Run database migrations
  await runMigrations();
  
  // Auth middleware (from blueprint)
  await setupAuth(app);

  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email || 'dev@example.com',
          firstName: req.user.claims.first_name || 'Dev',
          lastName: req.user.claims.last_name || 'User',
          profileImageUrl: req.user.claims.profile_image_url,
        });
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Falha ao buscar usuário" });
    }
  });

  // Dashboard Stats
  app.get("/api/stats/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reading Plans Routes
  app.get("/api/reading-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getReadingPlans(userId);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reading-plans/current", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plan = await storage.getCurrentReadingPlan(userId);
      res.json(plan || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reading-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { totalDays, title, description, ...rest } = req.body;
      
      // Generate simple schedule array based on totalDays
      const schedule = [];
      for (let day = 1; day <= (totalDays || 30); day++) {
        schedule.push({
          day,
          bibleReading: [], // User can fill this later
        });
      }
      
      const data = insertReadingPlanSchema.parse({
        ...rest,
        title,
        description,
        schedule,
        userId,
      });
      const plan = await storage.createReadingPlan(data);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/reading-plans/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planId = req.params.id;
      
      // Re-validar com safeParse (partial para PATCH)
      const partialSchema = insertReadingPlanSchema.partial();
      const result = partialSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      // updateReadingPlan já valida ownership internamente
      const plan = await storage.updateReadingPlan(planId, userId, result.data);
      
      if (!plan) {
        return res.status(404).json({ error: "Plano não encontrado ou acesso negado" });
      }
      
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/reading-plans/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planId = req.params.id;
      
      // deleteReadingPlan já valida ownership internamente via WHERE clause
      await storage.deleteReadingPlan(planId, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Prayers Routes
  app.get("/api/prayers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prayers = await storage.getPrayers(userId);
      res.json(prayers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/prayers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Re-validar com safeParse
      const result = insertPrayerSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const prayer = await storage.createPrayer(result.data);
      res.json(prayer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/prayers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prayerId = req.params.id;
      
      // Re-validar dados com safeParse (partial para PATCH)
      const partialSchema = insertPrayerSchema.partial();
      const result = partialSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      // updatePrayer já valida ownership internamente
      const prayer = await storage.updatePrayer(prayerId, userId, result.data);
      
      if (!prayer) {
        return res.status(404).json({ error: "Oração não encontrada ou acesso negado" });
      }
      
      res.json(prayer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/prayers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deletePrayer(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notes Routes
  app.get("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notes = await storage.getNotes(userId);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Re-validar com safeParse
      const result = insertNoteSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const note = await storage.createNote(result.data);
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteNote(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // Podcasts Routes
  app.get("/api/podcasts", async (req, res) => {
    try {
      const podcasts = await storage.getPodcasts();
      res.json(podcasts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/podcasts/subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getUserPodcastSubscriptions(userId);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/podcasts/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertPodcastSubscriptionSchema.parse({
        ...req.body,
        userId,
      });
      const subscription = await storage.subscribeToPodcast(data);
      res.json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/podcasts/subscribe/:podcastId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.unsubscribeFromPodcast(userId, req.params.podcastId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher/Lessons Routes
  app.get("/api/teacher/lessons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lessons = await storage.getLessons(userId);
      res.json(lessons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teacher/lessons/:id", isAuthenticated, async (req, res) => {
    try {
      const lesson = await storage.getLesson(req.params.id);
      res.json(lesson || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teacher/lessons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { scriptureBase, ...body } = req.body;
      
      // Transform scriptureBase into scriptureReferences if provided
      let finalData: any = {
        ...body,
        teacherId: userId,
      };
      
      if (scriptureBase) {
        finalData.scriptureReferences = [{
          book: "Gênesis", // Parse from scriptureBase in future
          chapter: 1,
          verses: scriptureBase,
        }];
      }
      
      // Validate with schema (scriptureReferences is now optional)
      const validated = insertLessonSchema.parse(finalData);
      const lesson = await storage.createLesson(validated);
      res.json(lesson);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/teacher/lessons/:id", isAuthenticated, async (req, res) => {
    try {
      const lesson = await storage.updateLesson(req.params.id, req.body);
      res.json(lesson);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/teacher/lessons/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteLesson(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Community Posts Routes
  app.get("/api/community/posts", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const posts = await storage.getCommunityPosts(50, userId);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/community/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertCommunityPostSchema.parse({
        ...req.body,
        userId,
      });
      const post = await storage.createCommunityPost(data);
      res.json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/community/posts/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.likePost(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/community/posts/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.unlikePost(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bible Audio Routes (Bible Brain API)
  const BIBLE_BRAIN_API_BASE = "https://4.dbt.io/api";
  
  // Helper: Get Bible Brain API audio URL (with fallback)
  async function getBibleAudioUrl(version: string, book: string, chapter: number): Promise<string | null> {
    // For MVP: Return a sample audio URL from Faith Comes By Hearing
    // In production, this would query Bible Brain API with proper authentication
    // TODO: Add Bible Brain API key when available
    
    // Map version to Bible Brain fileset IDs
    const filesetMap: Record<string, string> = {
      'nvi': 'PORNTPN2DA',  // Portuguese NVI Dramatized
      'acf': 'PORACFN2DA',  // Portuguese ACF
      'arc': 'PORARCAN2DA', // Portuguese ARC
    };
    
    const filesetId = filesetMap[version.toLowerCase()] || filesetMap['nvi'];
    
    // For now, return sample URL format
    // Real implementation would fetch from: ${BIBLE_BRAIN_API_BASE}/bibles/filesets/${filesetId}/${book}/${chapter}
    return `https://cdn.bible.com/audio/sample/${filesetId}/${book}/${chapter}.mp3`;
  }

  // Get available audio sources
  app.get("/api/bible/audio/sources", async (req, res) => {
    try {
      const sources = await storage.getAudioSources();
      res.json(sources);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get audio URL for a specific chapter
  app.get("/api/bible/audio/:version/:book/:chapter", async (req, res) => {
    try {
      const { version, book, chapter } = req.params;
      const audioUrl = await getBibleAudioUrl(version, book, parseInt(chapter));
      
      if (!audioUrl) {
        return res.status(404).json({ error: "Audio não disponível para esta versão/livro" });
      }
      
      res.json({ audioUrl, version, book, chapter: parseInt(chapter) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's audio progress for a chapter
  app.get("/api/bible/audio/progress/:book/:chapter/:version", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { book, chapter, version } = req.params;
      
      const progress = await storage.getAudioProgress(
        userId,
        book,
        parseInt(chapter),
        version
      );
      
      res.json(progress || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save/update audio progress
  app.post("/api/bible/audio/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertAudioProgressSchema.parse({
        ...req.body,
        userId,
      });
      
      const progress = await storage.upsertAudioProgress(data);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Bible API Routes (ABíbliaDigital)
  const BIBLE_API_BASE = "https://www.abibliadigital.com.br/api";
  
  // Import fallback Bible books list and chapters
  const { BIBLE_BOOKS_FALLBACK } = await import("./bible-books-fallback");
  const { getFallbackChapter } = await import("./bible-chapters-fallback");
  
  // Get all Bible books
  app.get("/api/bible/books", async (req, res) => {
    try {
      const response = await fetch(`${BIBLE_API_BASE}/books`);
      
      if (!response.ok) {
        console.warn("Bible API unavailable, using fallback list");
        return res.json(BIBLE_BOOKS_FALLBACK);
      }
      
      const data = await response.json();
      
      // Check for API error responses
      if (data.error || data.err) {
        console.warn("Bible API error response, using fallback list");
        return res.json(BIBLE_BOOKS_FALLBACK);
      }
      
      // Ensure we return an array
      const books = Array.isArray(data) ? data : (data.books || []);
      
      if (books.length === 0) {
        console.warn("Bible API returned empty book list, using fallback");
        return res.json(BIBLE_BOOKS_FALLBACK);
      }
      
      res.json(books);
    } catch (error: any) {
      console.warn("Error fetching Bible books, using fallback list:", error.message);
      res.json(BIBLE_BOOKS_FALLBACK);
    }
  });
  
  // Get specific chapter with fallback
  app.get("/api/bible/:version/:abbrev/:chapter", async (req, res) => {
    try {
      const { version, abbrev, chapter } = req.params;
      const response = await fetch(`${BIBLE_API_BASE}/verses/${version}/${abbrev}/${chapter}`);
      
      if (!response.ok) {
        const fallback = getFallbackChapter(version, abbrev, parseInt(chapter));
        if (fallback) {
          console.warn(`API error, using fallback: ${version}-${abbrev}-${chapter}`);
          return res.json(fallback);
        }
        return res.status(503).json({ 
          error: "Capítulo não disponível no momento (sem cache)",
          status: "api_error" 
        });
      }
      
      const data = await response.json();
      
      if (data.error || data.err) {
        const fallback = getFallbackChapter(version, abbrev, parseInt(chapter));
        if (fallback) {
          console.warn(`API error response, using fallback: ${version}-${abbrev}-${chapter}`);
          return res.json(fallback);
        }
        return res.status(503).json({ 
          error: "Capítulo não disponível no momento (sem cache)",
          status: "api_error" 
        });
      }
      
      // Validate chapter structure
      if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
        const fallback = getFallbackChapter(version, abbrev, parseInt(chapter));
        if (fallback) {
          console.warn(`Empty verses, using fallback: ${version}-${abbrev}-${chapter}`);
          return res.json(fallback);
        }
        return res.status(503).json({ 
          error: "Capítulo sem versículos disponíveis (sem cache)",
          status: "empty_response" 
        });
      }
      
      res.json(data);
    } catch (error: any) {
      const { version, abbrev, chapter } = req.params;
      const fallback = getFallbackChapter(version, abbrev, parseInt(chapter));
      if (fallback) {
        console.warn(`Network error, using fallback: ${version}-${abbrev}-${chapter}`);
        return res.json(fallback);
      }
      res.status(500).json({ 
        error: "Erro ao buscar capítulo (sem cache)",
        status: "network_error" 
      });
    }
  });
  
  // Get specific verse
  app.get("/api/bible/:version/:abbrev/:chapter/:verse", async (req, res) => {
    try {
      const { version, abbrev, chapter, verse } = req.params;
      const response = await fetch(`${BIBLE_API_BASE}/verses/${version}/${abbrev}/${chapter}/${verse}`);
      
      if (!response.ok) {
        console.error("Bible API verse error:", response.status);
        return res.status(503).json({ 
          error: "Versículo não disponível no momento",
          status: "api_error" 
        });
      }
      
      const data = await response.json();
      
      if (data.error || data.err) {
        console.error("Bible API verse error response:", data);
        return res.status(503).json({ 
          error: "Versículo não disponível no momento",
          status: "api_error" 
        });
      }
      
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching verse:", error);
      res.status(500).json({ 
        error: "Erro ao buscar versículo",
        status: "network_error" 
      });
    }
  });
  
  // Search Bible text
  app.get("/api/bible/search", async (req, res) => {
    try {
      const { version = 'nvi', query } = req.query;
      if (!query) {
        return res.status(400).json({ error: "Query é obrigatória" });
      }
      
      const response = await fetch(`${BIBLE_API_BASE}/verses/${version}/search/${encodeURIComponent(query as string)}`);
      
      if (!response.ok) {
        console.error("Bible API search error:", response.status);
        return res.status(503).json({ 
          error: "Busca não disponível no momento",
          status: "api_error" 
        });
      }
      
      const results = await response.json();
      
      if (results.error || results.err) {
        console.error("Bible API search error response:", results);
        return res.status(503).json({ 
          error: "Busca não disponível no momento",
          status: "api_error" 
        });
      }
      
      res.json(results);
    } catch (error: any) {
      console.error("Error searching Bible:", error);
      res.status(500).json({ 
        error: "Erro ao buscar texto",
        status: "network_error" 
      });
    }
  });

  // Get user's Bible bookmarks
  app.get("/api/bible/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarks = await storage.getBookmarks(userId);
      res.json(bookmarks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create bookmark
  app.post("/api/bible/bookmarks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Re-validar com safeParse
      const result = insertBookmarkSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const bookmark = await storage.createBookmark(result.data);
      res.json(bookmark);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete bookmark
  app.delete("/api/bible/bookmarks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteBookmark(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's Bible highlights
  app.get("/api/bible/highlights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const highlights = await storage.getHighlights(userId);
      res.json(highlights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create highlight
  app.post("/api/bible/highlights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Re-validar com safeParse (o schema já valida a cor)
      const result = insertHighlightSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const highlight = await storage.createHighlight(result.data);
      res.json(highlight);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete highlight
  app.delete("/api/bible/highlights/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteHighlight(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's Bible settings
  app.get("/api/bible/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getBibleSettings(userId);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update Bible settings
  app.put("/api/bible/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Merge userId into payload BEFORE validation
      const payload = { ...req.body, userId };
      const data = insertBibleSettingsSchema.parse(payload);
      const settings = await storage.upsertBibleSettings(data);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Reading Plan Templates
  app.get("/api/reading-plan-templates", isAuthenticated, async (_req, res) => {
    try {
      const templates = await storage.getReadingPlanTemplates();
      if (templates.length === 0) {
        for (const template of readingPlanTemplates) {
          await storage.createReadingPlanTemplate(template);
        }
        const newTemplates = await storage.getReadingPlanTemplates();
        return res.json(newTemplates);
      }
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reading-plan-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getReadingPlanTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template não encontrado" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reading-plans/from-template", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { templateId } = req.body;
      
      const template = await storage.getReadingPlanTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: "Template não encontrado" });
      }

      const data = {
        userId,
        name: template.name,
        description: template.description,
        totalDays: template.duration,
        currentDay: 1,
        schedule: template.schedule,
        isCompleted: false,
      };

      const plan = await storage.createReadingPlan(data);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/reading-plans/:id/complete-day", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { day } = req.body;

      if (typeof day !== 'number') {
        return res.status(400).json({ error: "Dia inválido" });
      }

      const plan = await storage.markDayCompleted(req.params.id, day, userId);

      const user = await storage.getUser(userId);
      if (user) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        const lastReadDate = user.lastReadDate ? new Date(user.lastReadDate) : null;
        if (lastReadDate) {
          lastReadDate.setUTCHours(0, 0, 0, 0);
        }

        if (lastReadDate && today.getTime() === lastReadDate.getTime()) {
          return res.json(plan);
        }

        const baseXP = 10;
        const newXP = (user.experiencePoints || 0) + baseXP;

        const oneDayMs = 24 * 60 * 60 * 1000;
        const daysSinceLastRead = lastReadDate 
          ? Math.floor((today.getTime() - lastReadDate.getTime()) / oneDayMs)
          : null;
        
        const isConsecutiveDay = daysSinceLastRead === 1;
        const isSameDay = daysSinceLastRead === 0;
        
        const newStreak = isConsecutiveDay ? (user.readingStreak || 0) + 1 : 
                          isSameDay ? (user.readingStreak || 0) : 1;

        await storage.updateUserStats(userId, {
          experiencePoints: newXP,
          readingStreak: newStreak,
          lastReadDate: today,
        });

        const allAchievements = await storage.getAchievements();
        for (const achievement of allAchievements) {
          const userAchs = await storage.getUserAchievements(userId);
          const isUnlocked = userAchs.some(ua => ua.achievementId === achievement.id && ua.isUnlocked);
          
          if (!isUnlocked && achievement.category === "streak") {
            if ((achievement.requirement === "Streak de 7 dias" && newStreak >= 7) ||
                (achievement.requirement === "Streak de 30 dias" && newStreak >= 30) ||
                (achievement.requirement === "Streak de 100 dias" && newStreak >= 100)) {
              await storage.unlockAchievement(userId, achievement.id);
            }
          }
        }
      }

      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Achievements
  app.get("/api/achievements", isAuthenticated, async (_req, res) => {
    try {
      const achievements = await storage.getAchievements();
      if (achievements.length === 0) {
        for (const achievement of seedAchievements) {
          await storage.createAchievement(achievement);
        }
        const newAchievements = await storage.getAchievements();
        return res.json(newAchievements);
      }
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/my-achievements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Gamification Stats
  app.get("/api/stats/gamification", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const userAchievements = await storage.getUserAchievements(userId);
      const unlockedCount = userAchievements.filter(ua => ua.isUnlocked).length;
      
      const xp = user.experiencePoints || 0;
      const level = Math.floor(xp / 100) + 1;

      res.json({
        level,
        experiencePoints: xp,
        readingStreak: user.readingStreak || 0,
        achievementsUnlocked: unlockedCount,
        lastReadDate: user.lastReadDate,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark chapter as read and award XP
  app.post("/api/bible/mark-read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { book, chapter } = req.body;

      if (!book || !chapter) {
        return res.status(400).json({ error: "Livro e capítulo são obrigatórios" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      
      const lastReadDate = user.lastReadDate ? new Date(user.lastReadDate) : null;
      if (lastReadDate) {
        lastReadDate.setUTCHours(0, 0, 0, 0);
      }

      if (lastReadDate && today.getTime() === lastReadDate.getTime()) {
        return res.json({
          xpGained: 0,
          newXP: user.experiencePoints || 0,
          newStreak: user.readingStreak || 0,
          unlockedAchievements: [],
          message: "Você já marcou uma leitura hoje!",
        });
      }

      const baseXP = 10;
      const newXP = (user.experiencePoints || 0) + baseXP;

      const oneDayMs = 24 * 60 * 60 * 1000;
      const daysSinceLastRead = lastReadDate 
        ? Math.floor((today.getTime() - lastReadDate.getTime()) / oneDayMs)
        : null;
      
      const isConsecutiveDay = daysSinceLastRead === 1;
      const isSameDay = daysSinceLastRead === 0;
      
      const newStreak = isConsecutiveDay ? (user.readingStreak || 0) + 1 : 
                        isSameDay ? (user.readingStreak || 0) : 1;

      await storage.updateUserStats(userId, {
        experiencePoints: newXP,
        readingStreak: newStreak,
        lastReadDate: today,
      });

      const allAchievements = await storage.getAchievements();
      const unlockedAchievements = [];

      for (const achievement of allAchievements) {
        const isUnlocked = await storage.getUserAchievements(userId)
          .then(uas => uas.some(ua => ua.achievementId === achievement.id && ua.isUnlocked));

        if (!isUnlocked) {
          if (achievement.category === 'leitura' && achievement.requirement === 'Ler 1 capítulo') {
            await storage.unlockAchievement(userId, achievement.id);
            unlockedAchievements.push(achievement);
          } else if (achievement.category === 'streak') {
            if (achievement.requirement === 'Streak de 7 dias' && newStreak >= 7) {
              await storage.unlockAchievement(userId, achievement.id);
              unlockedAchievements.push(achievement);
            } else if (achievement.requirement === 'Streak de 30 dias' && newStreak >= 30) {
              await storage.unlockAchievement(userId, achievement.id);
              unlockedAchievements.push(achievement);
            } else if (achievement.requirement === 'Streak de 100 dias' && newStreak >= 100) {
              await storage.unlockAchievement(userId, achievement.id);
              unlockedAchievements.push(achievement);
            }
          }
        }
      }

      res.json({
        xpGained: baseXP,
        newXP,
        newStreak,
        unlockedAchievements,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Daily Verse Routes
  app.get("/api/daily-verse", async (req, res) => {
    try {
      // Calculate day of year (1-365)
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      let verse = await storage.getDailyVerse(dayOfYear);
      
      // If no verse found for today, return a default inspirational verse
      if (!verse) {
        verse = {
          id: 'default',
          dayOfYear,
          book: 'João',
          chapter: 3,
          verseNumber: 16,
          version: 'nvi',
          text: 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.',
          reference: 'João 3:16',
          theme: 'amor',
          createdAt: new Date(),
        };
      }

      res.json(verse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/daily-verse", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertDailyVerseSchema.parse(req.body);
      const verse = await storage.createDailyVerse(data);
      res.json(verse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/daily-verses/all", isAuthenticated, async (req: any, res) => {
    try {
      const verses = await storage.getAllDailyVerses();
      res.json(verses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Offline Content Routes
  app.get("/api/offline/content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const content = await storage.getOfflineContent(userId);
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/offline/content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertOfflineContentSchema.parse({ ...req.body, userId });
      const content = await storage.saveOfflineContent(data);
      res.json(content);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/offline/content/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteOfflineContent(req.params.id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/offline/content", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteUserOfflineContent(userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Donations Routes (Stripe Integration - from javascript_stripe blueprint)
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Sistema de doações não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente." 
        });
      }

      const { amount, currency } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valor inválido para doação" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // amount in cents
        currency: currency || "brl",
        metadata: {
          userId: req.user.claims.sub,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Erro ao criar payment intent:", error);
      res.status(500).json({ error: "Falha ao criar payment intent: " + error.message });
    }
  });

  app.post("/api/donations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertDonationSchema.parse({ ...req.body, userId });
      const donation = await storage.createDonation(data);
      res.json(donation);
    } catch (error: any) {
      console.error("Erro ao criar doação:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/donations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const donations = await storage.getDonations(userId);
      res.json(donations);
    } catch (error: any) {
      console.error("Erro ao buscar doações:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Study Assistant (OpenAI Integration)
  app.post("/api/ai/study", isAuthenticated, async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "Pergunta é obrigatória" });
      }

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "Assistente de IA não configurado. Por favor, configure sua chave de API OpenAI." 
        });
      }

      // OpenAI integration would go here
      // For now, return a placeholder response
      const answer = "Esta funcionalidade requer a configuração da chave de API OpenAI. " +
        "Por favor, adicione sua chave em OPENAI_API_KEY para usar o assistente teológico.";

      res.json({ answer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
