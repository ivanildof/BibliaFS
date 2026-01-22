import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/config";
import { persistentStorage } from "@/lib/persistentStorage";
import type { User } from "@shared/schema";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

async function restoreSessionFromIndexedDB(): Promise<void> {
  try {
    const storageKey = 'bibliaffs-auth-token';
    const localValue = localStorage.getItem(storageKey);
    
    if (!localValue) {
      const idbValue = await persistentStorage.getItem(storageKey);
      if (idbValue) {
        console.log('[Auth] Restoring session from IndexedDB');
        localStorage.setItem(storageKey, idbValue);
      }
    }
  } catch (error) {
    console.warn('[Auth] Failed to restore session from IndexedDB:', error);
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initSession = async () => {
      await restoreSessionFromIndexedDB();
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setSessionLoading(false);
    };
    
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        setSessionLoading(false);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!session?.access_token) return null;
      
      const res = await apiFetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      
      return res.json();
    },
    enabled: !!session?.access_token,
    retry: false,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    await persistentStorage.removeItem('bibliaffs-auth-token');
    localStorage.removeItem('bibliaffs-auth-token');
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
