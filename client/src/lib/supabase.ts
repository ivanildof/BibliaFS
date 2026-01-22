import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env-config';
import { persistentStorage, syncLocalStorageToIndexedDB, hydrateLocalStorageFromIndexedDB } from './persistentStorage';

const customStorage = {
  getItem: (key: string): string | null => {
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    localStorage.setItem(key, value);
    persistentStorage.setItem(key, value).catch(err => {
      console.warn('[Supabase Storage] Failed to persist to IndexedDB:', err);
    });
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
    persistentStorage.removeItem(key).catch(err => {
      console.warn('[Supabase Storage] Failed to remove from IndexedDB:', err);
    });
  }
};

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;
let hydrationDone = false;

function createSupabaseClient(): SupabaseClient {
  const client = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: customStorage,
      },
    }
  );

  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      syncLocalStorageToIndexedDB();
    }
  });

  return client;
}

export async function initSupabase(): Promise<SupabaseClient> {
  if (supabaseInstance) return supabaseInstance;
  
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    if (!hydrationDone) {
      await hydrateLocalStorageFromIndexedDB();
      hydrationDone = true;
    }
    supabaseInstance = createSupabaseClient();
    return supabaseInstance;
  })();
  
  return initPromise;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    console.warn('[Supabase] getSupabase called before initSupabase - creating client without hydration');
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  }
});
