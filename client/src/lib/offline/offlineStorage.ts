// IndexedDB wrapper for offline Bible content storage

interface OfflineChapter {
  book: string;
  chapter: number;
  version: string;
  content: any; // Chapter data from API
  downloadedAt: number;
  size: number;
}

class OfflineStorage {
  private dbName = "biblia-plus-offline";
  private storeName = "chapters";
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { 
            keyPath: ["book", "chapter", "version"] 
          });
          
          // Create indexes for efficient querying
          objectStore.createIndex("book", "book", { unique: false });
          objectStore.createIndex("version", "version", { unique: false });
          objectStore.createIndex("downloadedAt", "downloadedAt", { unique: false });
        }
      };
    });
  }

  async saveChapter(chapter: OfflineChapter): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.put(chapter);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getChapter(book: string, chapter: number, version: string): Promise<OfflineChapter | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get([book, chapter, version]);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllChapters(): Promise<OfflineChapter[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getBookChapters(book: string, version: string): Promise<OfflineChapter[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const chapters = request.result.filter(
          (ch: OfflineChapter) => ch.book === book && ch.version === version
        );
        resolve(chapters);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteChapter(book: string, chapter: number, version: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete([book, chapter, version]);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBook(book: string, version: string): Promise<void> {
    if (!this.db) await this.init();
    
    const chapters = await this.getBookChapters(book, version);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);

      let deletedCount = 0;
      chapters.forEach((ch) => {
        const request = objectStore.delete([ch.book, ch.chapter, ch.version]);
        request.onsuccess = () => {
          deletedCount++;
          if (deletedCount === chapters.length) {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      if (chapters.length === 0) {
        resolve();
      }
    });
  }

  async getTotalSize(): Promise<number> {
    const chapters = await this.getAllChapters();
    return chapters.reduce((total, ch) => total + (ch.size || 0), 0);
  }

  async getStorageStats(): Promise<{
    totalChapters: number;
    totalSize: number;
    byBook: Record<string, number>;
    byVersion: Record<string, number>;
  }> {
    const chapters = await this.getAllChapters();
    
    const stats = {
      totalChapters: chapters.length,
      totalSize: chapters.reduce((total, ch) => total + (ch.size || 0), 0),
      byBook: {} as Record<string, number>,
      byVersion: {} as Record<string, number>,
    };

    chapters.forEach((ch) => {
      stats.byBook[ch.book] = (stats.byBook[ch.book] || 0) + 1;
      stats.byVersion[ch.version] = (stats.byVersion[ch.version] || 0) + 1;
    });

    return stats;
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();
export type { OfflineChapter };
