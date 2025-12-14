import type { RequestHandler } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Try backend vars first, then fallback to VITE_ prefixed (they might be set as regular env vars)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabaseAdmin: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("[Supabase] Admin client initialized successfully");
  } catch (error) {
    console.warn("[Supabase] Failed to initialize admin client:", error);
  }
} else {
  console.warn("⚠️  Supabase environment variables not configured (SUPABASE_URL, SUPABASE_ANON_KEY)");
}

export { supabaseAdmin };

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }
    
    const token = authHeader.substring(7);
    
    if (!supabaseAdmin) {
      console.error("[Auth] Supabase not configured");
      return res.status(500).json({ message: "Authentication service not configured" });
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.log("[Auth] Invalid token:", error?.message);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    (req as any).user = {
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || user.user_metadata?.firstName || "",
        last_name: user.user_metadata?.last_name || user.user_metadata?.lastName || "",
      },
      supabaseUser: user,
    };
    
    return next();
  } catch (error: any) {
    console.error("[Auth] Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
