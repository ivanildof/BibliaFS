// Blueprint: javascript_log_in_with_replit, javascript_openai, and javascript_stripe
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import OpenAI from "openai";
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
  updateLessonSchema,
  insertCommunityPostSchema,
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
    apiVersion: "2025-11-17.clover",
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
      const userEmail = req.user.claims.email || 'dev@example.com';
      let user = await storage.getUser(userId);
      
      if (!user) {
        const isAdmin = userEmail === 'fabrisite1@gmail.com';
        
        user = await storage.upsertUser({
          id: userId,
          email: userEmail,
          firstName: req.user.claims.first_name || 'Dev',
          lastName: req.user.claims.last_name || 'User',
          profileImageUrl: req.user.claims.profile_image_url,
          role: isAdmin ? 'admin' : 'user',
        });
        
        if (isAdmin) {
          console.log(`✅ Admin user created: ${userEmail}`);
        }
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Falha ao buscar usuário" });
    }
  });

  // Update user theme settings
  app.patch('/api/settings/theme', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { selectedTheme, customTheme } = req.body;
      
      // Validation
      if (!selectedTheme || typeof selectedTheme !== 'string') {
        return res.status(400).json({ message: "selectedTheme é obrigatório" });
      }
      
      const validThemes = ['classico', 'noite_sagrada', 'luz_do_dia', 'terra_santa', 'custom'];
      if (!validThemes.includes(selectedTheme)) {
        return res.status(400).json({ message: "Tema inválido" });
      }
      
      // If custom theme, REQUIRE customTheme object with valid structure
      if (selectedTheme === 'custom') {
        if (!customTheme || typeof customTheme !== 'object') {
          return res.status(400).json({ message: "customTheme é obrigatório para tema personalizado" });
        }
        if (!customTheme.primaryColor || typeof customTheme.primaryColor !== 'string') {
          return res.status(400).json({ message: "customTheme.primaryColor é obrigatório" });
        }
        if (!customTheme.accentColor || typeof customTheme.accentColor !== 'string') {
          return res.status(400).json({ message: "customTheme.accentColor é obrigatório" });
        }
        if (!customTheme.backgroundColor || typeof customTheme.backgroundColor !== 'string') {
          return res.status(400).json({ message: "customTheme.backgroundColor é obrigatório" });
        }
      }
      
      const updatedUser = await storage.updateUserTheme(userId, {
        selectedTheme,
        customTheme: selectedTheme === 'custom' ? customTheme : null,
      });
      
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Erro ao salvar tema:", error);
      res.status(500).json({ message: "Falha ao salvar tema" });
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
      
      // Generate schedule array matching schema structure
      const schedule = [];
      for (let day = 1; day <= (totalDays || 30); day++) {
        schedule.push({
          day,
          readings: [], // Matches schema: readings: { book, chapter, verses? }[]
          isCompleted: false,
        });
      }
      
      const result = insertReadingPlanSchema.safeParse({
        ...rest,
        title,
        description,
        schedule,
        totalDays: totalDays || 30,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const plan = await storage.createReadingPlan(result.data);
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      
      // CRITICAL SECURITY: Strip userId from payload to prevent ownership escalation
      const { userId: _, ...safeData } = result.data as any;
      
      // updateReadingPlan valida ownership internamente
      const plan = await storage.updateReadingPlan(planId, userId, safeData as any);
      
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
      
      // deleteReadingPlan retorna false se não encontrou/não deletou nada
      const deleted = await storage.deleteReadingPlan(planId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Plano não encontrado ou acesso negado" });
      }
      
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
      
      // CRITICAL SECURITY: Strip userId from payload to prevent ownership escalation
      const { userId: _, ...safeData } = result.data as any;
      
      // updatePrayer valida ownership internamente
      const prayer = await storage.updatePrayer(prayerId, userId, safeData as any);
      
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
      
      const result = insertPodcastSubscriptionSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const subscription = await storage.subscribeToPodcast(result.data);
      res.json(subscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      
      // Validate with safeParse
      const result = insertLessonSchema.safeParse(finalData);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const lesson = await storage.createLesson(result.data);
      res.json(lesson);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/teacher/lessons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      
      // Use explicit partial schema that preserves nested validation
      const result = updateLessonSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      // updateLesson valida ownership
      const lesson = await storage.updateLesson(req.params.id, teacherId, result.data as any);
      
      if (!lesson) {
        return res.status(404).json({ error: "Aula não encontrada ou acesso negado" });
      }
      
      res.json(lesson);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/teacher/lessons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const teacherId = req.user.claims.sub;
      
      // deleteLesson retorna false se não encontrou/não deletou nada
      const deleted = await storage.deleteLesson(req.params.id, teacherId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Aula não encontrada ou acesso negado" });
      }
      
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
      
      const result = insertCommunityPostSchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const post = await storage.createCommunityPost(result.data);
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  // Bible Audio Route - Single Verse (FAST - only a few seconds!)
  app.get("/api/bible/audio/verse/:language/:version/:book/:chapter/:verse", isAuthenticated, async (req: any, res) => {
    try {
      const { language, version, book, chapter, verse } = req.params;
      const userId = req.user.claims.sub;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "Serviço de áudio não configurado",
          message: "Configure OPENAI_API_KEY para habilitar áudio narrado."
        });
      }

      // Fetch chapter to get the specific verse
      const chapterData = await fetchBibleChapter(
        language,
        version,
        book,
        parseInt(chapter)
      );

      if (!chapterData?.verses || chapterData.verses.length === 0) {
        return res.status(404).json({ error: "Capítulo não encontrado" });
      }

      const verseData = chapterData.verses.find((v: any) => v.number === parseInt(verse));
      
      if (!verseData) {
        return res.status(404).json({ error: "Versículo não encontrado" });
      }

      const verseText = verseData.text;

      console.log(`[Audio] Generating verse audio: ${book} ${chapter}:${verse} (${verseText.length} chars) - User: ${userId}`);

      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: verseText,
          speed: 1.0,
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`OpenAI TTS failed: ${ttsResponse.status}`);
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${book}-${chapter}-${verse}-${language}.mp3"`);
      
      const audioBuffer = await ttsResponse.arrayBuffer();
      res.send(Buffer.from(audioBuffer));
    } catch (error: any) {
      console.error("Verse audio generation error:", error);
      res.status(500).json({ error: "Erro ao gerar áudio do versículo" });
    }
  });

  // Get book metadata (for book audio playlist)
  app.get("/api/bible/book-info/:book", isAuthenticated, async (req: any, res) => {
    try {
      const { book } = req.params;
      const { BIBLE_BOOKS_FALLBACK } = await import('./bible-books-fallback');
      
      const bookInfo = BIBLE_BOOKS_FALLBACK.find(
        (b: any) => b.abbrev.pt.toLowerCase() === book.toLowerCase() || 
                     b.name.toLowerCase() === book.toLowerCase()
      );
      
      if (!bookInfo) {
        return res.status(404).json({ error: "Livro não encontrado" });
      }
      
      res.json({
        name: bookInfo.name,
        abbrev: bookInfo.abbrev.pt,
        chapters: bookInfo.chapters,
        testament: bookInfo.testament
      });
    } catch (error: any) {
      console.error("Book info error:", error);
      res.status(500).json({ error: "Erro ao buscar informações do livro" });
    }
  });

  // Bible Audio Route - Full Chapter (SLOW - 20-40 seconds)
  app.get("/api/bible/audio/:language/:version/:book/:chapter", isAuthenticated, async (req: any, res) => {
    try {
      const { language, version, book, chapter } = req.params;
      const userId = req.user.claims.sub;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "Serviço de áudio não configurado",
          message: "Configure OPENAI_API_KEY para habilitar áudio narrado."
        });
      }

      // Fetch chapter in correct language
      const chapterData = await fetchBibleChapter(
        language,
        version,
        book,
        parseInt(chapter)
      );

      if (!chapterData?.verses || chapterData.verses.length === 0) {
        return res.status(404).json({ error: "Capítulo não encontrado" });
      }

      const fullText = chapterData.verses
        .map((v: any) => `${v.number}. ${v.text}`)
        .join(' ');

      const textLength = fullText.length;
      if (textLength > 4000 * 4) {
        return res.status(400).json({ 
          error: "Capítulo muito longo para narração",
          message: "Este capítulo excede o limite de áudio. Tente capítulos menores."
        });
      }

      console.log(`[Audio] Generating ${language} audio for ${book} ${chapter} (${textLength} chars) - User: ${userId}`);

      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: fullText,
          speed: 1.0,
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`OpenAI TTS failed: ${ttsResponse.status}`);
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${book}-${chapter}-${language}.mp3"`);
      
      const audioBuffer = await ttsResponse.arrayBuffer();
      res.send(Buffer.from(audioBuffer));
    } catch (error: any) {
      console.error("Audio generation error:", error);
      res.status(500).json({ error: "Erro ao gerar áudio" });
    }
  });

  // Helper function to generate commentary using OpenAI with full context
  async function generateCommentary(
    book: string,
    chapter: number,
    verse: number,
    verseText: string,
    commentaryType: string,
    chapterData: any
  ): Promise<string> {
    const systemPrompts: Record<string, string> = {
      exegese: "Você é um teólogo especializado em exegese bíblica. Analise o versículo fornecido considerando o texto original (hebraico/grego), gramática, contexto literário, e o capítulo completo. Seja preciso, acadêmico e contextual.",
      historico: "Você é um historiador bíblico especializado em contexto cultural e histórico. Explique o contexto histórico, cultural, geográfico e social do versículo dentro do capítulo. Seja informativo e educacional.",
      aplicacao: "Você é um pastor e conselheiro espiritual. Explique como este versículo específico, no contexto do capítulo, pode ser aplicado na vida prática dos cristãos hoje. Seja prático, encorajador e relevante.",
      referencias: "Você é um estudioso bíblico especializado em referências cruzadas. Identifique e explique outros versículos bíblicos relacionados ao tema deste versículo específico. Liste pelo menos 3-5 referências relevantes com citações exatas.",
      teologico: "Você é um teólogo sistemático. Analise as implicações teológicas deste versículo específico, considerando diferentes tradições cristãs (católica, protestante, ortodoxa). Seja equilibrado e respeitoso com as diversas interpretações."
    };

    const systemPrompt = systemPrompts[commentaryType] || systemPrompts.exegese;

    // Build context with surrounding verses for better analysis
    const surroundingVerses = chapterData.verses
      .filter((v: any) => Math.abs(v.number - verse) <= 2)
      .map((v: any) => `${v.number}. ${v.text}`)
      .join('\n');

    const userPrompt = `Analise o seguinte versículo bíblico no contexto do capítulo:\n\n**${book} ${chapter}:${verse}**\n"${verseText}"\n\n**Contexto (versículos próximos):**\n${surroundingVerses}\n\nForneça um comentário ${commentaryType} detalhado e específico sobre o versículo ${verse} (2-3 parágrafos). IMPORTANTE: Seja específico sobre este versículo em particular, não genérico.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Bible Commentary Route (User-isolated)
  app.get("/api/bible/commentary/:version/:book/:chapter/:verse", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { version, book, chapter, verse } = req.params;
      const { type } = req.query; // exegese, historico, aplicacao, referencias, teologico
      
      const commentaryType = type || 'exegese';
      
      // Validate commentary type
      const validTypes = ['exegese', 'historico', 'aplicacao', 'referencias', 'teologico'];
      if (!validTypes.includes(commentaryType)) {
        return res.status(400).json({ error: "Tipo de comentário inválido" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "Serviço de comentários não configurado",
          message: "Configure OPENAI_API_KEY para habilitar comentários teológicos."
        });
      }

      // Check cache first (user-isolated)
      const cached = await storage.getVerseCommentary(
        userId,
        book,
        parseInt(chapter),
        parseInt(verse),
        version,
        commentaryType
      );

      if (cached) {
        console.log(`[Commentary] Cache hit for user ${userId}: ${book} ${chapter}:${verse} (${commentaryType})`);
        return res.json(cached);
      }

      // Fetch verse text
      const language = 'pt'; // Default to Portuguese for now
      const chapterData = await fetchBibleChapter(language, version, book, parseInt(chapter));

      if (!chapterData?.verses || chapterData.verses.length === 0) {
        return res.status(404).json({ error: "Capítulo não encontrado" });
      }

      const verseData = chapterData.verses.find((v: any) => v.number === parseInt(verse));
      
      if (!verseData) {
        return res.status(404).json({ error: "Versículo não encontrado" });
      }

      console.log(`[Commentary] Generating ${commentaryType} for user ${userId}: ${book} ${chapter}:${verse}`);

      // Generate commentary with full chapter context
      const content = await generateCommentary(
        book,
        parseInt(chapter),
        parseInt(verse),
        verseData.text,
        commentaryType,
        chapterData
      );

      // Cache the result (user-isolated)
      const commentary = await storage.createVerseCommentary({
        userId,
        book,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        version,
        commentaryType,
        content,
        source: 'ai',
      });

      res.json(commentary);
    } catch (error: any) {
      console.error("Commentary generation error:", error);
      res.status(500).json({ error: "Erro ao gerar comentário" });
    }
  });

  // Bible API Routes with Multilingual Support
  const BIBLE_API_BASE = "https://www.abibliadigital.com.br/api";
  
  // Import multilingual Bible APIs
  const { fetchBibleChapter } = await import("./multilingual-bible-apis");
  
  // Import fallback Bible books list and chapters
  const { BIBLE_BOOKS_FALLBACK } = await import("./bible-books-fallback");
  const { getFallbackChapter } = await import("./bible-chapters-fallback");
  const { fetchWithFallback } = await import("./api-client");
  
  // Get all Bible books (with retry + fallback)
  app.get("/api/bible/books", async (req, res) => {
    const result = await fetchWithFallback(
      `${BIBLE_API_BASE}/books`,
      () => BIBLE_BOOKS_FALLBACK,
      { timeout: 8000, retries: 2 }
    );
    
    // Handle complete failure (both API and fallback failed)
    if (result.error) {
      console.error("Bible books API and fallback failed:", result.error);
      return res.json(BIBLE_BOOKS_FALLBACK);
    }
    
    // Extract books array from response (handles multiple API formats)
    let books: any[] = [];
    const data = result.data as any;
    
    if (Array.isArray(data)) {
      // API returned array directly: [{...}, {...}] (or fallback)
      books = data;
    } else if (data?.books && Array.isArray(data.books)) {
      // API returned {books: [{...}]} format
      books = data.books;
    } else if (data?.data?.books && Array.isArray(data.data.books)) {
      // API returned nested {data: {books: [{...}]}} format
      books = data.data.books;
    } else if (data?.data && Array.isArray(data.data)) {
      // API returned {data: [{...}]} format
      books = data.data;
    }
    
    // Validate we have books
    if (books.length === 0) {
      console.warn("No books found in response, using fallback");
      return res.json(BIBLE_BOOKS_FALLBACK);
    }
    
    res.json(books);
  });
  
  // Get specific chapter with multilingual support
  app.get("/api/bible/multilang/:language/:version/:abbrev/:chapter", async (req, res) => {
    try {
      const { language, version, abbrev, chapter } = req.params;
      
      console.log(`[Multilingual Bible] Fetching ${language} - ${version} - ${abbrev} ${chapter}`);
      
      const chapterData = await fetchBibleChapter(
        language,
        version,
        abbrev,
        parseInt(chapter)
      );
      
      res.json(chapterData);
    } catch (error: any) {
      console.error(`[Multilingual Bible] Error:`, error);
      
      // Fallback to Portuguese if other languages fail
      if (req.params.language !== 'pt') {
        const fallback = getFallbackChapter(req.params.version, req.params.abbrev, parseInt(req.params.chapter));
        if (fallback) {
          console.warn(`Using Portuguese fallback for ${req.params.language}`);
          return res.json(fallback);
        }
      }
      
      res.status(503).json({ 
        error: "Capítulo não disponível no momento",
        message: error.message 
      });
    }
  });
  
  // Get specific chapter (Portuguese only - legacy route)
  app.get("/api/bible/:version/:abbrev/:chapter", async (req, res) => {
    const { version, abbrev, chapter } = req.params;
    
    const result = await fetchWithFallback(
      `${BIBLE_API_BASE}/verses/${version}/${abbrev}/${chapter}`,
      () => getFallbackChapter(version, abbrev, parseInt(chapter)),
      { timeout: 8000, retries: 2 }
    );
    
    // Handle complete failure (both API and fallback failed)
    if (result.error) {
      console.error(`Chapter fetch failed completely: ${version}-${abbrev}-${chapter}`);
      return res.status(503).json({ 
        error: "Capítulo não disponível no momento",
        status: "failed" 
      });
    }
    
    // If fallback was used successfully, data is already correct
    if (result.fromCache && result.data) {
      return res.json(result.data);
    }
    
    // API succeeded - validate chapter structure
    if (!result.data?.verses || !Array.isArray(result.data.verses) || result.data.verses.length === 0) {
      const fallback = getFallbackChapter(version, abbrev, parseInt(chapter));
      if (fallback) {
        console.warn(`Empty verses from API, using fallback: ${version}-${abbrev}-${chapter}`);
        return res.json(fallback);
      }
      return res.status(503).json({ 
        error: "Capítulo sem versículos disponíveis",
        status: "empty_response" 
      });
    }
    
    res.json(result.data);
  });
  
  // Get specific verse (with retry logic)
  app.get("/api/bible/:version/:abbrev/:chapter/:verse", async (req, res) => {
    const { version, abbrev, chapter, verse } = req.params;
    const { robustFetch } = await import("./api-client");
    
    const result = await robustFetch(
      `${BIBLE_API_BASE}/verses/${version}/${abbrev}/${chapter}/${verse}`,
      { timeout: 8000, retries: 2 }
    );
    
    if (result.error) {
      console.error(`Verse fetch failed: ${version}-${abbrev}-${chapter}:${verse}`, result.error);
      return res.status(503).json({ 
        error: "Versículo não disponível no momento",
        status: "failed" 
      });
    }
    
    res.json(result.data);
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
      
      const result = insertBibleSettingsSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const settings = await storage.upsertBibleSettings(result.data);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

      // Add isCompleted: false to each day in schedule
      const scheduleWithCompletion = template.schedule.map(day => ({
        ...day,
        isCompleted: false
      }));

      const data = {
        userId,
        templateId,
        title: template.name,
        description: template.description,
        totalDays: template.duration,
        currentDay: 1,
        schedule: scheduleWithCompletion,
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

        // Skip gamification if already read today
        if (lastReadDate && today.getTime() === lastReadDate.getTime()) {
          return res.json(plan);
        }

        // Calculate streak logic
        const oneDayMs = 24 * 60 * 60 * 1000;
        const daysSinceLastRead = lastReadDate 
          ? Math.floor((today.getTime() - lastReadDate.getTime()) / oneDayMs)
          : null;
        
        const isConsecutiveDay = daysSinceLastRead === 1;
        const isSameDay = daysSinceLastRead === 0;
        
        const newStreak = isConsecutiveDay ? (user.readingStreak || 0) + 1 : 
                          isSameDay ? (user.readingStreak || 0) : 1;

        // TRANSACTIONAL: Process all gamification rewards atomically
        const baseXP = 10;
        await storage.processGamificationRewards(userId, baseXP, newStreak, today);
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

        if (!isUnlocked && achievement.requirement) {
          const req = achievement.requirement as { type: string; value: number };
          
          if (achievement.category === 'reading' && req.type === 'chapters_read' && req.value === 1) {
            await storage.unlockAchievement(userId, achievement.id);
            unlockedAchievements.push(achievement);
          } else if (achievement.category === 'streak' && req.type === 'streak_days') {
            if (newStreak >= req.value) {
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
      const result = insertDailyVerseSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const verse = await storage.createDailyVerse(result.data);
      res.json(verse);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      
      const result = insertOfflineContentSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: result.error.errors 
        });
      }
      
      const content = await storage.saveOfflineContent(result.data);
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      
      const result = insertDonationSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Dados inválidos para doação", 
          details: result.error.errors 
        });
      }
      
      const donation = await storage.createDonation(result.data);
      res.json(donation);
    } catch (error: any) {
      console.error("Erro ao criar doação:", error);
      res.status(500).json({ error: error.message });
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

      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Call OpenAI API with theological context
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um assistente teológico especializado em estudos bíblicos. Responda perguntas sobre a Bíblia, doutrinas cristãs, contexto histórico e interpretações teológicas de forma clara, respeitosa e fundamentada. Use referências bíblicas quando apropriado. Forneça respostas equilibradas considerando diferentes tradições cristãs quando relevante."
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const answer = completion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";

      res.json({ answer });
    } catch (error: any) {
      console.error("Erro ao chamar OpenAI:", error);
      res.status(500).json({ error: "Erro ao processar sua pergunta. Por favor, tente novamente." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
