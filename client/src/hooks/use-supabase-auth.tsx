import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initSupabase, getSupabase } from "@/lib/supabase";
import { clearAllAuthStorage } from "@/lib/persistentStorage";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const supabase = await initSupabase();
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      const { data } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );
      subscription = data.subscription;
    };

    init();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    await clearAllAuthStorage();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return context;
}
