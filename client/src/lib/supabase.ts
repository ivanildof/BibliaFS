import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env-config';
import { persistentStorage } from './persistentStorage';

const customStorage = {
  getItem: (key: string): string | null => {
    const value = localStorage.getItem(key);
    if (value) return value;
    
    persistentStorage.getItem(key).then(idbValue => {
      if (idbValue && !localStorage.getItem(key)) {
        localStorage.setItem(key, idbValue);
      }
    }).catch(() => {});
    
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

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: customStorage,
      storageKey: 'bibliaffs-auth-token',
    },
  }
);
