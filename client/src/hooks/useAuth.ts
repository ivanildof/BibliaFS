import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/config";
import type { User } from "@shared/schema";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        setSessionLoading(false);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
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
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  };

  return {
    user,
    supabaseUser,
    session,
    isLoading: sessionLoading || (!!session && userLoading),
    isAuthenticated: !!session?.user,
    signOut,
  };
}
