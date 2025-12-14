// Authentication: Supabase Auth with JWT, AI with OpenAI, Payments with Stripe
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, supabaseAdmin } from "./supabaseAuth";
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
import {
  initPushTables,
  getVapidPublicKey,
  savePushSubscription,
  removePushSubscription,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendPushNotification,
  markNotificationClicked,
  getRandomInsight,
} from "./push-notifications";

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

// AI Rate Limiting Constants
const FREE_PLAN_AI_LIMIT = 3; // 3 AI requests per day for free users
const AI_REQUEST_COST = 0.01; // Cost per AI request in USD
const AI_BUDGET_PERCENTAGE = 0.25; // 25% of subscription budget

// Helper to check AI quota for free plan users
async function checkAiQuota(userId: string): Promise<{ allowed: boolean; remaining: number; message?: string }> {
  try {
    const user = await storage.getUser(userId);
    
    // If no user found, treat as free with no prior usage
    if (!user) {
      return { allowed: true, remaining: FREE_PLAN_AI_LIMIT };
    }
    
    const plan = user.subscriptionPlan || 'free';
    
    // Premium users (monthly/yearly/premium_plus plans) - check their specific budget limits
    if (plan === 'monthly' || plan === 'yearly' || plan === 'premium_plus') {
      // Each plan has its own 25% budget limit
      // monthly: R$19.90 * 25% = R$4.97/month
      // yearly: R$149.90 * 25% = R$37.47/year
      // premium_plus: R$289.00 * 25% = R$72.25/year
      const monthlySpend = user.aiSpendMonth ? Number(user.aiSpendMonth) : 0;
      const yearlySpend = user.aiSpendYear ? Number(user.aiSpendYear) : 0;
      
      // Set limits based on plan
      let monthlyLimit = 0;
      let yearlyLimit = 0;
      
      if (plan === 'monthly') {
        monthlyLimit = 4.97; // 25% of R$19.90
      } else if (plan === 'yearly') {
        yearlyLimit = 37.47; // 25% of R$149.90
      } else if (plan === 'premium_plus') {
        yearlyLimit = 72.25; // 25% of R$289.00
      }
      
      // Check monthly limit (for monthly plan)
      if (monthlyLimit > 0 && monthlySpend >= monthlyLimit) {
        return {
          allowed: false,
          remaining: 0,
          message: `Limite de IA do plano mensal atingido (R$${monthlyLimit.toFixed(2)}). Faça upgrade para Premium Plus para mais créditos.`
        };
      }
      
      // Check yearly limit (for yearly and premium_plus plans)
      if (yearlyLimit > 0 && yearlySpend >= yearlyLimit) {
        if (plan === 'premium_plus') {
          return {
            allowed: false,
            remaining: 0,
            message: `Limite de IA do plano Premium Plus atingido (R$${yearlyLimit.toFixed(2)}/ano). O limite será renovado no próximo período.`
          };
        } else {
          return {
            allowed: false,
            remaining: 0,
            message: `Limite de IA do plano anual atingido (R$${yearlyLimit.toFixed(2)}). Faça upgrade para Premium Plus para mais créditos.`
          };
        }
      }
      
      return { allowed: true, remaining: -1 }; // Still has budget
    }
    
    // FREE USERS: Check 25% budget limit
    const monthlySpend = user.aiSpendMonth ? Number(user.aiSpendMonth) : 0;
    const yearlySpend = user.aiSpendYear ? Number(user.aiSpendYear) : 0;
    const monthlyLimit = user.aiMonthlyBudgetLimit ? Number(user.aiMonthlyBudgetLimit) : 0;
    const yearlyLimit = user.aiAnnualBudgetLimit ? Number(user.aiAnnualBudgetLimit) : 0;

    // Block AI if exceeded 25% monthly limit
    if (monthlyLimit > 0 && monthlySpend >= monthlyLimit) {
      return {
        allowed: false,
        remaining: 0,
        message: `Limite de orçamento mensal de IA atingido (25% do mês). Tente novamente no próximo mês ou adquira um plano superior.`
      };
    }

    // Block AI if exceeded 25% yearly limit
    if (yearlyLimit > 0 && yearlySpend >= yearlyLimit) {
      return {
        allowed: false,
        remaining: 0,
        message: `Limite de orçamento anual de IA atingido (25% do ano). Tente novamente no próximo ano ou adquira um plano superior.`
      };
    }
    
    return { allowed: true, remaining: FREE_PLAN_AI_LIMIT };
  } catch (error) {
    console.error("[AI Quota] Error checking quota:", error);
    return { allowed: true, remaining: FREE_PLAN_AI_LIMIT };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Run database migrations
  await runMigrations();
  
  // Initialize push notification tables
  await initPushTables();
  
  // Import bcrypt for password reset
  const bcrypt = await import("bcryptjs");

  // Password Reset Token Storage (in-memory for simplicity)
  const resetTokens = new Map<string, { email: string; expiresAt: number }>();

  // Generate secure random token
  function generateResetToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Forgot password - request reset link
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration attacks
      if (!user) {
        console.log(`[Forgot Password] Email not found: ${email}`);
        return res.json({ message: "Se este email estiver cadastrado, você receberá um link de recuperação." });
      }

      // Generate reset token
      const token = generateResetToken();
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      // Store token
      resetTokens.set(token, { email: user.email!, expiresAt });

      // Clean up expired tokens periodically
      const entriesToDelete: string[] = [];
      resetTokens.forEach((data, t) => {
        if (data.expiresAt < Date.now()) {
          entriesToDelete.push(t);
        }
      });
      entriesToDelete.forEach(t => resetTokens.delete(t));

      // In production, send email with link
      // For now, log the token (development only)
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
      console.log(`\n📧 [Password Reset] Link para ${email}:`);
      console.log(`   ${resetLink}\n`);

      res.json({ 
        message: "Se este email estiver cadastrado, você receberá um link de recuperação.",
        // In development, return the link for testing
        ...(process.env.NODE_ENV !== 'production' && { resetLink })
      });
    } catch (error: any) {
      console.error("Erro ao processar forgot-password:", error);
      res.status(500).json({ message: "Erro ao processar solicitação" });
    }
  });

  // Reset password - set new password
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token e senha são obrigatórios" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Senha deve ter pelo menos 6 caracteres" });
      }

      // Find and validate token
      const tokenData = resetTokens.get(token);
      
      if (!tokenData) {
        return res.status(400).json({ message: "Link inválido ou expirado. Solicite um novo link." });
      }

      if (tokenData.expiresAt < Date.now()) {
        resetTokens.delete(token);
        return res.status(400).json({ message: "Link expirado. Solicite um novo link." });
      }

      // Find user
      const user = await storage.getUserByEmail(tokenData.email);
      if (!user) {
        resetTokens.delete(token);
        return res.status(400).json({ message: "Usuário não encontrado" });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update user password
      await storage.updateUserPassword(user.id, passwordHash);

      // Invalidate token
      resetTokens.delete(token);

      console.log(`✅ Password reset successful for: ${tokenData.email}`);
      res.json({ message: "Senha redefinida com sucesso" });
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      res.status(500).json({ message: "Erro ao redefinir senha" });
    }
  });

  // Debug: Create confirmed user (temporary for testing)
  app.post('/api/auth/debug/create-confirmed-user', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ message: "Supabase not configured" });
      }

      // Create user using admin API - already confirmed
      const { data, error } = await (supabaseAdmin.auth.admin as any).createUser({
        email,
        password,
        email_confirm: true, // Mark as confirmed
        user_metadata: {
          first_name: firstName || 'User',
          last_name: lastName || '',
        },
      });

      if (error) {
        console.error("[Debug] Create user error:", error);
        return res.status(400).json({ message: error.message });
      }

      console.log("[Debug] User created and confirmed:", data.user?.id);
      res.json({ message: "Usuário criado e confirmado com sucesso!", user: data.user });
    } catch (error: any) {
      console.error("[Debug] Error:", error);
      res.status(500).json({ message: "Erro ao criar usuário", error: error.message });
    }
  });

  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      let user = await storage.getUser(userId);
      
      if (!user) {
        const isAdmin = userEmail === 'fabrisite1@gmail.com';
        
        user = await storage.upsertUser({
          id: userId,
          email: userEmail,
          firstName: req.user.claims.first_name || 'User',
          lastName: req.user.claims.last_name || '',
          profileImageUrl: req.user.claims.profile_image_url,
          role: isAdmin ? 'admin' : 'user',
        });
        
        if (isAdmin) {
          console.log(`✅ Admin user created: ${userEmail}`);
        }
      }
      
      // Omit passwordHash from response for security
      const { passwordHash: _, ...safeUser } = user;
      res.json(safeUser);
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

  // Upload profile image
  app.post('/api/profile/upload-image', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { imageData } = req.body;

      if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ message: "imageData é obrigatório" });
      }

      // Validate base64 image (should start with data:image/)
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: "Formato de imagem inválido" });
      }

      const updatedUser = await storage.updateUserImage(userId, imageData);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Erro ao fazer upload de imagem:", error);
      res.status(500).json({ message: "Falha ao fazer upload de imagem" });
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

  // Bible Commentary Route (with Global Cache for cost reduction)
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

      // Check user-specific cache first
      const userCached = await storage.getVerseCommentary(
        userId,
        book,
        parseInt(chapter),
        parseInt(verse),
        version,
        commentaryType
      );

      if (userCached) {
        console.log(`[Commentary] User cache hit for ${userId}: ${book} ${chapter}:${verse} (${commentaryType})`);
        return res.json(userCached);
      }

      // Check global cache (shared across all users) to reduce API costs
      const globalCached = await storage.getVerseCommentary(
        'global',
        book,
        parseInt(chapter),
        parseInt(verse),
        version,
        commentaryType
      );

      if (globalCached) {
        console.log(`[Commentary] Global cache hit: ${book} ${chapter}:${verse} (${commentaryType}) - saving API cost`);
        // Copy global commentary to user's cache for faster future access
        const userCommentary = await storage.createVerseCommentary({
          userId,
          book,
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          version,
          commentaryType,
          content: globalCached.content,
          source: 'cache',
        });
        return res.json(userCommentary);
      }

      // Check AI quota for free plan users (only for new AI-generated content)
      const quota = await checkAiQuota(userId);
      if (!quota.allowed) {
        // BLOCK ONLY IA ACCESS, keep app accessible
        return res.status(429).json({ 
          error: quota.message,
          remaining: quota.remaining,
          upgradeUrl: '/pricing'
        });
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

      console.log(`[Commentary] Generating ${commentaryType}: ${book} ${chapter}:${verse} (new API call)`);

      // Generate commentary with full chapter context
      const content = await generateCommentary(
        book,
        parseInt(chapter),
        parseInt(verse),
        verseData.text,
        commentaryType,
        chapterData
      );

      // Increment AI request counter and track spending for free plan users
      const user = await storage.getUser(userId);
      let spending = null;
      if (!user?.subscriptionPlan || user.subscriptionPlan === 'free') {
        await storage.incrementAiRequests(userId);
        console.log(`[AI Quota] User ${userId} used an AI request`);
        
        // Track spending (25% budget limit)
        try {
          spending = await storage.trackAISpending(userId, AI_REQUEST_COST);
          console.log(`[AI Budget] User ${userId} spending tracked - Monthly remaining: $${spending.monthlyRemaining.toFixed(2)}, Yearly remaining: $${spending.yearlyRemaining.toFixed(2)}`);
        } catch (trackError) {
          console.error("[AI Budget] Error tracking spending:", trackError);
        }
      }

      // Save to BOTH global cache and user cache
      // Global cache for future users (reduces API costs significantly)
      await storage.createVerseCommentary({
        userId: 'global',
        book,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        version,
        commentaryType,
        content,
        source: 'ai',
      });

      // User cache for quick personal access
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
          verse: 16,
          version: 'nvi',
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

  // Subscription Routes (Stripe Integration)
  app.post("/api/subscriptions/checkout", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: "Sistema de pagamentos não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente." 
        });
      }

      const userId = req.user.claims.sub;
      const { priceId, planType } = req.body;

      if (!priceId || !planType) {
        return res.status(400).json({ error: "priceId e planType são obrigatórios" });
      }

      // Get or create Stripe customer
      let user = await storage.getUser(userId);
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserSubscription(userId, { stripeCustomerId: customerId });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.headers.origin}/planos?success=true`,
        cancel_url: `${req.headers.origin}/planos?canceled=true`,
        metadata: { userId, planType },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Erro ao criar checkout session:", error);
      res.status(500).json({ error: "Falha ao criar sessão de checkout: " + error.message });
    }
  });

  app.post("/api/subscriptions/portal", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Sistema de pagamentos não configurado" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: "Você não possui uma assinatura ativa" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${req.headers.origin}/planos`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Erro ao criar portal session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/subscriptions/status", async (req: any, res) => {
    try {
      // If user is not authenticated, return free plan
      if (!req.user) {
        return res.json({
          plan: 'free',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          aiRequestsToday: 0,
          aiRequestsResetAt: null,
        });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      res.json({
        plan: user?.subscriptionPlan || 'free',
        stripeCustomerId: user?.stripeCustomerId || null,
        stripeSubscriptionId: user?.stripeSubscriptionId || null,
        aiRequestsToday: user?.aiRequestsToday || 0,
        aiRequestsResetAt: user?.aiRequestsResetAt || null,
      });
    } catch (error: any) {
      console.error("Erro ao buscar status da assinatura:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Webhook for subscription updates
  app.post("/api/webhooks/stripe", async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured" });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (endpointSecret && sig) {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        
        if (userId && planType) {
          await storage.updateUserSubscription(userId, {
            subscriptionPlan: planType,
            stripeSubscriptionId: session.subscription as string,
          });
          console.log(`✅ Subscription activated for user ${userId}: ${planType}`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Find user by customer ID and downgrade
        const user = await storage.getUserByStripeCustomerId(customerId as string);
        if (user) {
          await storage.updateUserSubscription(user.id, {
            subscriptionPlan: 'free',
            stripeSubscriptionId: null,
          });
          console.log(`⚠️ Subscription canceled for user ${user.id}`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;
        
        if (status === 'active') {
          const user = await storage.getUserByStripeCustomerId(customerId as string);
          if (user) {
            const planType = subscription.items.data[0]?.price?.lookup_key || user.subscriptionPlan;
            await storage.updateUserSubscription(user.id, {
              subscriptionPlan: planType,
            });
          }
        }
        break;
      }
    }

    res.json({ received: true });
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
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valor inválido para doação" });
      }

      const user = await storage.getUser(userId);
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserSubscription(userId, { stripeCustomerId: customerId });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency || "brl",
        customer: customerId,
        setup_future_usage: "off_session",
        metadata: {
          userId,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Erro ao criar payment intent:", error);
      res.status(500).json({ error: "Falha ao criar payment intent: " + error.message });
    }
  });

  app.get("/api/stripe/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe não configurado" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.stripeCustomerId) {
        return res.json({ paymentMethods: [] });
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });

      const cards = paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand || "unknown",
        last4: pm.card?.last4 || "****",
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
      }));

      res.json({ paymentMethods: cards });
    } catch (error: any) {
      console.error("Erro ao buscar payment methods:", error);
      res.status(500).json({ error: "Falha ao buscar cartões salvos" });
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
  app.post("/api/ai/study", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

      // Check AI quota for free plan users
      const quota = await checkAiQuota(userId);
      if (!quota.allowed) {
        return res.status(429).json({ 
          error: quota.message,
          remaining: quota.remaining,
          upgradeUrl: '/pricing'
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

      // Increment AI request counter for free plan users
      const user = await storage.getUser(userId);
      if (!user?.subscriptionPlan || user.subscriptionPlan === 'free') {
        await storage.incrementAiRequests(userId);
        console.log(`[AI Quota] User ${userId} used an AI request (study)`);
      }

      res.json({ answer, remaining: quota.remaining > 0 ? quota.remaining - 1 : -1 });
    } catch (error: any) {
      console.error("Erro ao chamar OpenAI:", error);
      res.status(500).json({ error: "Erro ao processar sua pergunta. Por favor, tente novamente." });
    }
  });

  // ============================================
  // PUSH NOTIFICATIONS
  // ============================================

  // Get VAPID public key for client subscription
  app.get("/api/notifications/vapid-key", (req, res) => {
    const key = getVapidPublicKey();
    if (!key) {
      return res.status(503).json({ error: "Push notifications not configured" });
    }
    res.json({ publicKey: key });
  });

  // Subscribe to push notifications
  app.post("/api/notifications/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subscription } = req.body;
      
      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({ error: "Invalid subscription data" });
      }
      
      await savePushSubscription(userId, subscription, req.headers['user-agent']);
      res.json({ success: true, message: "Subscription saved" });
    } catch (error: any) {
      console.error("[Push] Subscribe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Unsubscribe from push notifications
  app.post("/api/notifications/unsubscribe", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { endpoint } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({ error: "Endpoint required" });
      }
      
      await removePushSubscription(userId, endpoint);
      res.json({ success: true, message: "Subscription removed" });
    } catch (error: any) {
      console.error("[Push] Unsubscribe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get notification preferences
  app.get("/api/notifications/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await getNotificationPreferences(userId);
      res.json(preferences);
    } catch (error: any) {
      console.error("[Push] Get preferences error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update notification preferences
  app.patch("/api/notifications/preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updated = await updateNotificationPreferences(userId, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("[Push] Update preferences error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mark notification as clicked
  app.post("/api/notifications/clicked", async (req, res) => {
    try {
      const { notificationId } = req.body;
      if (notificationId) {
        await markNotificationClicked(notificationId);
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("[Push] Mark clicked error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send test notification (for debugging)
  app.post("/api/notifications/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await sendPushNotification(userId, {
        title: "BíbliaFS",
        body: getRandomInsight('reading'),
        icon: "/icons/icon-192x192.png",
        tag: "test",
        data: { url: "/" },
      });
      res.json(result);
    } catch (error: any) {
      console.error("[Push] Test notification error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
