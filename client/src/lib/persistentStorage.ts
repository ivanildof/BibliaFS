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
      console.warn('[PersistentStorage] IndexedDB getItem failed, falling back to localStorage:', error);
      return localStorage.getItem(key);
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
      console.warn('[PersistentStorage] IndexedDB setItem failed, falling back to localStorage:', error);
      localStorage.setItem(key, value);
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
      console.warn('[PersistentStorage] IndexedDB removeItem failed, falling back to localStorage:', error);
      localStorage.removeItem(key);
    }
  }
};

export async function migrateLocalStorageToIndexedDB(): Promise<void> {
  try {
    const localStorageKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') || key.includes('supabase')
    );
    
    for (const key of localStorageKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        await persistentStorage.setItem(key, value);
        console.log(`[Migration] Migrated ${key} to IndexedDB`);
      }
    }
  } catch (error) {
    console.warn('[Migration] Failed to migrate localStorage to IndexedDB:', error);
  }
}
