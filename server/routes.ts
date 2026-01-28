// Authentication: Supabase Auth with JWT, AI with OpenAI, Payments with Stripe
import express, { type Express } from "express";
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
  insertSharedLinkSchema,
  insertFeedbackSchema,
} from "@shared/schema";
import { readingPlanTemplates } from "./seed-reading-plans";
import { achievements as seedAchievements } from "./seed-achievements";
import { runMigrations } from "./migrations";
import { fetchBibleChapter } from "./multilingual-bible-apis";

// Temporary email domain blocklist
const BLOCKED_DOMAINS = new Set([
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'disposablemail.com',
  'throwaway.email',
  'yopmail.com',
  'trashmail.com',
  'temp-mail.com',
  'maildrop.cc',
  'sharklasers.com',
  'tempmail.io',
  'temp-mail.io',
  'fakeinbox.com',
  'mytrashmail.com',
  '0-mail.com',
  'jetable.org',
  'pokemail.net',
  'temp.email',
  'tempalias.com',
  'alias.email',
  'hide.email',
  'temp-mails.com',
  'mailnesia.com',
  'spam4.me',
  'grr.la',
  'temp.sh',
  '1secmail.com',
]);

function isValidEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  if (BLOCKED_DOMAINS.has(domain)) return false;
  // Basic check: must have at least one dot
  if (!domain.includes('.')) return false;
  return true;
}

// Map Portuguese book names to abbreviations
const BOOK_NAME_TO_ABBREV: Record<string, string> = {
  'Gênesis': 'gn', 'Êxodo': 'ex', 'Levítico': 'lv', 'Números': 'nm', 'Deuteronômio': 'dt',
  'Josué': 'js', 'Juízes': 'jz', 'Rute': 'rt', '1 Samuel': '1sm', '2 Samuel': '2sm',
  '1 Reis': '1rs', '2 Reis': '2rs', '1 Crônicas': '1cr', '2 Crônicas': '2cr',
  'Esdras': 'ed', 'Neemias': 'ne', 'Ester': 'et', 'Jó': 'job', 'Salmos': 'sl',
  'Provérbios': 'pv', 'Eclesiastes': 'ec', 'Cânticos': 'ct', 'Isaías': 'is',
  'Jeremias': 'jr', 'Lamentações': 'lm', 'Ezequiel': 'ez', 'Daniel': 'dn',
  'Oséias': 'os', 'Joel': 'jl', 'Amós': 'am', 'Obadias': 'ob', 'Jonas': 'jn',
  'Miquéias': 'mq', 'Naum': 'na', 'Habacuque': 'hc', 'Sofonias': 'sf',
  'Ageu': 'ag', 'Zacarias': 'zc', 'Malaquias': 'ml',
  'Mateus': 'mt', 'Marcos': 'mc', 'Lucas': 'lc', 'João': 'jo', 'Atos': 'at',
  'Romanos': 'rm', '1 Coríntios': '1co', '2 Coríntios': '2co', 'Gálatas': 'gl',
  'Efésios': 'ef', 'Filipenses': 'fp', 'Colossenses': 'cl',
  '1 Tessalonicenses': '1ts', '2 Tessalonicenses': '2ts',
  '1 Timóteo': '1tm', '2 Timóteo': '2tm', 'Tito': 'tt', 'Filemom': 'fm',
  'Hebreus': 'hb', 'Tiago': 'tg', '1 Pedro': '1pe', '2 Pedro': '2pe',
  '1 João': '1jo', '2 João': '2jo', '3 João': '3jo', 'Judas': 'jd', 'Apocalipse': 'ap',
};

function getBookAbbreviation(bookName: string): string {
  return BOOK_NAME_TO_ABBREV[bookName] || bookName.toLowerCase().substring(0, 2);
}
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

// AI Rate Limiting Constants - Limits by plan
// FREE: 20 total (never resets) - must subscribe to continue
// Monthly: 500/month (resets monthly)
// Yearly/Annual: 3750/year (resets yearly)
// Premium Plus: 7200/year (resets yearly)
const AI_PLAN_LIMITS: Record<string, { limit: number; resetPeriod: 'never' | 'monthly' | 'yearly' }> = {
  free: { limit: 20, resetPeriod: 'never' },
  monthly: { limit: 500, resetPeriod: 'monthly' },
  yearly: { limit: 3750, resetPeriod: 'yearly' },
  annual: { limit: 3750, resetPeriod: 'yearly' },
  premium_plus: { limit: 7200, resetPeriod: 'yearly' },
};

const AI_REQUEST_COST = 0.01; // Cost per AI request in USD (for tracking)

