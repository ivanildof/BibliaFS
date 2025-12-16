const DB_NAME = "biblia-podcasts-offline";
const STORE_NAME = "episodes";
const DB_VERSION = 1;

export interface OfflineEpisode {
  id: string;
  podcastId: string;
  title: string;
  audioData: Blob;
  downloadedAt: number;
  size: number;
}

class PodcastStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("podcastId", "podcastId", { unique: false });
          store.createIndex("downloadedAt", "downloadedAt", { unique: false });
        }
      };
    });
  }

  async saveEpisode(episode: OfflineEpisode): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(episode);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getEpisode(id: string): Promise<OfflineEpisode | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllEpisodes(): Promise<OfflineEpisode[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteEpisode(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async isDownloaded(id: string): Promise<boolean> {
    const episode = await this.getEpisode(id);
    return episode !== null;
  }

  async getStorageStats(): Promise<{ count: number; totalSize: number }> {
    const episodes = await this.getAllEpisodes();
    return {
      count: episodes.length,
      totalSize: episodes.reduce((sum, ep) => sum + ep.size, 0),
    };
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const podcastStorage = new PodcastStorage();
