import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initSupabase, getSupabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/config";
import { clearAllAuthStorage } from "@/lib/persistentStorage";
import type { User } from "@shared/schema";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initSession = async () => {
      const supabase = await initSupabase();
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setSessionLoading(false);

      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setSupabaseUser(session?.user ?? null);
          setSessionLoading(false);
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          }
        }
      );
      subscription = data.subscription;
    };
    
    initSession();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [queryClient]);

  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!session?.access_token) return null;
      
      const supabase = getSupabase();
      let token = session.access_token;
      
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const now = Date.now();
      const isExpiredOrNearExpiry = expiresAt > 0 && (expiresAt <= now || expiresAt - now < 5 * 60 * 1000);
      if (isExpiredOrNearExpiry) {
        try {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed?.session?.access_token) {
            token = refreshed.session.access_token;
          }
        } catch (e) {
          console.warn("[Auth] Pre-fetch token refresh failed:", e);
        }
      }
      
      const res = await apiFetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.status === 401) {
        try {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed?.session?.access_token) {
            const retryRes = await apiFetch("/api/auth/user", {
              headers: {
                Authorization: `Bearer ${refreshed.session.access_token}`,
              },
            });
            if (retryRes.status === 401) return null;
            if (!retryRes.ok) throw new Error("Failed to fetch user");
            return retryRes.json();
          }
        } catch (e) {
          console.warn("[Auth] Post-401 token refresh failed:", e);
        }
        return null;
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      
      return res.json();
    },
    enabled: !!session?.access_token,
    retry: false,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const signOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    await clearAllAuthStorage();
    queryClient.clear();
  };

  // Consider loading only during initial session check
  // Once we have a session, we're authenticated even if user data fetch fails
  const isLoading = sessionLoading;
  
  // User is authenticated if they have a valid Supabase session
  const isAuthenticated = !!session?.user;

  return {
    user,
    supabaseUser,
    session,
    isLoading,
    isAuthenticated,
    signOut,
  };
}
