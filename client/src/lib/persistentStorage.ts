const DB_NAME = 'bibliaffs-auth';
const STORE_NAME = 'session';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
  
  return dbPromise;
}

export const persistentStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result ?? null);
      });
    } catch (error) {
      console.warn('[PersistentStorage] IndexedDB getItem failed:', error);
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn('[PersistentStorage] IndexedDB setItem failed:', error);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn('[PersistentStorage] IndexedDB removeItem failed:', error);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result.map(k => String(k)));
      });
    } catch (error) {
      console.warn('[PersistentStorage] IndexedDB getAllKeys failed:', error);
      return [];
    }
  },

  async clearAll(): Promise<void> {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.warn('[PersistentStorage] IndexedDB clearAll failed:', error);
    }
  }
};

export async function hydrateLocalStorageFromIndexedDB(): Promise<void> {
  try {
    const keys = await persistentStorage.getAllKeys();
    const supabaseKeys = keys.filter(key => key.startsWith('sb-'));
    
    for (const key of supabaseKeys) {
      const localValue = localStorage.getItem(key);
      if (!localValue) {
        const idbValue = await persistentStorage.getItem(key);
        if (idbValue) {
          console.log(`[Hydration] Restoring ${key} from IndexedDB to localStorage`);
          localStorage.setItem(key, idbValue);
        }
      }
    }
  } catch (error) {
    console.warn('[Hydration] Failed to hydrate localStorage from IndexedDB:', error);
  }
}

export async function syncLocalStorageToIndexedDB(): Promise<void> {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('sb-'));
    
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        await persistentStorage.setItem(key, value);
      }
    }
  } catch (error) {
    console.warn('[Sync] Failed to sync localStorage to IndexedDB:', error);
  }
}

export async function clearAllAuthStorage(): Promise<void> {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('sb-'));
    for (const key of keys) {
      localStorage.removeItem(key);
    }
    
    await persistentStorage.clearAll();
    console.log('[Auth] Cleared all auth storage');
  } catch (error) {
    console.warn('[Auth] Failed to clear all auth storage:', error);
  }
}
