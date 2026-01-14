import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { offlineStorage, type OfflineChapter } from "@/lib/offline/offlineStorage";
import { bibleSqlite } from "@/lib/offline/bibleSqlite";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { apiFetch } from "@/lib/config";

interface OfflineContextType {
  isOnline: boolean;
  downloadedChapters: Set<string>;
  isDownloading: boolean;
  downloadProgress: number;
  sqliteReady: boolean;
  downloadChapter: (book: string, chapter: number, version: string) => Promise<void>;
  downloadBook: (book: string, version: string, totalChapters: number) => Promise<void>;
  deleteChapter: (book: string, chapter: number, version: string) => Promise<void>;
  deleteBook: (book: string, version: string) => Promise<void>;
  isChapterOffline: (book: string, chapter: number, version: string) => boolean;
  getOfflineChapter: (book: string, chapter: number, version: string) => Promise<any | null>;
  getSqliteChapter: (book: string, chapter: number) => Promise<any | null>;
  getSqliteBooks: () => Promise<any[]>;
  clearAllOffline: () => Promise<void>;
  getStorageStats: () => Promise<any>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider");
  }
  return context;
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadedChapters, setDownloadedChapters] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [sqliteReady, setSqliteReady] = useState(false);
  const { toast } = useToast();

  // Initialize offline storage and SQLite database
  useEffect(() => {
    async function init() {
      try {
        await offlineStorage.init();
        const chapters = await offlineStorage.getAllChapters();
        const keys = new Set(chapters.map(ch => `${ch.book}-${ch.chapter}-${ch.version}`));
        setDownloadedChapters(keys);
        
        // Initialize SQLite database lazily or in background to not block initial render
        // Moving to an even more deferred approach with requestIdleCallback if available
        const deferInit = () => {
          setTimeout(async () => {
            try {
              const ready = await bibleSqlite.init();
              setSqliteReady(ready);
              if (ready) {
                console.log("[OfflineProvider] SQLite Bible database ready");
              }
            } catch (e) {
              console.error("Error initializing SQLite in background:", e);
            }
          }, 3000); // Increased delay to 3 seconds to ensure login screen shows first
        };

        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(deferInit);
        } else {
          deferInit();
        }
      } catch (error) {
        console.error("Error initializing offline storage:", error);
      }
    }
    init();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conectado",
        description: "Conexão com a internet restabelecida",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo Offline",
        description: "Você pode continuar lendo o conteúdo baixado",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  const downloadChapter = async (book: string, chapter: number, version: string) => {
    try {
      setIsDownloading(true);
      
      // Fetch chapter data from API
      const response = await apiFetch(`/api/bible/${version}/${book}/${chapter}`);
      if (!response.ok) {
        throw new Error("Falha ao baixar capítulo");
      }

      const data = await response.json();
      const content = JSON.stringify(data);
      const size = new Blob([content]).size;
      const verseCount = data.verses?.length || 0;

      // Save to IndexedDB
      await offlineStorage.saveChapter({
        book,
        chapter,
        version,
        content: data,
        downloadedAt: Date.now(),
        size,
      });

      // Sync with backend
      try {
        await apiRequest("POST", "/api/offline/content", {
          book,
          chapter,
          version,
          size,
          verseCount,
        });
      } catch (backendError) {
        console.error("Failed to sync with backend:", backendError);
        // Continue even if backend sync fails
      }

      // Update state
      const key = `${book}-${chapter}-${version}`;
      setDownloadedChapters(prev => new Set(prev).add(key));

      toast({
        title: "Capítulo baixado!",
        description: `${book} ${chapter} disponível offline`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao baixar",
        description: error.message || "Não foi possível baixar o capítulo",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadBook = async (book: string, version: string, totalChapters: number) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      for (let chapter = 1; chapter <= totalChapters; chapter++) {
        await downloadChapter(book, chapter, version);
        setDownloadProgress(Math.round((chapter / totalChapters) * 100));
      }

      toast({
        title: "Livro completo baixado!",
        description: `${book} disponível offline`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao baixar livro",
        description: error.message,
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const deleteChapter = async (book: string, chapter: number, version: string) => {
    try {
      await offlineStorage.deleteChapter(book, chapter, version);
      
      const key = `${book}-${chapter}-${version}`;
      setDownloadedChapters(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });

      toast({
        title: "Capítulo removido",
        description: "Conteúdo offline excluído",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover",
        description: error.message,
      });
    }
  };

  const deleteBook = async (book: string, version: string) => {
    try {
      await offlineStorage.deleteBook(book, version);
      
      // Remove all chapters of this book from state
      setDownloadedChapters(prev => {
        const newSet = new Set(prev);
        Array.from(prev).forEach(key => {
          if (key.startsWith(`${book}-`) && key.endsWith(`-${version}`)) {
            newSet.delete(key);
          }
        });
        return newSet;
      });

      toast({
        title: "Livro removido",
        description: "Todos os capítulos excluídos",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover livro",
        description: error.message,
      });
    }
  };

  const isChapterOffline = (book: string, chapter: number, version: string): boolean => {
    const key = `${book}-${chapter}-${version}`;
    return downloadedChapters.has(key);
  };

  const getOfflineChapter = async (book: string, chapter: number, version: string) => {
    try {
      // First try IndexedDB (user-downloaded content) - version specific
      const chapterData = await offlineStorage.getChapter(book, chapter, version);
      if (chapterData?.content) {
        console.log(`[Offline] Loaded ${book} ${chapter} from IndexedDB`);
        return chapterData.content;
      }
      
      // Fallback to SQLite database (built-in NVI Bible, works for any requested version as fallback)
      // SQLite always returns NVI content when offline, regardless of requested version
      try {
        // Initialize SQLite if not ready
        if (!sqliteReady) {
          const ready = await bibleSqlite.init();
          if (ready) {
            setSqliteReady(true);
          }
        }
        
        if (bibleSqlite.isReady()) {
          const sqliteData = await bibleSqlite.getChapter(book, chapter);
          if (sqliteData) {
            console.log(`[Offline] Loaded ${book} ${chapter} from SQLite (NVI fallback)`);
            // Format to match API response structure exactly:
            // {"book":{"name":"...","abbrev":"..."},"chapter":{"number":N},"verses":[...]}
            return {
              book: { 
                name: sqliteData.bookName, 
                abbrev: sqliteData.book // String, not object (matches API)
              },
              chapter: { 
                number: sqliteData.chapter
              },
              verses: sqliteData.verses.map(v => ({ number: v.verse, text: v.text })),
              totalChapters: sqliteData.totalChapters,
            };
          }
        }
      } catch (sqliteError) {
        console.error("[Offline] SQLite fallback failed:", sqliteError);
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching offline chapter:", error);
      return null;
    }
  };

  const getSqliteChapter = async (book: string, chapter: number) => {
    try {
      if (!sqliteReady) {
        await bibleSqlite.init();
        setSqliteReady(bibleSqlite.isReady());
      }
      
      const data = await bibleSqlite.getChapter(book, chapter);
      if (data) {
        return {
          book: data.book,
          bookName: data.bookName,
          chapter: data.chapter,
          verses: data.verses,
          totalChapters: data.totalChapters,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching SQLite chapter:", error);
      return null;
    }
  };

  const getSqliteBooks = async () => {
    try {
      if (!sqliteReady) {
        const ready = await bibleSqlite.init();
        if (ready) {
          setSqliteReady(true);
        }
      }
      
      if (bibleSqlite.isReady()) {
        const books = await bibleSqlite.getBooks();
        // Format to match API response structure - abbrev as { pt: string }
        return books.map(book => ({
          name: book.name,
          abbrev: { pt: book.abbrev }, // Object with pt property to match API
          chapters: book.chapters,
          testament: book.testament,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching SQLite books:", error);
      return [];
    }
  };

  const clearAllOffline = async () => {
    try {
      await offlineStorage.clearAll();
      setDownloadedChapters(new Set());
      
      toast({
        title: "Cache limpo",
        description: "Todo o conteúdo offline foi removido",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao limpar cache",
        description: error.message,
      });
    }
  };

  const getStorageStats = async () => {
    return await offlineStorage.getStorageStats();
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        downloadedChapters,
        isDownloading,
        downloadProgress,
        sqliteReady,
        downloadChapter,
        downloadBook,
        deleteChapter,
        deleteBook,
        isChapterOffline,
        getOfflineChapter,
        getSqliteChapter,
        getSqliteBooks,
        clearAllOffline,
        getStorageStats,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}
