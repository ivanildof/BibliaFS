import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Book,
  BookmarkPlus,
  Settings2,
  CheckCircle,
  Share2,
  Download,
  Copy,
  CloudOff,
  Cloud,
  Volume2,
  VolumeX,
  Pause,
  Play,
  DownloadCloud,
  Check
} from "lucide-react";
import { getAudioUrl, downloadChapterAudio, formatTime } from "@/lib/audioService";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOffline } from "@/contexts/OfflineContext";
import type { Bookmark, Highlight, Note } from "@shared/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

interface BibleBook {
  abbrev: { pt: string };
  name: string;
  chapters: number;
  testament: string;
}

interface Verse {
  number: number;
  text: string;
}

interface Chapter {
  book: { name: string; abbrev: string };
  chapter: { number: number };
  verses: Verse[];
}

const VERSIONS = [
  { value: "nvi", label: "NVI" },
  { value: "acf", label: "ACF" },
  { value: "arc", label: "ARC" },
  { value: "ra", label: "RA" },
];

export default function BibleReader() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isOnline, isChapterOffline, downloadChapter, deleteChapter, getOfflineChapter } = useOffline();
  
  // Parse URL query params for search results
  const urlParams = new URLSearchParams(window.location.search);
  const queryBook = urlParams.get("book");
  const queryChapter = urlParams.get("chapter");
  const queryVerse = urlParams.get("verse");
  const queryVersion = urlParams.get("version");
  
  // Initialize from URL params or localStorage
  const [version, setVersion] = useState(() => {
    if (queryVersion) return queryVersion;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bible_version');
      return saved || "nvi";
    }
    return "nvi";
  });
  
  const [selectedBook, setSelectedBook] = useState<string | null>(() => {
    if (queryBook) return queryBook;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bible_book');
      return saved || "jo";
    }
    return "jo";
  });
  
  const [selectedChapter, setSelectedChapter] = useState(() => {
    if (queryChapter) return parseInt(queryChapter);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bible_chapter');
      return saved ? parseInt(saved) : 1;
    }
    return 1;
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Save version, book, and chapter to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bible_version', version);
    }
  }, [version]);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedBook) {
      localStorage.setItem('bible_book', selectedBook);
    }
  }, [selectedBook]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bible_chapter', selectedChapter.toString());
    }
  }, [selectedChapter]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBooksOpen, setIsBooksOpen] = useState(false);
  const [matchedBooks, setMatchedBooks] = useState<BibleBook[]>([]);
  const [isChaptersOpen, setIsChaptersOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(queryVerse ? parseInt(queryVerse) : null);
  const [highlightPopoverOpen, setHighlightPopoverOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [verseToShare, setVerseToShare] = useState<{ number: number; text: string } | null>(null);
  const [commentarySheetOpen, setCommentarySheetOpen] = useState(false);
  const [verseForCommentary, setVerseForCommentary] = useState<{ number: number; text: string } | null>(null);
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playingVerseNumber, setPlayingVerseNumber] = useState<number | null>(null);
  const [audioModeDialogOpen, setAudioModeDialogOpen] = useState(false);
  const [audioMode, setAudioMode] = useState<'chapter' | 'book'>('chapter');
  const [bookPlaylist, setBookPlaylist] = useState<number[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

  // Audio download state
  const [downloadingAudio, setDownloadingAudio] = useState(false);
  const [audioDownloaded, setAudioDownloaded] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  // Use ref for synchronous access to audio element (prevents race conditions)
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Download chapter audio for offline playback
  const downloadChapterAudioFile = async () => {
    if (!selectedBook || downloadingAudio) return;
    setDownloadingAudio(true);
    setDownloadProgress(0);

    try {
      const blob = await downloadChapterAudio(selectedBook, selectedChapter, version.toUpperCase(), t.currentLanguage || "pt", (progress: number) => {
        setDownloadProgress(progress);
      });

      // Save to IndexedDB via offline context
      const key = `${selectedBook}_${selectedChapter}_${version}`;
      await downloadChapter(selectedBook, selectedChapter, version);
      
      setAudioDownloaded(prev => new Set(prev).add(key));
      
      toast({
        title: "Áudio baixado!",
        description: `${selectedBook} ${selectedChapter} disponível offline`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao baixar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloadingAudio(false);
      setDownloadProgress(0);
    }
  };

  // Save audio progress automatically
  const saveAudioProgress = async (position: number, duration: number) => {
    if (!selectedBook) return;
    try {
      fetch("/api/audio/progress", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: selectedBook,
          chapter: selectedChapter,
          version: version.toUpperCase(),
          playbackPosition: Math.floor(position),
          totalDuration: Math.floor(duration),
          completed: position >= duration - 5,
        }),
      }).catch(console.error);
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  };

  // Unified audio controller - stops any playing audio (chapter or verse)
  const stopAllAudio = () => {
    const audio = audioElementRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
      audio.onended = null;
      audio.onerror = null;
      audio.onloadeddata = null;
      audioElementRef.current = null;
    }
    setIsPlayingAudio(false);
    setAudioUrl(null);
    setPlayingVerseNumber(null);
  };

  const playChapterAudio = async (chapter: number) => {
    if (!selectedBook) return;
    
    setIsLoadingAudio(true);
    
    try {
      // First: Try Supabase Storage (pre-downloaded files)
      const audioUrl = await getAudioUrl(selectedBook, chapter, version, t.currentLanguage || "pt");
      console.log(`[Audio] Trying Supabase: ${audioUrl}`);
      
      toast({
        title: audioMode === 'book' ? `Tocando Capítulo ${chapter}...` : "Carregando áudio...",
        description: "Do Supabase Storage",
      });
      
      try {
        const supabaseResponse = await fetch(audioUrl, { signal: AbortSignal.timeout(10000) });
        
        if (supabaseResponse.ok) {
          const blob = await supabaseResponse.blob();
          const blobUrl = URL.createObjectURL(blob);
          const audio = new Audio(blobUrl);
          audioElementRef.current = audio;
          
          audio.onloadeddata = () => {
            setIsLoadingAudio(false);
            audio.play().then(() => {
              setIsPlayingAudio(true);
              setAudioUrl(blobUrl);
              setPlayingVerseNumber(null);
              toast({
                title: audioMode === 'book' ? `Tocando Capítulo ${chapter}` : "Áudio do capítulo iniciado",
                description: audioMode === 'book' ? `${bookPlaylist.length - currentPlaylistIndex} capítulos restantes` : "Você pode continuar navegando enquanto ouve",
              });
            }).catch(error => {
              setIsLoadingAudio(false);
              stopAllAudio();
              URL.revokeObjectURL(blobUrl);
              console.error("Audio playback error:", error);
              toast({
                title: "Erro ao reproduzir áudio",
                description: "Tente novamente",
                variant: "destructive",
              });
            });
          };
          
          audio.onended = () => {
            URL.revokeObjectURL(blobUrl);
            if (audioMode === 'book' && currentPlaylistIndex < bookPlaylist.length - 1) {
              const nextIndex = currentPlaylistIndex + 1;
              setCurrentPlaylistIndex(nextIndex);
              playChapterAudio(bookPlaylist[nextIndex]);
            } else {
              setIsPlayingAudio(false);
              setPlayingVerseNumber(null);
              setBookPlaylist([]);
              setCurrentPlaylistIndex(0);
              setAudioMode('chapter');
            }
          };
          
          audio.onerror = () => {
            setIsLoadingAudio(false);
            stopAllAudio();
            URL.revokeObjectURL(blobUrl);
            toast({
              title: "Erro ao carregar áudio",
              description: "Verifique sua conexão e tente novamente",
              variant: "destructive",
            });
          };
          return;
        }
      } catch (supabaseError) {
        console.log("[Audio] Supabase file not available, trying OpenAI fallback...");
      }
      
      // Fallback: Generate via OpenAI if Supabase file not found
      const backendUrl = `/api/bible/audio/${t.currentLanguage}/${version}/${selectedBook}/${chapter}`;
      
      toast({
        title: audioMode === 'book' ? `Gerando áudio - Capítulo ${chapter}...` : "Gerando áudio do capítulo...",
        description: "Isso pode levar 20-40 segundos. Aguarde!",
      });
      
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
      
      const response = await fetch(backendUrl, {
        method: "GET",
        credentials: "include",
        headers,
        signal: AbortSignal.timeout(60000),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }
      if (!response.headers.get('content-type')?.includes('audio')) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Falha ao gerar áudio");
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(blobUrl);
      audioElementRef.current = audio;
      
      audio.onloadeddata = () => {
        setIsLoadingAudio(false);
        audio.play().then(() => {
          setIsPlayingAudio(true);
          setAudioUrl(blobUrl);
          setPlayingVerseNumber(null);
          
          toast({
            title: audioMode === 'book' ? `Tocando Capítulo ${chapter}` : "Áudio do capítulo iniciado",
            description: audioMode === 'book' ? `${bookPlaylist.length - currentPlaylistIndex} capítulos restantes` : "Você pode continuar navegando enquanto ouve",
          });
        }).catch(error => {
          setIsLoadingAudio(false);
          stopAllAudio();
          URL.revokeObjectURL(blobUrl);
          console.error("Audio playback error:", error);
          toast({
            title: "Erro ao reproduzir áudio",
            description: "Tente novamente",
            variant: "destructive",
          });
        });
      };
      
      audio.onended = () => {
        URL.revokeObjectURL(blobUrl);
        if (audioMode === 'book' && currentPlaylistIndex < bookPlaylist.length - 1) {
          const nextIndex = currentPlaylistIndex + 1;
          setCurrentPlaylistIndex(nextIndex);
          playChapterAudio(bookPlaylist[nextIndex]);
        } else {
          setIsPlayingAudio(false);
          setPlayingVerseNumber(null);
          setBookPlaylist([]);
          setCurrentPlaylistIndex(0);
          setAudioMode('chapter');
        }
      };
      
      audio.onerror = () => {
        setIsLoadingAudio(false);
        stopAllAudio();
        URL.revokeObjectURL(blobUrl);
        toast({
          title: "Erro ao carregar áudio",
          description: "Verifique sua conexão e tente novamente",
          variant: "destructive",
        });
      };
    } catch (error: any) {
      setIsLoadingAudio(false);
      console.error("Audio fetch error:", error?.message || error);
      
      let errorTitle = "Erro ao carregar áudio do capítulo";
      let errorDescription = "Verifique sua conexão e tente novamente";
      
      if (error.name === 'AbortError') {
        errorTitle = "Tempo limite excedido";
        errorDescription = "A geração de áudio levou mais de 60 segundos. Verifique sua conexão e tente novamente.";
      } else if (error?.message?.includes('401') || error?.message?.includes('403')) {
        errorTitle = "Não autorizado";
        errorDescription = "Faça login novamente e tente";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    }
  };

  const startBookAudio = async () => {
    if (!selectedBook) return;
    
    try {
      // Buscar informações do livro
      const response = await fetch(`/api/bible/book-info/${selectedBook}`, {
        method: "GET",
        credentials: "include",
      });
      const bookInfo = await response.json();
      
      // Criar playlist de todos os capítulos
      const playlist = Array.from({ length: bookInfo.chapters }, (_, i) => i + 1);
      setBookPlaylist(playlist);
      setCurrentPlaylistIndex(0);
      setAudioMode('book');
      
      toast({
        title: `Livro ${bookInfo.name} completo`,
        description: `${bookInfo.chapters} capítulos serão tocados em sequência`,
      });
      
      // Iniciar reprodução do primeiro capítulo
      playChapterAudio(1);
    } catch (error) {
      console.error("Book audio error:", error);
      toast({
        title: "Erro ao iniciar áudio do livro",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const toggleAudio = async () => {
    if (!selectedBook || isLoadingAudio) return;
    
    // Se já está tocando, pausar/retomar
    const currentAudio = audioElementRef.current;
    if (currentAudio && isPlayingAudio) {
      currentAudio.pause();
      setIsPlayingAudio(false);
      return;
    }
    
    if (currentAudio && audioUrl && !isPlayingAudio) {
      currentAudio.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((error: any) => {
        console.error("Audio resume error:", error);
        toast({
          title: "Erro ao continuar áudio",
          description: "Tente carregar novamente",
          variant: "destructive",
        });
      });
      return;
    }
    
    // Abrir dialog para escolher modo
    setAudioModeDialogOpen(true);
  };

  const handleStartAudio = (mode: 'verse' | 'chapter' | 'book', verseNumber?: number) => {
    setAudioModeDialogOpen(false);
    stopAllAudio();
    
    if (mode === 'verse' && verseNumber !== undefined) {
      playVerseAudio(verseNumber);
    } else if (mode === 'chapter') {
      setAudioMode('chapter');
      setBookPlaylist([]);
      setCurrentPlaylistIndex(0);
      playChapterAudio(selectedChapter);
    } else {
      startBookAudio();
    }
  };

  const playVerseAudio = async (verseNumber: number) => {
    if (!selectedBook || !chapterData) return;
    
    const url = `/api/bible/audio/verse/${t.currentLanguage}/${version}/${selectedBook}/${selectedChapter}/${verseNumber}`;
    
    setIsLoadingAudio(true);
    setAudioMode('chapter');
    
    toast({
      title: "Gerando áudio do versículo...",
      description: "Isso pode levar 10-20 segundos. Aguarde!",
    });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }
      if (!response.headers.get('content-type')?.includes('audio')) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Falha ao gerar áudio");
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(blobUrl);
      audioElementRef.current = audio;
      
      audio.onloadeddata = () => {
        setIsLoadingAudio(false);
        audio.play().then(() => {
          setIsPlayingAudio(true);
          setAudioUrl(blobUrl);
          setPlayingVerseNumber(verseNumber);
          
          toast({
            title: `Tocando versículo ${verseNumber}`,
            description: "Você pode continuar navegando enquanto ouve",
          });
        }).catch(error => {
          setIsLoadingAudio(false);
          stopAllAudio();
          URL.revokeObjectURL(blobUrl);
          console.error("Audio playback error:", error);
          toast({
            title: "Erro ao reproduzir áudio",
            description: "Tente novamente",
            variant: "destructive",
          });
        });
      };
      
      audio.onended = () => {
        URL.revokeObjectURL(blobUrl);
        setIsPlayingAudio(false);
        setPlayingVerseNumber(null);
      };
      
      audio.onerror = () => {
        setIsLoadingAudio(false);
        stopAllAudio();
        URL.revokeObjectURL(blobUrl);
        toast({
          title: "Erro ao carregar áudio",
          description: "Verifique sua conexão e tente novamente",
          variant: "destructive",
        });
      };
    } catch (error: any) {
      setIsLoadingAudio(false);
      console.error("Audio fetch error:", error?.message || error);
      
      let errorTitle = "Erro ao carregar áudio do versículo";
      let errorDescription = "Verifique sua conexão e tente novamente";
      
      if (error.name === 'AbortError') {
        errorTitle = "Tempo limite excedido";
        errorDescription = "A geração de áudio levou mais de 60 segundos. Verifique sua conexão e tente novamente.";
      } else if (error?.message?.includes('401') || error?.message?.includes('403')) {
        errorTitle = "Não autorizado";
        errorDescription = "Faça login novamente e tente";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  useEffect(() => {
    stopAllAudio();
  }, [selectedBook, selectedChapter]);

  // Cleanup audio when popover closes
  useEffect(() => {
    if (!highlightPopoverOpen && playingVerseNumber) {
      stopAllAudio();
    }
  }, [highlightPopoverOpen, playingVerseNumber]);

  // Fetch all Bible books
  const { data: books = [], isLoading: loadingBooks, error: booksError } = useQuery<BibleBook[]>({
    queryKey: ["/api/bible/books"],
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch current chapter with offline fallback and multilingual support
  const { data: chapterData, isLoading: loadingChapter, error: chapterError } = useQuery<Chapter>({
    queryKey: selectedBook ? [`/api/bible/multilang/${t.currentLanguage}/${version}/${selectedBook}/${selectedChapter}`] : [""],
    enabled: !!selectedBook,
    retry: isOnline ? 2 : 0, // Don't retry if offline
    retryDelay: 1000,
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      if (!url || url === "") return null;
      
      // Try offline first if we're offline
      if (!isOnline && selectedBook) {
        const offlineData = await getOfflineChapter(selectedBook, selectedChapter, version);
        if (offlineData) {
          return offlineData;
        }
        throw new Error(t.bible.contentNotAvailableOffline);
      }
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("API error");
        }
        return response.json();
      } catch (error) {
        // Try offline fallback if online request fails
        if (selectedBook) {
          const offlineData = await getOfflineChapter(selectedBook, selectedChapter, version);
          if (offlineData) {
            // Only show toast once every 5 seconds to avoid spam
            const now = Date.now();
            const lastToastKey = 'lastOfflineToast';
            const lastToast = parseInt(sessionStorage.getItem(lastToastKey) || '0');
            if (now - lastToast > 5000) {
              toast({
                title: t.bible.offlineModeTitle,
                description: t.bible.loadingSavedContent,
              });
              sessionStorage.setItem(lastToastKey, now.toString());
            }
            return offlineData;
          }
        }
        throw error; // Re-throw if no offline data available
      }
    },
  });

  // Fetch user bookmarks
  const { data: bookmarks = [] } = useQuery<Bookmark[]>({
    queryKey: ["/api/bible/bookmarks"],
  });

  // Fetch user highlights
  const { data: highlights = [] } = useQuery<Highlight[]>({
    queryKey: ["/api/bible/highlights"],
  });

  // Fetch user notes
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest("GET", `/api/bible/search?version=${version}&query=${encodeURIComponent(query)}`);
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async (data: { book: string; chapter: number; verse: number; verseText: string; version: string }) => {
      return await apiRequest("POST", "/api/bible/bookmarks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bible/bookmarks"] });
      toast({
        title: t.bible.bookmarkAdded,
        description: t.bible.verseCopied.replace('área de transferência', 'favoritos').replace('clipboard', 'bookmarks').replace('klembord', 'favorieten').replace('portapapeles', 'favoritos'),
      });
    },
  });

  // Highlight mutation
  const highlightMutation = useMutation({
    mutationFn: async (data: { book: string; chapter: number; verse: number; verseText: string; color: string }) => {
      return await apiRequest("POST", "/api/bible/highlights", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bible/highlights"] });
      setHighlightPopoverOpen(false);
      setSelectedVerse(null);
      toast({
        title: t.bible.highlightAdded,
        description: t.bible.verseImageDownloaded.replace('Imagem do versículo baixada', 'Versículo destacado').replace('image downloaded', 'highlighted').replace('afbeelding gedownload', 'gemarkeerd').replace('imagen descargada', 'resaltado'),
      });
    },
  });

  // Delete highlight mutation
  const deleteHighlightMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/bible/highlights/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bible/highlights"] });
      setHighlightPopoverOpen(false);
      setSelectedVerse(null);
      toast({
        title: t.bible.highlightRemoved,
        description: t.bible.highlightRemovedSuccess,
      });
    },
  });

  // Note mutation
  const noteMutation = useMutation({
    mutationFn: async (data: { book: string; chapter: number; verse: number; content: string }) => {
      return await apiRequest("POST", "/api/notes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setNoteText("");
      toast({
        title: t.bible.noteRemoved.replace('removida', 'adicionada').replace('removed', 'added').replace('verwijderd', 'toegevoegd').replace('eliminada', 'añadida'),
        description: t.bible.noteRemovedSuccess.replace('removida', 'salva').replace('removed', 'saved').replace('verwijderd', 'opgeslagen').replace('eliminada', 'guardada'),
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setNoteText("");
      toast({
        title: t.bible.noteRemoved,
        description: t.bible.noteRemovedSuccess,
      });
    },
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (data: { book: string; chapter: number }) => {
      const response = await apiRequest("POST", "/api/bible/mark-read", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats/gamification"] });
      
      let description = t.plans.youEarnedXP.replace('{xp}', data.xpGained.toString()).replace('pela sua leitura.', '!').replace('for your reading.', '!').replace('met lezen.', '!').replace('por tu lectura.', '!');
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        description += ` 🏆 ${data.unlockedAchievements.map((a: any) => a.name).join(", ")}`;
      }
      
      toast({
        title: t.bible.chapterComplete,
        description,
      });
    },
  });

  // Set initial book
  useEffect(() => {
    const booksArray = Array.isArray(books) ? books : [];
    if (booksArray.length > 0 && !selectedBook) {
      setSelectedBook(booksArray[0].abbrev.pt);
    }
  }, [books, selectedBook]);

  // Populate note text when opening popover
  useEffect(() => {
    if (selectedVerse !== null && highlightPopoverOpen) {
      const existingNote = getVerseNote(selectedVerse);
      setNoteText(existingNote?.content || "");
    }
  }, [selectedVerse, highlightPopoverOpen]);

  useEffect(() => {
    if (booksError) {
      toast({
        title: t.bible.errorLoadingBooks,
        description: t.common.tryAgainLater,
        variant: "destructive",
      });
    }
  }, [booksError, toast, t]);

  useEffect(() => {
    if (chapterError) {
      toast({
        title: t.bible.errorLoadingChapter,
        description: t.common.tryAgainLater,
        variant: "destructive",
      });
    }
  }, [chapterError, toast, t]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Smart detection: find books that match the query
      const query = searchQuery.trim().toLowerCase();
      const booksArray = Array.isArray(books) ? books : [];
      const filtered = booksArray.filter(book => {
        const bookName = (t.bibleBooks[book.abbrev.pt] || book.name).toLowerCase();
        const abbrev = book.abbrev.pt.toLowerCase();
        return bookName.includes(query) || abbrev.includes(query);
      });
      setMatchedBooks(filtered);
      
      // Also search verses
      searchMutation.mutate(searchQuery);
      setIsSearchOpen(true);
    }
  };

  const handleAddBookmark = (verse: Verse) => {
    if (!chapterData) return;
    
    bookmarkMutation.mutate({
      book: chapterData.book.name,
      chapter: chapterData.chapter.number,
      verse: verse.number,
      verseText: verse.text,
      version,
    });
  };

  const getVerseHighlight = (verseNumber: number) => {
    if (!chapterData || !highlights) return null;
    return highlights.find(
      h => h.book === chapterData.book.name && 
           h.chapter === chapterData.chapter.number && 
           h.verse === verseNumber
    );
  };

  const getVerseNote = (verseNumber: number) => {
    if (!chapterData || !notes) return null;
    return notes.find(
      n => n.book === chapterData.book.name && 
           n.chapter === chapterData.chapter.number && 
           n.verse === verseNumber
    );
  };

  const handleAddHighlight = (verse: Verse, color: string) => {
    if (!chapterData) return;
    
    const existingHighlight = getVerseHighlight(verse.number);
    if (existingHighlight) {
      deleteHighlightMutation.mutate(existingHighlight.id);
    }
    
    highlightMutation.mutate({
      book: chapterData.book.name,
      chapter: chapterData.chapter.number,
      verse: verse.number,
      verseText: verse.text,
      color,
    });
  };

  const handleRemoveHighlight = (verseNumber: number) => {
    const existingHighlight = getVerseHighlight(verseNumber);
    if (existingHighlight) {
      deleteHighlightMutation.mutate(existingHighlight.id);
    }
  };

  const handleAddNote = (verse: Verse) => {
    if (!chapterData || !noteText.trim()) return;
    
    const existingNote = getVerseNote(verse.number);
    if (existingNote) {
      deleteNoteMutation.mutate(existingNote.id);
    }
    
    noteMutation.mutate({
      book: chapterData.book.name,
      chapter: chapterData.chapter.number,
      verse: verse.number,
      content: noteText.trim(),
    });
  };

  const handleDeleteNote = (verseNumber: number) => {
    const existingNote = getVerseNote(verseNumber);
    if (existingNote) {
      deleteNoteMutation.mutate(existingNote.id);
    }
  };

  const highlightColors = [
    { name: "yellow", bg: "bg-yellow-200/50 dark:bg-yellow-900/30", numberColor: "text-yellow-700 dark:text-yellow-400", label: t.bible.yellow },
    { name: "green", bg: "bg-green-200/50 dark:bg-green-900/30", numberColor: "text-green-700 dark:text-green-400", label: t.bible.green },
    { name: "blue", bg: "bg-blue-200/50 dark:bg-blue-900/30", numberColor: "text-blue-700 dark:text-blue-400", label: t.bible.blue },
    { name: "purple", bg: "bg-purple-200/50 dark:bg-purple-900/30", numberColor: "text-purple-700 dark:text-purple-400", label: t.bible.purple },
    { name: "pink", bg: "bg-pink-200/50 dark:bg-pink-900/30", numberColor: "text-pink-700 dark:text-pink-400", label: t.bible.pink },
    { name: "orange", bg: "bg-orange-200/50 dark:bg-orange-900/30", numberColor: "text-orange-700 dark:text-orange-400", label: t.bible.orange },
  ];

  const getHighlightBg = (color: string) => {
    const colorObj = highlightColors.find(c => c.name === color);
    return colorObj ? colorObj.bg : "";
  };

  const getVerseNumberColor = (verseNumber: number) => {
    const verseHighlight = getVerseHighlight(verseNumber);
    if (verseHighlight) {
      const colorObj = highlightColors.find(c => c.name === verseHighlight.color);
      return colorObj ? colorObj.numberColor : "text-primary";
    }
    return "text-primary";
  };

  const goToNextChapter = () => {
    const booksArray = Array.isArray(books) ? books : [];
    const currentBook = booksArray.find(b => b.abbrev?.pt === selectedBook);
    if (!currentBook) return;
    
    if (selectedChapter < currentBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
    } else {
      const currentIndex = booksArray.findIndex(b => b.abbrev?.pt === selectedBook);
      if (currentIndex < booksArray.length - 1) {
        setSelectedBook(booksArray[currentIndex + 1].abbrev.pt);
        setSelectedChapter(1);
      }
    }
  };

  const goToPreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else {
      const booksArray = Array.isArray(books) ? books : [];
      const currentIndex = booksArray.findIndex(b => b.abbrev?.pt === selectedBook);
      if (currentIndex > 0) {
        const prevBook = booksArray[currentIndex - 1];
        setSelectedBook(prevBook.abbrev.pt);
        setSelectedChapter(prevBook.chapters);
      }
    }
  };

  const booksArray = Array.isArray(books) ? books : [];
  const currentBook = booksArray.find(b => b.abbrev?.pt === selectedBook);
  const oldTestament = booksArray.filter(b => b.testament === "VT");
  const newTestament = booksArray.filter(b => b.testament === "NT");

  if (loadingBooks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Top Header - Icons only */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-14 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-1">
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-search-open">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Buscar na Bíblia</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: amor, Davi, fé, salvação..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        data-testid="input-search"
                      />
                      <Button onClick={handleSearch} disabled={searchMutation.isPending}>
                        {searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Busque qualquer palavra, nome, expressão ou tema na Bíblia
                    </p>
                  </div>
                  
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                      {/* Book suggestions first */}
                      {matchedBooks.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Book className="h-4 w-4" />
                            Ir para livro
                          </h3>
                          <div className="space-y-2">
                            {matchedBooks.map((book) => (
                              <SheetClose asChild key={book.abbrev.pt}>
                                <button
                                  className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover-elevate active-elevate-2 transition-colors shadow-md"
                                  onClick={() => {
                                    setSelectedBook(book.abbrev.pt);
                                    setSelectedChapter(1);
                                    setSearchQuery("");
                                    setMatchedBooks([]);
                                  }}
                                  data-testid={`button-book-suggestion-${book.abbrev.pt}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                                      <Book className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-sm">
                                        {t.bibleBooks[book.abbrev.pt] || book.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {book.chapters} {book.chapters === 1 ? 'capítulo' : 'capítulos'}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </SheetClose>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Verse results */}
                      {searchMutation.data && (
                        <div>
                          {matchedBooks.length > 0 && (
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <Search className="h-4 w-4" />
                              Versículos encontrados
                            </h3>
                          )}
                          <div className="space-y-2">
                            {(searchMutation.data as any).verses?.map((result: any, index: number) => (
                              <SheetClose asChild key={index}>
                                <button
                                  className="w-full text-left p-4 rounded-xl border hover-elevate active-elevate-2 transition-colors"
                                  onClick={() => {
                                    setSelectedBook(result.book.abbrev.pt);
                                    setSelectedChapter(result.chapter);
                                    setSearchQuery("");
                                    setMatchedBooks([]);
                                  }}
                                >
                                  <div className="font-semibold text-sm mb-1">
                                    {t.bibleBooks[result.book.abbrev.pt] || result.book.name} {result.chapter}:{result.number}
                                  </div>
                                  <p className="text-sm text-muted-foreground font-serif">{result.text}</p>
                                </button>
                              </SheetClose>
                            )) || <p className="text-center text-muted-foreground py-4">Nenhum versículo encontrado.</p>}
                          </div>
                        </div>
                      )}
                      
                      {!searchMutation.data && matchedBooks.length === 0 && searchMutation.isIdle && (
                        <div className="text-center text-muted-foreground py-8">
                          <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Digite para buscar livros ou versículos</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={isBooksOpen} onOpenChange={setIsBooksOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-menu">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Livros da Bíblia</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="nt" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ot">Antigo ({oldTestament.length})</TabsTrigger>
                    <TabsTrigger value="nt">Novo ({newTestament.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ot" className="mt-4">
                    <ScrollArea className="h-[60vh]">
                      <div className="grid grid-cols-2 gap-2">
                        {oldTestament.map(book => (
                          <SheetClose asChild key={book.abbrev.pt}>
                            <Button
                              variant={selectedBook === book.abbrev.pt ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => {
                                setSelectedBook(book.abbrev.pt);
                                setSelectedChapter(1);
                              }}
                              data-testid={`button-book-${book.abbrev.pt}`}
                            >
                              {t.bibleBooks[book.abbrev.pt] || book.name}
                            </Button>
                          </SheetClose>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="nt" className="mt-4">
                    <ScrollArea className="h-[60vh]">
                      <div className="grid grid-cols-2 gap-2">
                        {newTestament.map(book => (
                          <SheetClose asChild key={book.abbrev.pt}>
                            <Button
                              variant={selectedBook === book.abbrev.pt ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => {
                                setSelectedBook(book.abbrev.pt);
                                setSelectedChapter(1);
                              }}
                              data-testid={`button-book-${book.abbrev.pt}`}
                            >
                              {t.bibleBooks[book.abbrev.pt] || book.name}
                            </Button>
                          </SheetClose>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            <Sheet open={isChaptersOpen} onOpenChange={setIsChaptersOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-version">
                  {VERSIONS.find(v => v.value === version)?.label || "NVI"}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Navegar</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="chapters" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chapters">Capítulos</TabsTrigger>
                    <TabsTrigger value="books">Livros</TabsTrigger>
                    <TabsTrigger value="version">Versão</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chapters" className="mt-4">
                    {currentBook && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Capítulos de {currentBook.name}</h3>
                        <ScrollArea className="h-[60vh]">
                          <div className="grid grid-cols-6 gap-2">
                            {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(chap => (
                              <SheetClose asChild key={chap}>
                                <Button
                                  size="sm"
                                  variant={selectedChapter === chap ? "default" : "outline"}
                                  onClick={() => setSelectedChapter(chap)}
                                  data-testid={`button-chapter-${chap}`}
                                >
                                  {chap}
                                </Button>
                              </SheetClose>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="books" className="mt-4">
                    <Tabs defaultValue="nt" className="mt-2">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ot">Antigo ({oldTestament.length})</TabsTrigger>
                        <TabsTrigger value="nt">Novo ({newTestament.length})</TabsTrigger>
                      </TabsList>
                      <TabsContent value="ot" className="mt-4">
                        <ScrollArea className="h-[50vh]">
                          <div className="grid grid-cols-2 gap-2">
                            {oldTestament.map(book => (
                              <SheetClose asChild key={book.abbrev.pt}>
                                <Button
                                  variant={selectedBook === book.abbrev.pt ? "default" : "outline"}
                                  className="justify-start"
                                  onClick={() => {
                                    setSelectedBook(book.abbrev.pt);
                                    setSelectedChapter(1);
                                  }}
                                  data-testid={`button-book-nav-${book.abbrev.pt}`}
                                >
                                  {t.bibleBooks[book.abbrev.pt] || book.name}
                                </Button>
                              </SheetClose>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="nt" className="mt-4">
                        <ScrollArea className="h-[50vh]">
                          <div className="grid grid-cols-2 gap-2">
                            {newTestament.map(book => (
                              <SheetClose asChild key={book.abbrev.pt}>
                                <Button
                                  variant={selectedBook === book.abbrev.pt ? "default" : "outline"}
                                  className="justify-start"
                                  onClick={() => {
                                    setSelectedBook(book.abbrev.pt);
                                    setSelectedChapter(1);
                                  }}
                                  data-testid={`button-book-nav-${book.abbrev.pt}`}
                                >
                                  {t.bibleBooks[book.abbrev.pt] || book.name}
                                </Button>
                              </SheetClose>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                  
                  <TabsContent value="version" className="mt-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Versão da Bíblia</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {VERSIONS.map(v => (
                          <Button
                            key={v.value}
                            variant={version === v.value ? "default" : "outline"}
                            onClick={() => {
                              setVersion(v.value);
                            }}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loadingChapter ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : chapterData ? (
          <>
            {/* Book Name - Large Centered */}
            <h1 className="text-center text-3xl md:text-4xl font-serif font-semibold text-foreground mb-2" data-testid="text-book-name">
              {t.bibleBooks[chapterData.book.abbrev] || chapterData.book.name}
            </h1>
            
            {/* Chapter Number - Gigantic Centered */}
            <div className="text-center text-8xl md:text-9xl font-display font-bold text-foreground/90 mb-8" data-testid="text-chapter-number">
              {chapterData.chapter.number}
            </div>

            {/* Verses - Clean Reading Mode with Highlights */}
            <div className="space-y-3 max-w-none">
              {chapterData.verses.map((verse) => {
                const verseHighlight = getVerseHighlight(verse.number);
                const highlightBg = verseHighlight ? getHighlightBg(verseHighlight.color) : "";
                
                return (
                  <Popover 
                    key={verse.number}
                    open={selectedVerse === verse.number && highlightPopoverOpen}
                    onOpenChange={(open) => {
                      if (open) {
                        setSelectedVerse(verse.number);
                        setHighlightPopoverOpen(true);
                      } else {
                        setHighlightPopoverOpen(false);
                        setSelectedVerse(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div 
                        className={`flex items-baseline gap-2 cursor-pointer rounded-md px-2 py-1 transition-all hover:bg-accent/50 ${highlightBg}`}
                        data-testid={`verse-container-${verse.number}`}
                      >
                        <sup className={`text-[0.65rem] font-bold ${getVerseNumberColor(verse.number)} min-w-[1.5rem] text-right flex-shrink-0 leading-none`} data-testid={`verse-number-${verse.number}`}>
                          {verse.number}
                        </sup>
                        <p className="flex-1 font-serif text-base md:text-lg leading-relaxed text-foreground" data-testid={`verse-text-${verse.number}`}>
                          {verse.text}
                        </p>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <Tabs defaultValue="highlight" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="highlight">Destacar</TabsTrigger>
                          <TabsTrigger value="note">Nota</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="highlight" className="space-y-3">
                          <h4 className="font-medium text-sm">{t.bible.chooseHighlightColor}</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {highlightColors.map(color => (
                              <Button
                                key={color.name}
                                variant={verseHighlight?.color === color.name ? "default" : "outline"}
                                size="sm"
                                className={`${color.bg} hover:${color.bg}`}
                                onClick={() => handleAddHighlight(verse, color.name)}
                                data-testid={`button-highlight-${color.name}`}
                              >
                                {color.label}
                              </Button>
                            ))}
                          </div>
                          {verseHighlight && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => handleRemoveHighlight(verse.number)}
                              data-testid="button-remove-highlight"
                            >
                              {t.bible.removeHighlight}
                            </Button>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="note" className="space-y-3">
                          <h4 className="font-medium text-sm">{t.bible.addNote}</h4>
                          <Textarea
                            placeholder={t.bible.writeNoteHere}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="min-h-[100px]"
                            data-testid="textarea-note"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleAddNote(verse)}
                              disabled={!noteText.trim() || noteMutation.isPending}
                              data-testid="button-save-note"
                            >
                              {noteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                getVerseNote(verse.number) ? t.bible.update : t.bible.save
                              )}
                            </Button>
                            {getVerseNote(verse.number) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteNote(verse.number)}
                                disabled={deleteNoteMutation.isPending}
                                data-testid="button-delete-note"
                              >
                                {deleteNoteMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  t.bible.delete
                                )}
                              </Button>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      {/* Audio & Share Buttons */}
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={async () => {
                            stopAllAudio();
                            
                            const url = `/api/bible/audio/verse/${t.currentLanguage}/${version}/${selectedBook}/${selectedChapter}/${verse.number}`;
                            
                            toast({
                              title: "Gerando áudio do versículo...",
                              description: "Aguarde alguns segundos",
                            });
                            
                            setPlayingVerseNumber(verse.number);
                            
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const headers: Record<string, string> = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
                              
                              const controller = new AbortController();
                              const timeoutId = setTimeout(() => controller.abort(), 30000);
                              
                              const response = await fetch(url, { 
                                credentials: 'include',
                                headers,
                                signal: controller.signal,
                              });
                              clearTimeout(timeoutId);
                              
                              if (!response.ok) {
                                throw new Error(`HTTP ${response.status}`);
                              }
                              const blob = await response.blob();
                              const blobUrl = URL.createObjectURL(blob);
                              
                              const audio = new Audio(blobUrl);
                              audioElementRef.current = audio;
                              
                              audio.onloadeddata = () => {
                                audio.play().then(() => {
                                  setIsPlayingAudio(true);
                                  setAudioUrl(blobUrl);
                                  toast({
                                    title: "Áudio do versículo iniciado",
                                  });
                                }).catch(error => {
                                  console.error("Audio error:", error);
                                  stopAllAudio();
                                  URL.revokeObjectURL(blobUrl);
                                  toast({
                                    title: "Erro ao reproduzir áudio",
                                    variant: "destructive",
                                  });
                                });
                              };
                              
                              audio.onended = () => {
                                setIsPlayingAudio(false);
                                setPlayingVerseNumber(null);
                                URL.revokeObjectURL(blobUrl);
                              };
                              
                              audio.onerror = () => {
                                stopAllAudio();
                                URL.revokeObjectURL(blobUrl);
                                toast({
                                  title: "Erro ao carregar áudio",
                                  variant: "destructive",
                                });
                              };
                            } catch (error) {
                              console.error("Audio fetch error:", error);
                              setPlayingVerseNumber(null);
                              toast({
                                title: "Erro ao carregar áudio",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid={`button-audio-verse-${verse.number}`}
                        >
                          {playingVerseNumber === verse.number ? (
                            <><VolumeX className="h-4 w-4 mr-2" />Tocando...</>
                          ) : (
                            <><Volume2 className="h-4 w-4 mr-2" />Ouvir versículo</>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setVerseToShare(verse);
                            setShareSheetOpen(true);
                            setHighlightPopoverOpen(false);
                          }}
                          data-testid={`button-share-verse-${verse.number}`}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          {t.bible.shareVerse}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setVerseForCommentary(verse);
                            setCommentarySheetOpen(true);
                            setHighlightPopoverOpen(false);
                          }}
                          data-testid={`button-commentary-${verse.number}`}
                        >
                          <Book className="h-4 w-4 mr-2" />
                          Ver Comentário
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>

            {/* Mark as Read Button */}
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={() => markReadMutation.mutate({ 
                  book: chapterData.book.name, 
                  chapter: chapterData.chapter.number 
                })}
                disabled={markReadMutation.isPending}
                data-testid="button-mark-read"
              >
                {markReadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t.bible.markAsRead}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            {t.bible.selectBookToStart}
          </div>
        )}
      </main>

      {/* Share Sheet */}
      <Sheet open={shareSheetOpen} onOpenChange={setShareSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{t.bible.shareVerse}</SheetTitle>
          </SheetHeader>
          
          {verseToShare && chapterData && (
            <div className="mt-6 space-y-6">
              {/* Preview Card */}
              <div id="verse-card" className="bg-gradient-to-br from-primary/20 via-background to-primary/10 rounded-lg p-8 border shadow-lg">
                <div className="space-y-4">
                  <p className="font-serif text-xl md:text-2xl leading-relaxed text-foreground">
                    "{verseToShare.text}"
                  </p>
                  <p className="text-right font-medium text-muted-foreground">
                    {chapterData.book.name} {chapterData.chapter.number}:{verseToShare.number}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const text = `"${verseToShare.text}"\n\n${chapterData.book.name} ${chapterData.chapter.number}:${verseToShare.number}`;
                      await navigator.clipboard.writeText(text);
                      toast({
                        title: t.bible.copied,
                        description: t.bible.verseCopied,
                      });
                    } catch (error) {
                      toast({
                        title: t.bible.error,
                        description: t.bible.failedToCopy,
                        variant: "destructive",
                      });
                    }
                  }}
                  data-testid="button-copy-text"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t.bible.copyText}
                </Button>
                
                <Button
                  onClick={async () => {
                    try {
                      const { toPng } = await import('html-to-image');
                      const element = document.getElementById('verse-card');
                      if (!element) return;
                      
                      const dataUrl = await toPng(element, {
                        quality: 1,
                        pixelRatio: 2,
                      });
                      
                      const link = document.createElement('a');
                      link.download = `${chapterData.book.abbrev}-${chapterData.chapter.number}-${verseToShare.number}.png`;
                      link.href = dataUrl;
                      link.click();
                      
                      toast({
                        title: t.bible.downloadStarted,
                        description: t.bible.verseImageDownloaded,
                      });
                    } catch (error) {
                      toast({
                        title: t.bible.error,
                        description: t.bible.failedToGenerate,
                        variant: "destructive",
                      });
                    }
                  }}
                  data-testid="button-download-image"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t.bible.downloadImage}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation */}
      <div className="fixed bottom-24 md:bottom-4 left-0 right-0 z-30 px-4">
        <div className="max-w-md mx-auto bg-background/95 backdrop-blur border rounded-full shadow-lg px-4 py-2">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={goToPreviousChapter}
              disabled={!selectedBook || (booksArray.length > 0 && selectedBook === booksArray[0]?.abbrev?.pt && selectedChapter === 1)}
              data-testid="button-previous-chapter"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Audio Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleAudio}
              disabled={!selectedBook || isLoadingAudio}
              data-testid="button-toggle-audio"
            >
              {isLoadingAudio ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : isPlayingAudio ? (
                <VolumeX className="h-5 w-5 text-primary" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            {/* Offline Download Button */}
            {selectedBook && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={async () => {
                  if (isChapterOffline(selectedBook, selectedChapter, version)) {
                    await deleteChapter(selectedBook, selectedChapter, version);
                  } else {
                    await downloadChapter(selectedBook, selectedChapter, version);
                  }
                }}
                disabled={!selectedBook}
                data-testid="button-toggle-offline"
              >
                {isChapterOffline(selectedBook, selectedChapter, version) ? (
                  <CloudOff className="h-5 w-5 text-primary" />
                ) : (
                  <Cloud className="h-5 w-5" />
                )}
              </Button>
            )}
            
            <button
              onClick={() => setIsChaptersOpen(true)}
              className="text-sm font-medium min-w-[100px] text-center hover-elevate px-3 py-2 rounded-full transition-colors"
              data-testid="text-chapter-navigation"
            >
              {chapterData ? `${t.bibleBooks[chapterData.book.abbrev] || chapterData.book.name} ${chapterData.chapter.number}` : "Selecione"}
            </button>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={goToNextChapter}
              disabled={!currentBook || (booksArray.length > 0 && selectedBook === booksArray[booksArray.length - 1]?.abbrev?.pt && selectedChapter === currentBook?.chapters)}
              data-testid="button-next-chapter"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Commentary Sheet */}
      <Sheet open={commentarySheetOpen} onOpenChange={setCommentarySheetOpen}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>
              Comentário Teológico - {selectedBook} {selectedChapter}:{verseForCommentary?.number}
            </SheetTitle>
          </SheetHeader>
          
          {verseForCommentary && (
            <div className="mt-4">
              {/* Verse Text */}
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm font-semibold text-muted-foreground mb-1">
                  {selectedBook} {selectedChapter}:{verseForCommentary.number}
                </p>
                <p className="font-serif text-base leading-relaxed">
                  "{verseForCommentary.text}"
                </p>
              </div>

              {/* Commentary Tabs */}
              <Tabs defaultValue="exegese" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="exegese">Exegese</TabsTrigger>
                  <TabsTrigger value="historico">Histórico</TabsTrigger>
                  <TabsTrigger value="aplicacao">Aplicação</TabsTrigger>
                  <TabsTrigger value="referencias">Referências</TabsTrigger>
                  <TabsTrigger value="teologico">Teológico</TabsTrigger>
                </TabsList>

                {['exegese', 'historico', 'aplicacao', 'referencias', 'teologico'].map((type) => (
                  <TabsContent key={type} value={type} className="mt-4">
                    <CommentaryContent
                      version={version}
                      book={selectedBook!}
                      chapter={selectedChapter}
                      verse={verseForCommentary.number}
                      commentaryType={type}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Audio Mode Selection Dialog */}
      <Dialog open={audioModeDialogOpen} onOpenChange={setAudioModeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha o modo de áudio</DialogTitle>
            <DialogDescription>
              Você pode ouvir um versículo, o capítulo ou o livro completo
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            <Button
              onClick={() => handleStartAudio('verse', selectedVerse || undefined)}
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
              data-testid="button-audio-verse"
              disabled={selectedVerse === null}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <span className="font-semibold">Versículo Selecionado</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                {selectedVerse !== null ? `Ouvir apenas versículo ${selectedVerse}` : 'Selecione um versículo primeiro'}
              </p>
            </Button>
            
            <Button
              onClick={() => handleStartAudio('chapter')}
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
              data-testid="button-audio-chapter"
            >
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                <span className="font-semibold">Capítulo Atual</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Ouvir apenas {selectedBook} {selectedChapter}
              </p>
            </Button>
            
            <Button
              onClick={() => handleStartAudio('book')}
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2"
              data-testid="button-audio-book"
            >
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                <span className="font-semibold">Livro Completo</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Ouvir todo o livro de {currentBook?.name || selectedBook} em sequência
              </p>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Commentary Content Component
function CommentaryContent({
  version,
  book,
  chapter,
  verse,
  commentaryType,
}: {
  version: string;
  book: string;
  chapter: number;
  verse: number;
  commentaryType: string;
}) {
  const { toast } = useToast();

  const { data: commentary, isLoading, error } = useQuery({
    queryKey: ['/api/bible/commentary', version, book, chapter, verse, commentaryType],
    queryFn: async () => {
      const response = await fetch(
        `/api/bible/commentary/${version}/${book}/${chapter}/${verse}?type=${commentaryType}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao carregar comentário');
      }
      
      return await response.json();
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Gerando comentário...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-sm text-destructive">
          Erro ao carregar comentário. Verifique se o OpenAI está configurado.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[60vh]">
      <div className="prose prose-sm max-w-none p-4">
        <p className="whitespace-pre-wrap leading-relaxed">
          {commentary?.content}
        </p>
      </div>
    </ScrollArea>
  );
}
