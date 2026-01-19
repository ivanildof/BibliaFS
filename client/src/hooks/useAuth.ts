import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/config";
import { getAuthHeaders } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If we have a session, verify it's still valid by trying to refresh
      if (session) {
        const now = Date.now();
        const expiresAt = (session.expires_at || 0) * 1000;
        
        // If token is expired or about to expire, refresh it
        if (expiresAt < now + 60000) {
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session) {
            setSession(refreshData.session);
            setSupabaseUser(refreshData.session.user);
          } else {
            // Refresh failed, session is invalid
            await supabase.auth.signOut();
            setSession(null);
            setSupabaseUser(null);
          }
        } else {
          setSession(session);
          setSupabaseUser(session.user);
        }
      }
      setSessionLoading(false);
    };
    
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
          setSupabaseUser(session.user);
        } else if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setSupabaseUser(session.user);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setSupabaseUser(null);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        } else {
          setSession(session);
          setSupabaseUser(session?.user ?? null);
        }
        setSessionLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) return null;
      
      const res = await apiFetch("/api/auth/user", {
        headers: authHeaders,
      });
      
      if (res.status === 401) {
        // Token might have expired, try to refresh session
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          await supabase.auth.signOut();
          return null;
        }
        // Retry with new token
        const newHeaders = await getAuthHeaders();
        const retryRes = await apiFetch("/api/auth/user", { headers: newHeaders });
        if (!retryRes.ok) return null;
        return retryRes.json();
      }
      if (!res.ok) throw new Error("Failed to fetch user");
      
      return res.json();
    },
    enabled: !!session,
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const signOut = async () => {
    await supabase.auth.signOut();
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
