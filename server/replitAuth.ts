// Simple session-based authentication (no external OAuth)
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { readFileSync } from "fs";
import { join } from "path";

function getDatabaseUrl(): string {
  // First, try to get from internal environment cache (most stable)
  try {
    const envCachePath = join(process.env.HOME || '/home/runner', 'workspace/.cache/replit/env/latest.json');
    const envCache = JSON.parse(readFileSync(envCachePath, 'utf8'));
    if (envCache.environment?.DATABASE_URL && envCache.environment.DATABASE_URL.startsWith('postgresql://')) {
      return envCache.environment.DATABASE_URL;
    }
  } catch (e) {
    // Ignore cache read errors
  }

  // Fallback to environment variable
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    return process.env.DATABASE_URL;
  }

  throw new Error("No valid database URL found for sessions");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const databaseUrl = getDatabaseUrl();
  console.log("[Session] Initializing session store with PostgreSQL...");
  
  const sessionStore = new pgStore({
    conString: databaseUrl,
    createTableIfMissing: true, // Auto-create sessions table if missing
    ttl: sessionTtl,
    tableName: "sessions",
    errorLog: (err: any) => {
      console.error("[Session Store Error]", err);
    },
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'bibliafs-session-secret-key-2024',
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow cookies over HTTP in development
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Simple logout route - just destroy session
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/");
    });
  });

  // POST logout for API calls
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user || !user.claims || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    // Restore user to req for route handlers
    (req as any).user = user;
    return next();
  }

  // Session expired
  return res.status(401).json({ message: "Session expired" });
};
