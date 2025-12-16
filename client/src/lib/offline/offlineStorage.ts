// IndexedDB wrapper for offline Bible content storage with compression

import { compressData, decompressData, calculateCompressionRatio } from './syncUtils';

interface OfflineChapter {
  book: string;
  chapter: number;
  version: string;
  content: any; // Chapter data from API
  compressedContent?: Uint8Array; // Compressed content for storage efficiency
  isCompressed?: boolean;
  downloadedAt: number;
  size: number;
  originalSize?: number; // Original size before compression
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

  async saveChapter(chapter: OfflineChapter, enableCompression = true): Promise<void> {
    if (!this.db) await this.init();
    
    let chapterToSave = { ...chapter };
    
    if (enableCompression && chapter.content) {
      try {
        const contentString = JSON.stringify(chapter.content);
        const originalSize = new TextEncoder().encode(contentString).length;
        const compressed = await compressData(contentString);
        
        chapterToSave = {
          ...chapter,
          compressedContent: compressed,
          isCompressed: true,
          originalSize,
          size: compressed.length,
          content: null,
        };
        
        const ratio = calculateCompressionRatio(originalSize, compressed.length);
        console.log(`[OfflineStorage] Compressed ${chapter.book} ${chapter.chapter}: ${ratio}% saved`);
      } catch (error) {
        console.warn('[OfflineStorage] Compression failed, saving uncompressed:', error);
      }
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.put(chapterToSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getChapter(book: string, chapter: number, version: string): Promise<OfflineChapter | null> {
    if (!this.db) await this.init();
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get([book, chapter, version]);

      request.onsuccess = async () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }
        
        if (result.isCompressed && result.compressedContent) {
          try {
            const decompressed = await decompressData(result.compressedContent);
            result.content = JSON.parse(decompressed);
            delete result.compressedContent;
          } catch (error) {
            console.error('[OfflineStorage] Decompression failed:', error);
          }
        }
        
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllChapters(decompressContent = true): Promise<OfflineChapter[]> {
    if (!this.db) await this.init();
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = async () => {
        let chapters = request.result;
        
        if (decompressContent) {
          chapters = await Promise.all(chapters.map(async (ch: OfflineChapter) => {
            if (ch.isCompressed && ch.compressedContent) {
              try {
                const decompressed = await decompressData(ch.compressedContent);
                return { ...ch, content: JSON.parse(decompressed), compressedContent: undefined };
              } catch (error) {
                console.error('[OfflineStorage] Decompression failed for:', ch.book, ch.chapter);
                return ch;
              }
            }
            return ch;
          }));
        }
        
        resolve(chapters);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getBookChapters(book: string, version: string, decompressContent = true): Promise<OfflineChapter[]> {
    if (!this.db) await this.init();
    
    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = async () => {
        let chapters = request.result.filter(
          (ch: OfflineChapter) => ch.book === book && ch.version === version
        );
        
        if (decompressContent) {
          chapters = await Promise.all(chapters.map(async (ch: OfflineChapter) => {
            if (ch.isCompressed && ch.compressedContent) {
              try {
                const decompressed = await decompressData(ch.compressedContent);
                return { ...ch, content: JSON.parse(decompressed), compressedContent: undefined };
              } catch (error) {
                console.error('[OfflineStorage] Decompression failed for:', ch.book, ch.chapter);
                return ch;
              }
            }
            return ch;
          }));
        }
        
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
    originalSize: number;
    compressionSavings: number;
    compressionRatio: number;
    byBook: Record<string, number>;
    byVersion: Record<string, number>;
  }> {
    const chapters = await this.getAllChapters();
    
    let totalCompressed = 0;
    let totalOriginal = 0;
    
    chapters.forEach((ch) => {
      totalCompressed += ch.size || 0;
      totalOriginal += ch.originalSize || ch.size || 0;
    });
    
    const stats = {
      totalChapters: chapters.length,
      totalSize: totalCompressed,
      originalSize: totalOriginal,
      compressionSavings: totalOriginal - totalCompressed,
      compressionRatio: totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0,
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