// Helper to check AI quota for ALL users (based on their plan limits)
async function checkAiQuota(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number; plan: string; message?: string }> {
  try {
    const user = await storage.getUser(userId);
    
    // If no user found, treat as free with no prior usage
    if (!user) {
      return { allowed: true, remaining: 20, limit: 20, plan: 'free' };
    }
    
    const plan = user.subscriptionPlan || 'free';
    const config = AI_PLAN_LIMITS[plan] || AI_PLAN_LIMITS.free;
    const now = new Date();
    
    let totalRequests = user.aiRequestsCount || 0;
    const resetAt = user.aiRequestsResetAt;
    
    // Check if counter should be reset based on plan period
    if (config.resetPeriod !== 'never' && resetAt && now >= new Date(resetAt)) {
      // Period has passed, counter will be reset on next increment
      totalRequests = 0;
    }
    
    const remaining = Math.max(0, config.limit - totalRequests);
    
    // Check if limit reached
    if (totalRequests >= config.limit) {
      let message = "";
      
      if (plan === 'free') {
        message = "Você esgotou suas 20 perguntas gratuitas. Para continuar usando a IA, assine um de nossos planos.";
      } else if (plan === 'monthly') {
        message = `Você usou todas as ${config.limit} perguntas do mês. O limite será renovado no próximo mês.`;
      } else if (plan === 'yearly' || plan === 'annual') {
        message = `Você usou todas as ${config.limit} perguntas do ano. O limite será renovado no próximo período.`;
      } else if (plan === 'premium_plus') {
        message = `Você usou todas as ${config.limit} perguntas do ano. Entre em contato para um plano customizado.`;
      }
      
      return {
        allowed: false,
        remaining: 0,
        limit: config.limit,
        plan,
        message
      };
    }

    // Warning at 75% of limit
    const warningThreshold = Math.floor(config.limit * 0.75);
    if (totalRequests >= warningThreshold && remaining > 0) {
      let upgradeMessage = "";
      
      if (plan === 'free') {
        upgradeMessage = `Atenção: Você tem apenas ${remaining} perguntas restantes. Assine um plano para continuar usando a IA.`;
      } else {
        upgradeMessage = `Atenção: Você tem ${remaining} perguntas restantes no período atual.`;
      }
      
      return {
        allowed: true,
        remaining,
        limit: config.limit,
        plan,
        message: upgradeMessage
      };
    }
    
    return { allowed: true, remaining, limit: config.limit, plan };
  } catch (error) {
    console.error("[AI Quota] Error checking quota:", error);
    return { allowed: true, remaining: 0, limit: 20, plan: 'free' };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Android App Links verification - serves assetlinks.json for Deep Links
  app.get("/.well-known/assetlinks.json", (req, res) => {
    const assetLinks = [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.bibliafullstack.app",
          sha256_cert_fingerprints: [
            // Debug signing key fingerprint (for development APKs)
            "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"
          ]
        }
      }
    ];
    res.setHeader("Content-Type", "application/json");
    res.json(assetLinks);
  });

  // Serve bible.db in production (static file serving workaround)
  // In development, Vite middleware serves from client/public
  // In production, we need to serve from dist/public explicitly
  const path = await import("path");
  const fs = await import("fs");
  const { fileURLToPath } = await import("url");
  
  // Get directory name in ES modules (no __dirname in ES modules)
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  
  app.get("/bible.db", (req, res) => {
    // Try multiple locations for the bible.db file
    const possiblePaths = [
      path.resolve(process.cwd(), "dist/public/bible.db"),
      path.resolve(process.cwd(), "client/public/bible.db"),
      path.resolve(currentDir, "../dist/public/bible.db"),
      path.resolve(currentDir, "../client/public/bible.db"),
    ];
    
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Cache-Control", "public, max-age=86400"); // 24h cache
        return res.sendFile(filePath);
      }
    }
    
    console.warn("[bible.db] File not found in any location:", possiblePaths);
    res.status(404).json({ error: "bible.db not found" });
  });

  // App version check endpoint for update popup
  // LATEST_VERSION: Update this when releasing a new version to Play Store
  const LATEST_VERSION = process.env.APP_LATEST_VERSION || "2.1.0";
  
  app.get("/api/app/version", (req, res) => {
    const currentVersion = req.query.current as string;
    
    if (!currentVersion) {
      return res.json({
        currentVersion: LATEST_VERSION,
        latestVersion: LATEST_VERSION,
        updateAvailable: false,
        downloadSize: "~18 MB",
        releaseNotes: []
      });
    }
    
    const updateAvailable = compareVersions(LATEST_VERSION, currentVersion) > 0;
    
    res.json({
      currentVersion,
      latestVersion: LATEST_VERSION,
      updateAvailable,
      downloadSize: "~18 MB",
      releaseNotes: [
        { icon: "sparkles", title: "Design Premium", description: "Novo visual com cores suaves e elegantes" },
        { icon: "zap", title: "Modo Offline", description: "Leia a Bíblia sem internet" },
        { icon: "bug", title: "Correções", description: "Melhorias de estabilidade e performance" },
      ]
    });
  });
  
  // Compare semantic versions (returns 1 if a > b, -1 if a < b, 0 if equal)
  function compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA > numB) return 1;
      if (numA < numB) return -1;
    }
    return 0;
  }

  // Atividade recente isolada por usuário
  app.get("/api/activity/recent", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.id) {
        return res.status(401).json({ error: "Não autorizado" });
      }
      const userId = user.id;
      const { formatDistanceToNow } = await import("date-fns");
      const { ptBR } = await import("date-fns/locale");

      // Buscar orações recentes
      const prayers = await storage.getPrayers(userId);
      const recentPrayers = (prayers || []).slice(0, 2).map(p => ({
        type: 'prayer',
        text: "Nova oração registrada",
        time: formatDistanceToNow(new Date(p.createdAt || new Date()), { addSuffix: true, locale: ptBR }),
        date: new Date(p.createdAt || new Date())
      }));

      // Buscar posts recentes
      const posts = await storage.getCommunityPosts(10, userId);
      const recentPosts = (posts || [])
        .filter(p => p.userId === userId)
        .slice(0, 2)
        .map(p => ({
          type: 'post',
          text: "Você publicou na comunidade",
          time: formatDistanceToNow(new Date(p.createdAt || new Date()), { addSuffix: true, locale: ptBR }),
          date: new Date(p.createdAt || new Date())
        }));

      // Buscar planos de leitura ativos
      const plans = await storage.getReadingPlans(userId);
      const recentPlans = (plans || [])
        .filter(p => p.updatedAt) // Somente planos que tiveram progresso real
        .slice(0, 1)
        .map(p => ({
          type: 'read',
          text: `Você progrediu no plano: ${p.title}`,
          time: formatDistanceToNow(new Date(p.updatedAt!), { addSuffix: true, locale: ptBR }),
          date: new Date(p.updatedAt!)
        }));

      const allActivity = [...recentPrayers, ...recentPosts, ...recentPlans]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

      res.json(allActivity);
    } catch (error) {
      console.error("[Activity] Error:", error);
      res.status(500).json({ error: "Erro ao buscar atividades" });
    }
  });
  
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

      // Generate reset link - use production domain for redirect
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://bibliafs.com.br'
        : process.env.REPLIT_DOMAINS 
          ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
          : `${req.protocol}://${req.get('host')}`;
      
      // Use Supabase resetPasswordForEmail to send email automatically
      if (!supabaseAdmin) {
        throw new Error("Supabase Admin client not initialized");
      }
      
      // In production, redirectTo must match exactly one of the allowed Redirect URLs in Supabase dashboard
      // Configure in Supabase: https://bibliafs.com.br/**
      const redirectTo = `${baseUrl}/reset-password`;
      console.log(`[Forgot Password] BaseURL: ${baseUrl}, RedirectTo: ${redirectTo}`);

      // Use resetPasswordForEmail which SENDS the email automatically (not just generates link)
      const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });

      if (resetError) {
        console.error("[Forgot Password] Supabase Error:", resetError);
        // Don't expose error details to prevent email enumeration
        return res.json({ message: "Se este email estiver cadastrado, você receberá um link de recuperação." });
      }

      console.log(`✅ [Password Reset] Email enviado via Supabase para: ${email}`);
      return res.json({ message: "Se este email estiver cadastrado, você receberá um link de recuperação." });
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

  // Generate 6-digit OTP code
  function generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email using Nodemailer
  async function sendOTPEmail(email: string, code: string): Promise<boolean> {
    try {
      // Try to send email using Resend API (cloud email service)
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (resendApiKey) {
        // Use Resend API if configured
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'noreply@bibliafs.com',
            to: email,
            subject: 'Código de Verificação BíbliaFS',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #333;">Bem-vindo à BíbliaFS! 🙏</h2>
                <p>Seu código de verificação é:</p>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                  <h1 style="font-size: 36px; color: #667eea; letter-spacing: 5px; margin: 0;">${code}</h1>
                </div>
                <p style="color: #666;">Este código expira em 1 hora.</p>
                <p style="color: #999; font-size: 12px;">Que a Palavra de Deus ilumine seus dias!</p>
              </div>
            `,
          }),
        });
        
        if (response.ok) {
          console.log(`✅ [Resend] Email enviado para ${email}`);
          return true;
        }
      }
      
      // Fallback: log in console for development
      console.log(`\n📧 [OTP Email] Código para ${email}: ${code}`);
      console.log(`⚠️  Email real não foi enviado. Configure RESEND_API_KEY para enviar emails de verdade.\n`);
      return true; // Still return true so registration works
      
    } catch (error) {
      console.error("[OTP Email] Error:", error);
      console.log(`📧 Código: ${code}`); // Always log code as fallback
      return true; // Don't fail registration if email fails
    }
  }

  // Register with OTP code (creates user and sends 6-digit code)
  app.post('/api/auth/register-with-otp', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      // Validate email domain (block temporary/disposable emails)
      if (!isValidEmailDomain(email)) {
        return res.status(400).json({ message: "Por favor, use um endereço de e-mail válido. E-mails temporários não são permitidos." });
      }
      
      // Create user with confirmed email (so they don't get signup link)
      if (!supabaseAdmin) {
        throw new Error("Supabase Admin client not initialized");
      }
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirm email immediately to avoid signup link
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });
      
      if (createError || !newUser?.user) {
        console.error("[Register OTP] Error creating user:", createError);
        
        // Check for specific error messages
        const errorMessage = createError?.message || "Erro ao criar conta";
        const errorCode = (createError as any)?.code || "";
        
        // Email already exists
        if (errorMessage.includes("already") || errorCode === "email_exists") {
          return res.status(400).json({ message: "Este e-mail já está registrado. Tente fazer login ou use um e-mail diferente." });
        }
        
        if (errorMessage.includes("password")) {
          return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
        }
        
        return res.status(400).json({ message: errorMessage });
      }
      
      console.log(`✅ User created: ${email}`);
      
      // Generate 6-digit OTP code
      const code = generateOTPCode();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Delete old OTPs for this email
      await storage.deleteOTPByEmail(email);
      
      // Save OTP to database
      await storage.createOTP({ email, code, expiresAt });
      
      // Send email with the OTP code
      const emailSent = await sendOTPEmail(email, code);
      
      if (!emailSent) {
        console.warn(`[Register OTP] Email sending failed, but user was created. Code: ${code}`);
      }
      
      console.log(`[Register OTP] OTP created for ${email}, expires at ${expiresAt.toISOString()}`);
      
      res.json({ 
        message: "Conta criada! Verifique seu e-mail para o código OTP.",
        email,
        userId: newUser.user.id,
        // In development, return code for testing
        ...(process.env.NODE_ENV !== 'production' && { code }),
      });
    } catch (error: any) {
      console.error("[Register OTP] Unexpected error:", error);
      res.status(500).json({ message: "Erro ao criar conta: " + (error?.message || "erro desconhecido") });
    }
  });

  // Verify OTP code
  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "Email e código são obrigatórios" });
      }
      
      if (code.length !== 6) {
        return res.status(400).json({ message: "Código deve ter 6 dígitos" });
      }
      
      // Verify OTP
      const isValid = await storage.verifyOTP(email, code);
      
      if (!isValid) {
        return res.status(400).json({ message: "Código inválido ou expirado" });
      }
      
      // Clean up OTP after successful verification
      await storage.deleteOTPByEmail(email);
      
      console.log(`✅ Email verified: ${email}`);
      res.json({ message: "Email verificado com sucesso!", verified: true });
    } catch (error: any) {
      console.error("[Verify OTP] Error:", error);
      res.status(500).json({ message: "Erro ao verificar código" });
    }
  });

  // Resend OTP code
  app.post('/api/auth/resend-otp', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }
      
      // Generate new code
      const code = generateOTPCode();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Delete old and create new
      await storage.deleteOTPByEmail(email);
      await storage.createOTP({ email, code, expiresAt });
      
      // Send email with the new OTP code
      await sendOTPEmail(email, code);
      
      res.json({ 
        message: "Novo código enviado!",
        ...(process.env.NODE_ENV !== 'production' && { code })
      });
    } catch (error: any) {
      console.error("[Resend OTP] Error:", error);
      res.status(500).json({ message: "Erro ao reenviar código" });
    }
  });

  // Debug: Create confirmed user (ONLY available in development)
  app.post('/api/auth/debug/create-confirmed-user', async (req, res) => {
    // SECURITY: Block in production
    if (process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1') {
      return res.status(404).json({ message: "Not found" });
    }
    
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

  // Logout endpoint
  app.post('/api/auth/logout', isAuthenticated, async (req: any, res) => {
    try {
      // Sign out from Supabase
      if (supabaseAdmin) {
        await supabaseAdmin.auth.signOut();
      }
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      res.status(500).json({ message: "Falha ao fazer logout" });
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

  // Update user profile (name)
  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;

      if (!firstName || !lastName) {
        return res.status(400).json({ error: "Primeiro e último nomes são obrigatórios" });
      }

      if (firstName.length > 50 || lastName.length > 50) {
        return res.status(400).json({ error: "Nomes muito longos" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const updated = await storage.updateUserTheme(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      res.json({ success: true, user: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create user podcast - Auto-generates episodes based on Bible book
  app.post("/api/podcasts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, bibleBook, category } = req.body;
      
      console.log('[Podcast] Creating podcast:', { title, description, bibleBook, category, userId });
      
      // Validate required fields
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: "Título é obrigatório" });
      }
      
      // Bible book is required for auto-generation
      if (!bibleBook || typeof bibleBook !== 'string') {
        return res.status(400).json({ error: "Livro da Bíblia é obrigatório para criar um podcast" });
      }
      
      // Find the book in our fallback data to get chapter count
      const { BIBLE_BOOKS_FALLBACK } = await import('./bible-books-fallback');
      const bookInfo = BIBLE_BOOKS_FALLBACK.find(
        (b: any) => b.name.toLowerCase() === bibleBook.toLowerCase() || 
                    b.abbrev.pt.toLowerCase() === bibleBook.toLowerCase()
      );
      
      if (!bookInfo) {
        return res.status(400).json({ error: "Livro da Bíblia não encontrado" });
      }
      
      // Auto-generate episodes for each chapter
      const episodes: Array<{
        id: string;
        title: string;
        description: string;
        audioData: string;
        duration: number;
        publishedAt: string;
        chapterNumber: number;
        bookAbbrev: string;
      }> = [];
      
      for (let chapter = 1; chapter <= bookInfo.chapters; chapter++) {
        episodes.push({
          id: `ep-${bookInfo.abbrev.pt}-${chapter}-${Date.now()}`,
          title: `${bookInfo.name} ${chapter}`,
          description: `Leitura narrada de ${bookInfo.name} capítulo ${chapter}`,
          audioData: "", // Audio will be generated on-demand when user plays
          duration: 0, // Will be updated when audio is generated
          publishedAt: new Date().toISOString(),
          chapterNumber: chapter,
          bookAbbrev: bookInfo.abbrev.pt,
        });
      }
      
      const podcastData = {
        title: title.trim().substring(0, 200),
        description: description ? description.substring(0, 1000) : `Leitura narrada de ${bookInfo.name} - ${bookInfo.chapters} capítulos`,
        author: req.user.claims.username || "BíbliaFS",
        category: (category || "BíbliaFS Rádio").substring(0, 50),
        creatorId: userId,
        bibleBook: bookInfo.name,
        bibleChapter: null, // null means all chapters
        language: "pt",
        isActive: true,
        accessLevel: "free",
        episodes: episodes,
        totalEpisodes: episodes.length,
      };
      
      console.log('[Podcast] Auto-generated', episodes.length, 'episodes for', bookInfo.name);
      
      const podcast = await storage.createPodcast(podcastData);
      
      console.log('[Podcast] Saved successfully with', podcast.totalEpisodes, 'episodes');
      
      res.json(podcast);
    } catch (error: any) {
      console.error('[Podcast] Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update podcast (title/description)
  app.patch("/api/podcasts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description } = req.body;
      
      const podcast = await storage.getPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ error: "Podcast não encontrado" });
      }
      if (podcast.creatorId !== userId) {
        return res.status(403).json({ error: "Você não tem permissão para editar este podcast" });
      }
      
      const updates: any = {};
      if (title && typeof title === 'string') {
        updates.title = title.trim().substring(0, 200);
      }
      if (description !== undefined) {
        updates.description = (description || "").substring(0, 1000);
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Nenhum campo para atualizar" });
      }
      
      await storage.updatePodcast(req.params.id, updates);
      const updated = await storage.getPodcast(req.params.id);
      
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete podcast
  app.delete("/api/podcasts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const podcast = await storage.getPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ error: "Podcast não encontrado" });
      }
      
      // Permitir exclusão de podcasts padrão ou podcasts criados pelo usuário
      const isDefaultPodcast = ['pod-1', 'pod-2', 'pod-3'].includes(podcast.id);
      if (podcast.creatorId !== userId && !isDefaultPodcast) {
        return res.status(403).json({ error: "Você não tem permissão para excluir este podcast" });
      }
      
      await storage.deletePodcast(req.params.id);
      
      res.json({ success: true, message: "Podcast excluído com sucesso" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add episode to podcast
  app.post("/api/podcasts/:id/episodes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, audioData, duration } = req.body;
      
      // Validate required fields
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: "Título do episódio é obrigatório" });
      }
      
      // Verify ownership
      const podcast = await storage.getPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ error: "Podcast não encontrado" });
      }
      if (podcast.creatorId !== userId) {
        return res.status(403).json({ error: "Você não tem permissão para editar este podcast" });
      }
      
      // Check audio size (5MB limit for base64, which is ~7MB encoded)
      if (audioData && typeof audioData === 'string' && audioData.length > 7 * 1024 * 1024) {
        return res.status(400).json({ error: "Áudio muito grande. Máximo 5MB." });
      }
      
      // Validate duration (max 5 minutes = 300 seconds)
      const validDuration = Math.min(Math.max(0, Number(duration) || 0), 300);
      
      const newEpisode = {
        id: `ep-${Date.now()}`,
        title: title.trim().substring(0, 200),
        description: (description || "").substring(0, 1000),
        audioData: audioData || "",
        duration: validDuration,
        publishedAt: new Date().toISOString(),
      };
      
      // Safely merge episodes array
      const existingEpisodes = Array.isArray(podcast.episodes) ? podcast.episodes : [];
      const episodes = [...existingEpisodes, newEpisode];
      
      await storage.updatePodcast(req.params.id, {
        episodes,
        totalEpisodes: episodes.length,
      });
      
      res.json(newEpisode);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's own podcasts
  app.get("/api/podcasts/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const podcasts = await storage.getUserPodcasts(userId);
      res.json(podcasts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single podcast with episodes
  app.get("/api/podcasts/:id", async (req, res) => {
    try {
      const podcast = await storage.getPodcast(req.params.id);
      if (!podcast) {
        return res.status(404).json({ error: "Podcast não encontrado" });
      }
      res.json(podcast);
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

  // AI-powered lesson content generation
  app.post("/api/teacher/generate-lesson-content", isAuthenticated, async (req: any, res) => {
    try {
      const { title, scriptureBase, duration = 50 } = req.body;
      const userId = req.user?.id || req.user?.claims?.sub;
      
      if (!title || !scriptureBase) {
        return res.status(400).json({ error: "Título e texto-base são obrigatórios" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "Serviço de IA indisponível" });
      }
      
      // Check AI quota for free plan users
      const quota = await checkAiQuota(userId);
      if (!quota.allowed) {
        return res.status(429).json({
          error: quota.message,
          remaining: quota.remaining,
          limitReached: true
        });
      }

      // Calcular quantidade de conteúdo baseado em duração
      const numObjectives = duration <= 30 ? 2 : duration <= 60 ? 4 : 6;
      const numContentBlocks = duration <= 30 ? 3 : duration <= 60 ? 5 : 7;
      const numQuestions = duration <= 30 ? 2 : duration <= 60 ? 5 : 8;

      const prompt = `Você é um assistente especializado em educação bíblica. Gere conteúdo COMPLETO para uma aula bíblica de ${duration} minutos.

Título da Aula: ${title}
Texto-Base: ${scriptureBase}
Duração: ${duration} minutos

ESTRUTURA DA AULA:
1. Descrição concisa (o que é a aula)
2. ${numObjectives} Objetivos de aprendizado
3. ${numContentBlocks} BLOCOS DE CONTEÚDO PRINCIPAL (com 2-3 pontos cada, com versículos bíblicos)
4. ${numQuestions} PERGUNTAS PARA DISCUSSÃO com RESPOSTAS/GABARITO (para o FINAL da aula)

Responda em JSON com a seguinte estrutura:
{
  "description": "Uma descrição concisa da aula (2-3 frases)",
  "objectives": ["Objetivo 1", "Objetivo 2", ...],
  "contentBlocks": [
    {
      "title": "Título do bloco de conteúdo",
      "content": "2-3 parágrafos explicativos com versículos bíblicos (ex: João 3:16) e aplicações práticas"
    },
    {
      "title": "Segundo bloco",
      "content": "Conteúdo detalhado..."
    },
    ...
  ],
  "questions": [
    {"question": "Pergunta de reflexão para o final", "answer": "Resposta/gabarito (2-3 frases com fundamentação)"},
    ...
  ]
}

REGRAS IMPORTANTES:
- ${numContentBlocks} blocos de conteúdo é OBRIGATÓRIO
- Cada bloco tem TÍTULO + CONTEÚDO substantivo (não genérico)
- Use versículos bíblicos reais para fundamentar
- Perguntas vêm no FINAL da aula para discussão
- Para ${duration} minutos: tempo proporcionalmente distribuído
- TODAS as respostas em português do Brasil`;

      const openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openaiInstance.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Resposta vazia da IA");
      }

      const generated = JSON.parse(content);
      
      // Increment AI request counter for ALL users (function handles plan-specific logic)
      await storage.incrementAiRequests(userId);
      
      res.json(generated);
    } catch (error: any) {
      console.error("Erro ao gerar conteúdo com IA:", error);
      res.status(500).json({ error: "Falha ao gerar conteúdo" });
    }
  });

  // AI Assistant for Teachers - Ask questions about teaching content
  app.post("/api/teacher/ask-assistant", isAuthenticated, async (req: any, res) => {
    try {
      const { question, context } = req.body;
      const userId = req.user.claims.sub;
      
      if (!question) {
        return res.status(400).json({ error: "Pergunta é obrigatória" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "Serviço de IA indisponível" });
      }

      // Check AI quota using centralized function
      // FREE: 20 perguntas TOTAIS permanentes (NUNCA renova)
      // Premium plans have their own budget-based limits
      const quota = await checkAiQuota(userId);
      if (!quota.allowed) {
        return res.status(429).json({ 
          error: "Limite de conversas atingido",
          message: quota.message,
          limitReached: true,
          remaining: quota.remaining
        });
      }

      const prompt = `Você é um assistente pedagógico especializado em Educação Bíblica e teologia.

REGRA PRINCIPAL - FOCO ABSOLUTO:
- Responda EXCLUSIVAMENTE sobre o que foi perguntado
- Se o contexto menciona um livro específico (ex: João, Gênesis, Salmos), fale APENAS sobre esse livro
- NUNCA desvie para outros livros ou temas que não foram perguntados
- NUNCA dê respostas genéricas sobre "a Bíblia em geral"
- Analise a pergunta e o contexto para identificar o tema ESPECÍFICO

Contexto da Aula: ${context || "Educação bíblica cristã"}
Pergunta do Professor: ${question}

IMPORTANTE: 
- Forneça uma resposta ESPECÍFICA e NÃO GENÉRICA baseada no contexto acima
- Use exemplos concretos DAQUELE livro/tema específico
- Cite versículos DO LIVRO MENCIONADO no contexto
- Dê sugestões práticas para usar em sala de aula sobre AQUELE tema
- Responda em português brasileiro`;

      const openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openaiInstance.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
      });

      const answer = response.choices[0]?.message?.content;
      if (!answer || answer.trim() === "") {
        console.error("Resposta vazia da IA para pergunta:", question, "Response:", response);
        return res.status(500).json({ error: "Resposta vazia da IA - tente novamente" });
      }

      console.log("✅ Assistente respondeu com sucesso:", { 
        question: question.substring(0, 50), 
        answerLength: answer.length,
        answer: answer.substring(0, 150) 
      });

      // Increment AI request counter for ALL users (function handles plan-specific logic)
      const { totalCount, limit, plan: userPlan } = await storage.incrementAiRequests(userId);
      
      // Calculate remaining for frontend
      const remaining = Math.max(0, limit - totalCount);
      
      res.json({ 
        answer,
        conversationsUsed: totalCount,
        conversationsLimit: limit,
        conversationsRemaining: remaining,
        remaining,
        plan: userPlan,
        limitReached: totalCount >= limit
      });
    } catch (error: any) {
      console.error("Erro no assistente IA:", error);
      res.status(500).json({ error: "Falha ao processar pergunta" });
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
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          error: "Serviço de áudio não configurado",
          message: "Configure OPENAI_API_KEY para habilitar áudio narrado."
        });
      }

      // Check cache first
      try {
        const { db } = await import("./db");
        const { audioCache } = await import("@shared/schema");
        const { sql } = await import("drizzle-orm");
        
        const cached = await db.query.audioCache.findFirst({
          where: sql`language = ${language} AND version = ${version} AND book = ${book} AND chapter = ${parseInt(chapter)} AND verse = ${parseInt(verse)}`
        });

        if (cached) {
          console.log(`[Audio] Verse cache hit for ${book} ${chapter}:${verse}`);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Disposition', `inline; filename="${book}-${chapter}-${verse}-${language}.mp3"`);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('X-Cache', 'HIT');
          res.send(Buffer.from(cached.audioData, 'base64'));
          return;
        }
      } catch (cacheErr) {
        console.warn("[Audio] Verse cache check failed:", cacheErr);
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

      console.log(`[Audio] Generating verse audio: ${book} ${chapter}:${verse} (${verseText.length} chars)`);

      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'nova',
          input: verseText,
          speed: 1.0,
        }),
      });

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error(`OpenAI TTS error: ${ttsResponse.status}`, errorText);
        throw new Error(`OpenAI TTS failed: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      // Save to cache
      try {
        const { db } = await import("./db");
        const { audioCache } = await import("@shared/schema");
        
        await db.insert(audioCache).values({
          language,
          version,
          book,
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          audioData: audioBase64,
        }).onConflictDoNothing();
        console.log(`[Audio] Cached verse audio for ${book} ${chapter}:${verse}`);
      } catch (cacheErr) {
        console.warn("[Audio] Verse cache save failed:", cacheErr);
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${book}-${chapter}-${verse}-${language}.mp3"`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      res.send(Buffer.from(audioBuffer));
    } catch (error: any) {
      console.error("Verse audio generation error:", error?.message || error);
      res.status(500).json({ error: "Erro ao gerar áudio do versículo", details: error?.message });
    }
  });

  // Get book metadata (for book audio playlist)
  app.get("/api/bible/book-info/:book", async (req: any, res) => {
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

      // Check cache first
      try {
        const { db } = await import("./db");
        const { audioCache } = await import("@shared/schema");
        const { sql } = await import("drizzle-orm");
        
        const cached = await db.query.audioCache.findFirst({
          where: sql`language = ${language} AND version = ${version} AND book = ${book} AND chapter = ${parseInt(chapter)} AND verse IS NULL`
        });

        if (cached) {
          console.log(`[Audio] Cache hit for ${book} ${chapter} - returning cached audio`);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Disposition', `inline; filename="${book}-${chapter}-${language}.mp3"`);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('X-Cache', 'HIT');
          res.send(Buffer.from(cached.audioData, 'base64'));
          return;
        }
      } catch (cacheErr) {
        console.warn("[Audio] Cache check failed:", cacheErr);
        // Continue without cache
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
      const MAX_TTS_CHARS = 4000; // OpenAI limit is 4096, leave some margin
      
      console.log(`[Audio] Generating ${language} audio for ${book} ${chapter} (${textLength} chars) - User: ${userId}`);

      // Split text into chunks respecting sentence boundaries
      const splitTextIntoChunks = (text: string, maxChars: number): string[] => {
        if (text.length <= maxChars) return [text];
        
        const chunks: string[] = [];
        let currentChunk = "";
        
        // Split by verse numbers to maintain logical breaks
        const versePattern = /(\d+\.\s)/g;
        const parts = text.split(versePattern).filter(p => p.trim());
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          
          if ((currentChunk + part).length > maxChars && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = part;
          } else {
            currentChunk += part;
          }
        }
        
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        
        return chunks.length > 0 ? chunks : [text.substring(0, maxChars)];
      };

      const textChunks = splitTextIntoChunks(fullText, MAX_TTS_CHARS);
      console.log(`[Audio] Text split into ${textChunks.length} chunks`);

      // Generate audio for each chunk
      const audioBuffers: ArrayBuffer[] = [];
      
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        console.log(`[Audio] Generating chunk ${i + 1}/${textChunks.length} (${chunk.length} chars)`);
        
        const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'nova',
            input: chunk,
            speed: 1.0,
          }),
        });

        if (!ttsResponse.ok) {
          const errorText = await ttsResponse.text();
          console.error(`OpenAI TTS error on chunk ${i + 1}: ${ttsResponse.status}`, errorText);
          throw new Error(`OpenAI TTS failed on chunk ${i + 1}: ${ttsResponse.status}`);
        }

        const chunkBuffer = await ttsResponse.arrayBuffer();
        audioBuffers.push(chunkBuffer);
      }

      // Concatenate all audio buffers
      const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
      const audioBuffer = new ArrayBuffer(totalLength);
      const uint8View = new Uint8Array(audioBuffer);
      let offset = 0;
      for (const buf of audioBuffers) {
        uint8View.set(new Uint8Array(buf), offset);
        offset += buf.byteLength;
      }
      
      console.log(`[Audio] Combined ${audioBuffers.length} chunks into ${totalLength} bytes`);
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      // Save to cache
      try {
        const { db } = await import("./db");
        const { audioCache } = await import("@shared/schema");
        
        await db.insert(audioCache).values({
          language,
          version,
          book,
          chapter: parseInt(chapter),
          audioData: audioBase64,
        }).onConflictDoNothing();
        console.log(`[Audio] Cached audio for ${book} ${chapter}`);
      } catch (cacheErr) {
        console.warn("[Audio] Cache save failed:", cacheErr);
        // Don't fail - just skip cache save
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${book}-${chapter}-${language}.mp3"`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Cache', 'MISS');
      
      res.send(Buffer.from(audioBuffer));
    } catch (error: any) {
      console.error("Audio generation error:", error?.message || error);
      res.status(500).json({ error: "Erro ao gerar áudio", details: error?.message });
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
    // Include all verses in chapter for comprehensive context
    const surroundingVerses = chapterData.verses
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
  app.get("/api/bible/commentary/:version/:book/:chapter/:verse", async (req: any, res) => {
    try {
      // Use guest ID if not authenticated
      const userId = req.user?.claims?.sub || 'guest';
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

      // Increment AI request counter for ALL users (function handles plan-specific logic)
      await storage.incrementAiRequests(userId);
      
      // Track spending for analytics
      try {
        await storage.trackAISpending(userId, AI_REQUEST_COST);
      } catch (trackError) {
        console.error("[AI Budget] Error tracking spending:", trackError);
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

  // AI-powered semantic Bible search
  app.post("/api/bible/ai-search", isAuthenticated, async (req: any, res) => {
    try {
      const { query } = req.body;
      const userId = req.user.claims.sub;
      
      if (!query || query.length < 3) {
        return res.status(400).json({ error: "Busca deve ter pelo menos 3 caracteres" });
      }

      // Check AI quota
      const quotaCheck = await checkAiQuota(userId);
      if (!quotaCheck.allowed) {
        return res.status(429).json({ 
          error: quotaCheck.message || "Limite de IA atingido",
          remaining: quotaCheck.remaining 
        });
      }

      const openai = new OpenAI();
      
      const systemPrompt = `Você é um especialista em Bíblia e teologia. O usuário fará uma pergunta ou buscará por um tema.
Sua tarefa é retornar versículos bíblicos relevantes para a busca.

IMPORTANTE: Retorne um JSON válido com a seguinte estrutura:
{
  "summary": "Um breve resumo de 1-2 frases sobre o tema na Bíblia",
  "results": [
    {
      "reference": "João 3:16",
      "book": "jo",
      "chapter": 3,
      "verse": 16,
      "text": "Texto do versículo aqui",
      "relevance": "Alta"
    }
  ]
}

Regras:
- Retorne entre 3 e 8 versículos mais relevantes
- Use abreviações de livros em português minúsculo: gn, ex, lv, nm, dt, js, jz, rt, 1sm, 2sm, 1rs, 2rs, 1cr, 2cr, ed, ne, et, job, sl, pv, ec, ct, is, jr, lm, ez, dn, os, jl, am, ob, jn, mq, na, hc, sf, ag, zc, ml, mt, mc, lc, jo, at, rm, 1co, 2co, gl, ef, fp, cl, 1ts, 2ts, 1tm, 2tm, tt, fm, hb, tg, 1pe, 2pe, 1jo, 2jo, 3jo, jd, ap
- Relevance deve ser: "Alta", "Média" ou "Relacionado"
- Use a tradução NVI ou ARC para o texto
- Retorne APENAS o JSON, sem markdown ou explicações adicionais`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      // Track AI spending for premium users and increment counter for FREE users
      await storage.trackAISpending(userId, AI_REQUEST_COST);
      
      // Increment AI request counter for ALL users (function handles plan-specific logic)
      await storage.incrementAiRequests(userId);

      const responseText = completion.choices[0]?.message?.content || "";
      
      try {
        // Clean up the response - remove markdown code blocks if present
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.slice(7);
        }
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.slice(3);
        }
        if (cleanJson.endsWith("```")) {
          cleanJson = cleanJson.slice(0, -3);
        }
        cleanJson = cleanJson.trim();
        
        const result = JSON.parse(cleanJson);
        res.json({
          query,
          summary: result.summary || "",
          results: result.results || [],
        });
      } catch (parseError) {
        console.error("[AI Search] Failed to parse response:", responseText);
        res.status(500).json({ 
          error: "Erro ao processar resposta da IA",
          query,
          results: []
        });
      }
    } catch (error: any) {
      console.error("[AI Search] Error:", error);
      res.status(500).json({ 
        error: error.message || "Erro na busca com IA",
        query: req.body.query,
        results: []
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

  app.post("/api/reading-plans/custom", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { version, book, startChapter, endChapter, verses, title } = req.body;

      if (!book || !startChapter || !endChapter) {
        return res.status(400).json({ error: "Livro, capítulo inicial e final são obrigatórios" });
      }

      // Generate schedule - one day per chapter
      const chapters: number[] = [];
      for (let i = parseInt(startChapter); i <= parseInt(endChapter); i++) {
        chapters.push(i);
      }

      const schedule = chapters.map((chapter, index) => ({
        day: index + 1,
        readings: [{
          book,
          chapter,
          verses: verses || undefined
        }],
        isCompleted: false
      }));

      const data = {
        userId,
        title: title || `${book} ${startChapter}-${endChapter}`,
        description: `Leitura customizada: ${book} capítulos ${startChapter}-${endChapter}`,
        totalDays: chapters.length,
        currentDay: 1,
        schedule,
        isCompleted: false,
        planType: "custom"
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

  // Get daily verse
  app.get("/api/daily-verse", async (req, res) => {
    try {
      // Get user timezone from query param, default to America/Sao_Paulo (UTC-3)
      const timezone = (req.query.tz as string) || "America/Sao_Paulo";
      
      // Calculate day of year based on user's local timezone
      const now = new Date();
      let dayOfYear: number;
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        const parts = formatter.formatToParts(now);
        const dateParts: Record<string, string> = {};
        parts.forEach(p => dateParts[p.type] = p.value);
        const localDate = new Date(parseInt(dateParts.year), parseInt(dateParts.month) - 1, parseInt(dateParts.day));
        const startOfYear = new Date(localDate.getFullYear(), 0, 0);
        const diff = localDate.getTime() - startOfYear.getTime();
        dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      } catch (e) {
        const startOfYear = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - startOfYear.getTime();
        dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
      }

      console.log(`[DailyVerse] TZ: ${timezone}, DayOfYear: ${dayOfYear}`);

      let dailyVerse = await storage.getDailyVerseByDayOfYear(dayOfYear);

      if (!dailyVerse) {
        // Import curated verses (365 verses - one for each day, no repeat for 8+ months)
        const { curatedVerses, bookNames } = await import("./data/daily-verses");

        // Select verse based on day of year (cycling through 365 verses)
        const verseIndex = (dayOfYear - 1) % curatedVerses.length;
        const selectedVerse = curatedVerses[verseIndex];

        try {
          dailyVerse = await storage.createDailyVerse({
            dayOfYear,
            book: selectedVerse.book,
            chapter: selectedVerse.chapter,
            verse: selectedVerse.verse,
            version: selectedVerse.version,
            theme: selectedVerse.theme
          });
        } catch (e) {
          console.error("[DailyVerse] Error creating verse:", e);
        }

        // Return curated verse even if save failed
        if (!dailyVerse) {
          return res.json({
            id: `temp-${dayOfYear}`,
            reference: `${selectedVerse.book.toUpperCase()} ${selectedVerse.chapter}:${selectedVerse.verse}`,
            text: selectedVerse.text,
            version: selectedVerse.version,
            theme: selectedVerse.theme,
            dayOfYear
          });
        }
      }

      if (dailyVerse) {
        // Import book names and curated verses for lookup
        const { curatedVerses, bookNames } = await import("./data/daily-verses");
        const bookName = bookNames[dailyVerse.book] || dailyVerse.book.toUpperCase();
        
        // Find matching verse text
        const matchedVerse = curatedVerses.find(v => 
          v.book === dailyVerse!.book && v.chapter === dailyVerse!.chapter && v.verse === dailyVerse!.verse
        );
        
        res.json({
          id: dailyVerse.id,
          reference: `${bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`,
          text: matchedVerse?.text || "Versículo do dia",
          version: dailyVerse.version,
          theme: dailyVerse.theme,
          dayOfYear: dailyVerse.dayOfYear
        });
      } else {
        res.status(404).json({ error: "Versículo não disponível" });
      }
    } catch (error: any) {
      console.error("[Daily Verse] Error:", error);
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

      // Verify customer exists in Stripe (handles test->live migration)
      if (customerId) {
        try {
          await stripe.customers.retrieve(customerId);
        } catch (e: any) {
          if (e.code === 'resource_missing') {
            // Customer doesn't exist in current Stripe mode, create new one
            customerId = null;
          } else {
            throw e;
          }
        }
      }

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
        success_url: `${req.headers.origin || process.env.VITE_APP_URL || 'http://localhost:5000'}/planos?success=true`,
        cancel_url: `${req.headers.origin || process.env.VITE_APP_URL || 'http://localhost:5000'}/planos?canceled=true`,
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
        return_url: `${req.headers.origin || process.env.VITE_APP_URL || 'http://localhost:5000'}/planos`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Erro ao criar portal session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/subscriptions/cancel", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Sistema de pagamentos não configurado" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ error: "Você não possui uma assinatura ativa" });
      }

      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      await storage.updateUserSubscription(userId, {
        subscriptionPlan: 'free',
        stripeSubscriptionId: null,
      });

      res.json({ success: true, message: "Assinatura cancelada com sucesso" });
    } catch (error: any) {
      console.error("Erro ao cancelar assinatura:", error);
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
  app.post("/api/webhooks/stripe", express.raw({type: 'application/json'}), async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured" });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (endpointSecret && sig) {
        // req.body is Buffer when using express.raw() middleware
        const body = typeof req.body === 'string' ? req.body : req.body.toString('utf8');
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
      } else {
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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
  
  // Donation amount validation constants (in cents)
  const PRESET_DONATION_AMOUNTS = [1000, 2500, 5000, 10000]; // R$10, R$25, R$50, R$100
  const MIN_CUSTOM_DONATION = 100; // R$1.00 minimum
  const MAX_CUSTOM_DONATION = 100000000; // R$1.000.000.00 maximum
  
  // Helper function to validate donation amount (security - never trust frontend values)
  function validateDonationAmount(amountInCents: number): { valid: boolean; error?: string } {
    if (!amountInCents || typeof amountInCents !== 'number') {
      return { valid: false, error: "Valor inválido para doação" };
    }
    
    // Check if it's a preset amount
    if (PRESET_DONATION_AMOUNTS.includes(amountInCents)) {
      return { valid: true };
    }
    
    // Check if it's within custom range
    if (amountInCents >= MIN_CUSTOM_DONATION && amountInCents <= MAX_CUSTOM_DONATION) {
      return { valid: true };
    }
    
    return { 
      valid: false, 
      error: `Valor deve ser no mínimo R$1` 
    };
  }
  
  app.post("/api/donations/checkout", isAuthenticated, async (req: any, res) => {
    try {
      console.log('[Donation] Received request body:', JSON.stringify(req.body));
      console.log('[Donation] Headers:', JSON.stringify({
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent']
      }));
      
      if (!stripe) {
        return res.status(503).json({ 
          error: "Sistema de doações não configurado. Configure STRIPE_SECRET_KEY nas variáveis de ambiente." 
        });
      }

      const { amount, currency, type, destination, isAnonymous, message } = req.body;
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;
      
      console.log('[Donation] Parsed values:', { amount, currency, type, destination, userId, userEmail });
      
      // Server-side validation - NEVER trust frontend values
      const amountInCents = Math.round(Number(amount));
      console.log('[Donation] Amount in cents:', amountInCents);
      
      const validation = validateDonationAmount(amountInCents);
      
      if (!validation.valid) {
        console.log('[Donation] Validation failed:', validation.error);
        return res.status(400).json({ error: validation.error });
      }

      const user = await storage.getUser(userId);
      let customerId = user?.stripeCustomerId;

      // Verify customer exists in Stripe (handles test->live migration)
      if (customerId) {
        try {
          await stripe.customers.retrieve(customerId);
        } catch (e: any) {
          if (e.code === 'resource_missing') {
            // Customer doesn't exist in current Stripe mode, create new one
            customerId = null;
          } else {
            throw e;
          }
        }
      }

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserSubscription(userId, { stripeCustomerId: customerId });
      }

      const isRecurring = type === 'recurring';
      const mode = isRecurring ? 'subscription' : 'payment';

      // Build valid base URL (Android apps may not send proper origin header)
      const origin = req.headers.origin;
      console.log('[Donation] Request headers origin:', origin);
      console.log('[Donation] VITE_APP_URL env:', process.env.VITE_APP_URL);
      
      // Always use production URL for Android to ensure valid https URL
      const baseUrl = 'https://bibliafs.com.br';
      console.log('[Donation] Using baseUrl:', baseUrl);
      
      const sessionConfig = {
        customer: customerId,
        mode: mode as 'subscription' | 'payment',
        payment_method_types: ['card' as const],
        line_items: [{
          price_data: {
            currency: currency || 'brl',
            product_data: {
              name: 'Doação - BíbliaFS',
              description: destination === 'bible_translation' ? 'Doação para Tradução Bíblica' : 'Doação para Operações do App',
            },
            unit_amount: amountInCents,
            ...(isRecurring && { recurring: { interval: 'month' as const } }),
          },
          quantity: 1,
        }],
        success_url: `${baseUrl}/doar?success=true`,
        cancel_url: `${baseUrl}/doar?canceled=true`,
        metadata: { 
          userId, 
          type: 'donation',
          donationType: type,
          destination: destination || 'app_operations',
          isAnonymous: isAnonymous ? 'true' : 'false',
          message: message || '',
        },
      };
      
      console.log('[Donation] Session config:', JSON.stringify(sessionConfig, null, 2));

      // Create checkout session with card only (secure - Stripe handles all card data)
      const session = await stripe.checkout.sessions.create(sessionConfig as any);
      
      console.log('[Donation] Session created successfully:', session.id);

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error("[Donation] Stripe error details:", {
        message: error.message,
        type: error.type,
        code: error.code,
        param: error.param,
        raw: error.raw
      });
      res.status(500).json({ error: "Falha ao criar sessão de checkout: " + error.message });
    }
  });

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

      // Call OpenAI API with enhanced theological context
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um teólogo experiente e professor de estudos bíblicos com conhecimento profundo das Escrituras.

REGRA PRINCIPAL - FOCO ABSOLUTO:
- Responda EXCLUSIVAMENTE sobre o que foi perguntado
- Se a pergunta é sobre João, fale APENAS sobre o Evangelho de João
- Se a pergunta é sobre Gênesis, fale APENAS sobre Gênesis
- NUNCA desvie para outros livros ou temas que não foram perguntados
- NUNCA dê respostas genéricas sobre "a Bíblia em geral"
- Analise a pergunta e identifique: livro, capítulo, versículo ou tema ESPECÍFICO

REGRAS ADICIONAIS:
1. SEMPRE cite versículos ESPECÍFICOS do livro/texto perguntado
2. Explique o contexto histórico e cultural DAQUELE texto específico
3. Mencione o autor, destinatários e propósito DAQUELE livro específico
4. Use linguagem acessível mas precisa teologicamente
5. Quando houver diferentes interpretações, apresente as principais perspectivas
6. Estruture sua resposta com parágrafos claros
7. Cite comentaristas bíblicos clássicos quando relevante

FORMATO DE RESPOSTA:
- Contexto do texto perguntado (1-2 parágrafos)
- Explicação específica (2-3 parágrafos)  
- Aplicação prática (1 parágrafo)
- Versículos relacionados DO MESMO LIVRO para estudo

Responda em português do Brasil.`
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      let answer = completion.choices[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";
      
      // Enrich response with Bible context
      if (answer && answer.length > 0) {
        // Add source attribution if not already there
        if (!answer.toLowerCase().includes('referência') && !answer.toLowerCase().includes('versículo')) {
          answer += "\n\nPara estudos mais aprofundados, recomendo consultar as referências bíblicas mencionadas e comentários teológicos especializados.";
        }
      }

      // Increment AI request counter for ALL users (function handles plan-specific logic)
      const { totalCount, limit } = await storage.incrementAiRequests(userId);
      const remaining = Math.max(0, limit - totalCount);

      res.json({ answer, remaining });
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

  // Auth Routes - Redirect to Login/Register Pages
  app.get("/api/login", (req, res) => {
    res.redirect("/login");
  });

  app.get("/api/register", (req, res) => {
    res.redirect("/register");
  });

  // ============================================
  // STUDY GROUPS API
  // ============================================

  // Get all public groups + user's groups
  app.get("/api/groups", async (req: any, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's groups
  app.get("/api/groups/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single group
  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ error: "Grupo não encontrado" });
      }
      res.json(group);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create group
  app.post("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, description, isPublic } = req.body;
      
      if (!name || name.length < 3) {
        return res.status(400).json({ error: "Nome do grupo deve ter pelo menos 3 caracteres" });
      }
      
      const group = await storage.createGroup({
        name,
        description,
        isPublic: isPublic ?? false,
        leaderId: userId,
      });
      
      // Add creator as leader member
      try {
        await storage.addGroupMember(group.id, userId, "leader");
        console.log(`[Groups] User ${userId} added as leader to group ${group.id}`);
      } catch (memberError) {
        console.error(`[Groups] Error adding member: ${memberError}`);
        throw new Error("Falha ao adicionar criador ao grupo");
      }
      
      // Return group with member info
      res.json({
        ...group,
        role: "leader",
        joinedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error(`[Groups] Create error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  // Update group
  app.patch("/api/groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const group = await storage.updateGroup(req.params.id, userId, req.body);
      
      if (!group) {
        return res.status(404).json({ error: "Grupo não encontrado ou acesso negado" });
      }
      
      res.json(group);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete group
  app.delete("/api/groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteGroup(req.params.id, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Grupo não encontrado ou acesso negado" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get group members
  app.get("/api/groups/:id/members", async (req, res) => {
    try {
      const members = await storage.getGroupMembers(req.params.id);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/groups/:groupId/members/:memberId", isAuthenticated, async (req: any, res) => {
    try {
      const { groupId, memberId } = req.params;
      const { role } = req.body;
      const userId = req.user.id;

      const group = await storage.getGroup(groupId);
      if (!group || group.leaderId !== userId) {
        return res.status(403).json({ message: "Apenas o líder pode alterar cargos" });
      }

      await storage.updateGroupMemberRole(groupId, memberId, role);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/groups/:groupId/members/:memberId", isAuthenticated, async (req: any, res) => {
    try {
      const { groupId, memberId } = req.params;
      const userId = req.user.id;

      const group = await storage.getGroup(groupId);
      if (!group || group.leaderId !== userId) {
        return res.status(403).json({ message: "Apenas o líder pode remover membros" });
      }

      // No storage.ts, o método removeGroupMember espera (groupId, memberUserId)
      // Precisamos do userId do membro, não o ID da linha na tabela members
      const members = await storage.getGroupMembers(groupId);
      const member = members.find(m => m.id === memberId);
      
      if (!member) {
        return res.status(404).json({ message: "Membro não encontrado" });
      }

      await storage.removeGroupMember(groupId, member.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/invites/accept", isAuthenticated, async (req: any, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.id;
      
      const result = await storage.acceptInvite(code, userId);
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Join group
  app.post("/api/groups/:id/join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;
      
      // Check if group exists and is public
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "Grupo não encontrado" });
      }
      
      if (!group.isPublic) {
        return res.status(403).json({ error: "Este grupo é privado" });
      }
      
      // Check if already member
      const isMember = await storage.isGroupMember(groupId, userId);
      if (isMember) {
        return res.status(400).json({ error: "Você já é membro deste grupo" });
      }
      
      const member = await storage.addGroupMember(groupId, userId, "member");
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Leave group
  app.post("/api/groups/:id/leave", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.removeGroupMember(req.params.id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get group posts
  app.get("/api/groups/:id/posts", async (req, res) => {
    try {
      const posts = await storage.getGroupPosts(req.params.id);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // GROUP MESSAGES (Discussion/Chat)
  // ============================================

  // Get group messages
  app.get("/api/groups/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;
      
      // Check if user is member
      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ error: "Você precisa ser membro do grupo para ver as mensagens" });
      }
      
      const messages = await storage.getGroupMessages(groupId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send message to group
  app.post("/api/groups/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;
      const { content, verseReference, verseText, messageType } = req.body;
      
      // Check if user is member
      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ error: "Você precisa ser membro do grupo para enviar mensagens" });
      }
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Mensagem não pode estar vazia" });
      }
      
      const message = await storage.createGroupMessage({
        groupId,
        userId,
        content: content.trim(),
        verseReference,
        verseText,
        messageType: messageType || "text",
      });
      
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete message
  app.delete("/api/groups/:groupId/messages/:messageId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteGroupMessage(req.params.messageId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Mensagem não encontrada ou acesso negado" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // GROUP INVITES
  // ============================================

  // Create invite
  app.post("/api/groups/:id/invites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;
      const { email, phone } = req.body;
      
      // Check if user is leader or moderator
      const group = await storage.getGroup(groupId);
      if (!group) {
        return res.status(404).json({ error: "Grupo não encontrado" });
      }
      
      const members = await storage.getGroupMembers(groupId);
      const userMember = members.find(m => m.userId === userId);
      if (!userMember || (userMember.role !== "leader" && userMember.role !== "moderator")) {
        return res.status(403).json({ error: "Apenas líderes e moderadores podem convidar" });
      }
      
      if (!email && !phone) {
        return res.status(400).json({ error: "Email ou telefone é obrigatório" });
      }
      
      const invite = await storage.createGroupInvite({
        groupId,
        invitedBy: userId,
        invitedEmail: email || null,
        invitedPhone: phone || null,
      });
      
      res.json(invite);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get group invites
  app.get("/api/groups/:id/invites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;
      
      // Check if user is leader or moderator
      const members = await storage.getGroupMembers(groupId);
      const userMember = members.find(m => m.userId === userId);
      if (!userMember || (userMember.role !== "leader" && userMember.role !== "moderator")) {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const invites = await storage.getGroupInvites(groupId);
      res.json(invites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get my pending invites
  app.get("/api/invites/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.json([]);
      }
      
      const invites = await storage.getPendingInvitesForEmail(user.email);
      res.json(invites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Accept invite by code
  app.post("/api/invites/accept", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Código do convite é obrigatório" });
      }
      
      const result = await storage.acceptInvite(code.toUpperCase(), userId);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({ success: true, groupId: result.groupId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Search users by email
  app.get("/api/users/search", isAuthenticated, async (req: any, res) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== "string" || email.length < 3) {
        return res.json([]);
      }
      
      const users = await storage.searchUsersByEmail(email);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // GROUP DISCUSSIONS (AI Q&A Sessions)
  // ============================================

  // Get all discussions in a group
  app.get("/api/groups/:id/discussions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;
      
      // Check if user is member
      const isMember = await storage.isGroupMember(groupId, userId);
      if (!isMember) {
        return res.status(403).json({ error: "Você precisa ser membro do grupo" });
      }
      
      const discussions = await storage.getGroupDiscussions(groupId);
      res.json(discussions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a single discussion with answers
  app.get("/api/discussions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const discussion = await storage.getGroupDiscussion(req.params.id);
      if (!discussion) {
        return res.status(404).json({ error: "Discussão não encontrada" });
      }
      
      const answers = await storage.getDiscussionAnswers(req.params.id);
      res.json({ ...discussion, answers });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new discussion (AI generates question)
  app.post("/api/groups/:id/discussions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;
      const { title, description, verseReference, verseText, useAI } = req.body;
      
      // Check if user is leader or moderator
      const members = await storage.getGroupMembers(groupId);
      const userMember = members.find(m => m.userId === userId);
      if (!userMember || (userMember.role !== "leader" && userMember.role !== "moderator")) {
        return res.status(403).json({ error: "Apenas líderes e moderadores podem criar discussões" });
      }
      
      if (!title) {
        return res.status(400).json({ error: "Título é obrigatório" });
      }
      
      let question = req.body.question || "";
      
      // Generate question using AI if requested
      if (useAI && process.env.OPENAI_API_KEY) {
        // Check AI quota for free plan users
        const quota = await checkAiQuota(userId);
        if (!quota.allowed) {
          return res.status(429).json({
            error: quota.message,
            remaining: quota.remaining,
            limitReached: true
          });
        }
        
        try {
          const openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          
          const prompt = `Você é um líder de estudo bíblico experiente. Crie UMA pergunta reflexiva e profunda para discussão em grupo baseada no seguinte:

Tema: ${title}
${description ? `Descrição: ${description}` : ""}
${verseReference ? `Referência: ${verseReference}` : ""}
${verseText ? `Texto: "${verseText}"` : ""}

A pergunta deve:
- Estimular reflexão pessoal e compartilhamento
- Conectar o texto bíblico à vida prática
- Ser aberta (não sim/não)
- Ter profundidade teológica mas ser acessível

Responda APENAS com a pergunta, sem introdução ou explicação.`;

          const response = await openaiInstance.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            max_tokens: 200,
          });

          question = response.choices[0]?.message?.content?.trim() || "";
          
          // Increment AI request counter for ALL users (function handles plan-specific logic)
          await storage.incrementAiRequests(userId);
        } catch (aiError) {
          console.error("Erro ao gerar pergunta com IA:", aiError);
        }
      }
      
      if (!question) {
        return res.status(400).json({ error: "Pergunta é obrigatória (ou use IA para gerar)" });
      }
      
      const discussion = await storage.createGroupDiscussion({
        groupId,
        createdById: userId,
        title,
        description,
        question,
        verseReference,
        verseText,
        status: "open",
      });
      
      res.json(discussion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit an answer to a discussion
  app.post("/api/discussions/:id/answers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const discussionId = req.params.id;
      const { content, verseReference, isAnonymous } = req.body;
      
      const discussion = await storage.getGroupDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ error: "Discussão não encontrada" });
      }
      
      if (discussion.status === "closed") {
        return res.status(400).json({ error: "Esta discussão está encerrada" });
      }
      
      // Check if user is member of the group
      const isMember = await storage.isGroupMember(discussion.groupId, userId);
      if (!isMember) {
        return res.status(403).json({ error: "Você precisa ser membro do grupo" });
      }
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Resposta não pode estar vazia" });
      }
      
      const answer = await storage.createGroupAnswer({
        discussionId,
        userId,
        content: content.trim(),
        verseReference,
        isAnonymous: isAnonymous && discussion.allowAnonymous,
      });
      
      res.json(answer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Review an answer (leader only)
  app.patch("/api/answers/:id/review", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const answerId = req.params.id;
      const { status, comment } = req.body;
      
      if (!["excellent", "approved", "needs_review"].includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }
      
      // Get the answer and discussion to verify permissions
      const answers = await storage.getDiscussionAnswers(answerId);
      const answer = answers.find(a => a.id === answerId);
      
      if (!answer) {
        // Try getting answers for the discussion containing this answer
        const allDiscussions = await storage.getGroupDiscussions("");
        // We need a different approach - get the answer directly
      }
      
      const updated = await storage.reviewAnswer(answerId, userId, status, comment);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Synthesize answers using AI (leader only)
  app.post("/api/discussions/:id/synthesize", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const discussionId = req.params.id;
      
      const discussion = await storage.getGroupDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ error: "Discussão não encontrada" });
      }
      
      // Check if user is leader
      const members = await storage.getGroupMembers(discussion.groupId);
      const userMember = members.find(m => m.userId === userId);
      if (!userMember || userMember.role !== "leader") {
        return res.status(403).json({ error: "Apenas o líder pode sintetizar as respostas" });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ error: "Serviço de IA indisponível" });
      }
      
      // Check AI quota for free plan users
      const quota = await checkAiQuota(userId);
      if (!quota.allowed) {
        return res.status(429).json({
          error: quota.message,
          remaining: quota.remaining,
          limitReached: true
        });
      }
      
      // Get all answers
      const answers = await storage.getAnswersForSynthesis(discussionId);
      
      if (answers.length === 0) {
        return res.status(400).json({ error: "Nenhuma resposta para sintetizar" });
      }
      
      // Build answers text for AI
      const answersText = answers.map((a, i) => {
        const name = a.isAnonymous ? "Anônimo" : (a.userName || "Membro");
        return `${i + 1}. ${name}: "${a.content}"${a.verseReference ? ` (${a.verseReference})` : ""}`;
      }).join("\n\n");
      
      const prompt = `Você é um líder de estudo bíblico experiente. Analise as seguintes respostas dos membros do grupo à pergunta:

PERGUNTA: ${discussion.question}
${discussion.verseReference ? `TEXTO BASE: ${discussion.verseReference} - ${discussion.verseText}` : ""}

RESPOSTAS DOS MEMBROS:
${answersText}

Crie uma SÍNTESE que:
1. Identifique os TEMAS COMUNS nas respostas
2. Destaque as MELHORES CONTRIBUIÇÕES (sem citar nomes específicos)
3. Apresente uma REFLEXÃO INTEGRADORA que una os insights
4. Sugira APLICAÇÕES PRÁTICAS baseadas nas respostas
5. Inclua VERSÍCULOS RELACIONADOS que complementem a discussão

Formato da resposta:
## Temas Identificados
(lista dos principais temas)

## Destaques da Discussão
(melhores insights compartilhados)

## Reflexão Integradora
(síntese teológica)

## Aplicação Prática
(como aplicar na vida)

## Para Continuar Estudando
(versículos e recursos relacionados)`;

      const openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openaiInstance.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const synthesis = response.choices[0]?.message?.content;
      if (!synthesis) {
        throw new Error("Resposta vazia da IA");
      }
      
      // Increment AI request counter for ALL users (function handles plan-specific logic)
      await storage.incrementAiRequests(userId);
      
      // Save synthesis
      const updated = await storage.saveDiscussionSynthesis(discussionId, synthesis);
      
      res.json({ synthesis, discussion: updated });
    } catch (error: any) {
      console.error("Erro ao sintetizar:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Close a discussion
  app.patch("/api/discussions/:id/close", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const discussionId = req.params.id;
      
      const discussion = await storage.getGroupDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ error: "Discussão não encontrada" });
      }
      
      // Check if user is leader or moderator
      const members = await storage.getGroupMembers(discussion.groupId);
      const userMember = members.find(m => m.userId === userId);
      if (!userMember || (userMember.role !== "leader" && userMember.role !== "moderator")) {
        return res.status(403).json({ error: "Apenas líderes podem encerrar discussões" });
      }
      
      const updated = await storage.closeGroupDiscussion(discussionId);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // TEACHING OUTLINES API
  // ============================================

  // Get user's teaching outlines
  app.get("/api/teacher/outlines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outlines = await storage.getTeachingOutlines(userId);
      res.json(outlines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single outline
  app.get("/api/teacher/outlines/:id", isAuthenticated, async (req, res) => {
    try {
      const outline = await storage.getTeachingOutline(req.params.id);
      res.json(outline || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create outline
  app.post("/api/teacher/outlines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outline = await storage.createTeachingOutline({
        ...req.body,
        teacherId: userId,
      });
      res.json(outline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update outline
  app.patch("/api/teacher/outlines/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const outline = await storage.updateTeachingOutline(req.params.id, userId, req.body);
      
      if (!outline) {
        return res.status(404).json({ error: "Esboço não encontrado ou acesso negado" });
      }
      
      res.json(outline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete outline
  app.delete("/api/teacher/outlines/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteTeachingOutline(req.params.id, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Esboço não encontrado ou acesso negado" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // BIBLE VERSION COMPARISON API
  // ============================================

  // Compare verses across multiple versions
  // Note: Version comparison is handled client-side using the SQLite database
  // This endpoint provides metadata and format for the comparison view
  app.get("/api/bible/compare/:book/:chapter/:verse", async (req, res) => {
    try {
      const { book, chapter, verse } = req.params;
      const versions = (req.query.versions as string || "nvi,acf,arc,ra").split(",");
      
      // Return metadata for client-side comparison
      // Actual verse text is fetched from client SQLite database
      res.json({
        reference: `${book} ${chapter}:${verse}`,
        book,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        versions: versions.map(v => v.toUpperCase()),
        message: "Use client-side SQLite for verse text",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Compare full chapter across versions
  app.get("/api/bible/compare/:book/:chapter", async (req, res) => {
    try {
      const { book, chapter } = req.params;
      const versions = (req.query.versions as string || "nvi,acf").split(",").slice(0, 3);
      
      res.json({
        reference: `${book} ${chapter}`,
        book,
        chapter: parseInt(chapter),
        versions: versions.map(v => v.toUpperCase()),
        message: "Use client-side SQLite for verse text",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // BIBLE AUDIO PROGRESS API
  // ============================================

  // Get audio progress for a chapter
  app.get("/api/audio/progress/:book/:chapter", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { book, chapter } = req.params;
      const version = (req.query.version || "ARA") as string;

      const progress = await storage.getAudioProgress(userId, book, parseInt(chapter), version);
      res.json(progress || { playbackPosition: 0, totalDuration: 0, completed: false });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save audio progress
  app.post("/api/audio/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { book, chapter, version = "ARA", playbackPosition, totalDuration, completed } = req.body;

      if (!book || !chapter) {
        return res.status(400).json({ error: "Livro e capítulo são obrigatórios" });
      }

      const progress = await storage.upsertAudioProgress(userId, {
        book,
        chapter: parseInt(chapter),
        version,
        playbackPosition: parseInt(playbackPosition) || 0,
        totalDuration: parseInt(totalDuration) || 0,
        completed: !!completed,
        lastPlayedAt: new Date(),
      });

      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all audio progress for user
  app.get("/api/audio/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserAudioProgress(userId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Shared links tracking
  app.post("/api/bible/share", async (req: any, res) => {
    try {
      const { book, chapter, verse, version, platform } = req.body;
      const userId = req.user?.claims?.sub || null;

      if (!book || !chapter || !verse || !version) {
        return res.status(400).json({ message: "Dados de compartilhamento incompletos" });
      }

      await storage.createSharedLink({
        userId,
        book,
        chapter,
        verse,
        version,
        platform
      });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error("[Share Tracking] Error:", error);
      res.status(500).json({ message: "Erro ao registrar compartilhamento" });
    }
  });

  // Feedback routes - Allow anonymous feedback if not authenticated
  app.post("/api/feedback", async (req: any, res) => {
    try {
      const { type, score, comment } = req.body;
      const userId = req.user?.claims?.sub || null; // Optional userId if authenticated

      if (!type) {
        return res.status(400).json({ message: "Tipo de feedback é obrigatório" });
      }

      const feedback = await storage.createFeedback({
        userId,
        type,
        score: score !== undefined ? score : null,
        comment: comment || null,
      });

      res.json(feedback);
    } catch (error: any) {
      console.error("[Feedback] Error:", error);
      res.status(500).json({ message: "Erro ao enviar feedback" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
