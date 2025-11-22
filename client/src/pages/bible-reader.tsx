import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";
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
  Play
} from "lucide-react";
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

const SUPERSCRIPTS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

function toSuperscript(num: number): string {
  return num.toString().split('').map(d => SUPERSCRIPTS[parseInt(d)]).join('');
}

export default function BibleReader() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isOnline, isChapterOffline, downloadChapter, deleteChapter, getOfflineChapter } = useOffline();
  const [version, setVersion] = useState("nvi");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBooksOpen, setIsBooksOpen] = useState(false);
  const [isChaptersOpen, setIsChaptersOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [highlightPopoverOpen, setHighlightPopoverOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [verseToShare, setVerseToShare] = useState<{ number: number; text: string } | null>(null);
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const playAudio = () => {
    if (!selectedBook) return;
    
    const url = `/api/bible/audio/${t.currentLanguage}/${version}/${selectedBook}/${selectedChapter}`;
    
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    
    const audio = new Audio(url);
    audio.play().then(() => {
      setIsPlayingAudio(true);
      setAudioUrl(url);
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
      };
      
      toast({
        title: t.bible.audioStarted || "Áudio iniciado",
        description: t.bible.listenWhileBrowsing || "Você pode continuar navegando enquanto ouve",
      });
    }).catch(error => {
      console.error("Audio playback error:", error);
      toast({
        title: "Erro ao reproduzir áudio",
        description: "Verifique se está autenticado e o OPENAI_API_KEY está configurado",
        variant: "destructive",
      });
    });
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      setAudioElement(null);
      setIsPlayingAudio(false);
      setAudioUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (audioElement && (selectedBook || selectedChapter)) {
      stopAudio();
    }
  }, [selectedBook, selectedChapter]);

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
      return await apiRequest("POST", "/api/bible/mark-read", data);
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
    { name: "yellow", bg: "bg-yellow-200/50 dark:bg-yellow-900/30", label: t.bible.yellow },
    { name: "green", bg: "bg-green-200/50 dark:bg-green-900/30", label: t.bible.green },
    { name: "blue", bg: "bg-blue-200/50 dark:bg-blue-900/30", label: t.bible.blue },
    { name: "purple", bg: "bg-purple-200/50 dark:bg-purple-900/30", label: t.bible.purple },
    { name: "pink", bg: "bg-pink-200/50 dark:bg-pink-900/30", label: t.bible.pink },
    { name: "orange", bg: "bg-orange-200/50 dark:bg-orange-900/30", label: t.bible.orange },
  ];

  const getHighlightBg = (color: string) => {
    const colorObj = highlightColors.find(c => c.name === color);
    return colorObj ? colorObj.bg : "";
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
    <div className="min-h-screen bg-background">
      {/* Top Header - Icons only */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
          <div className="flex items-center gap-1">
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-search-open">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Buscar Versículos</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua busca..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      data-testid="input-search"
                    />
                    <Button onClick={handleSearch} disabled={searchMutation.isPending}>
                      {searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  {searchMutation.data && (
                    <ScrollArea className="h-[60vh]">
                      <div className="space-y-3">
                        {(searchMutation.data as any).verses?.map((result: any, index: number) => (
                          <SheetClose asChild key={index}>
                            <button
                              className="w-full text-left p-4 rounded-lg border hover-elevate active-elevate-2 transition-colors"
                              onClick={() => {
                                setSelectedBook(result.book.abbrev.pt);
                                setSelectedChapter(result.chapter);
                              }}
                            >
                              <div className="font-semibold text-sm mb-1">
                                {t.bibleBooks[result.book.abbrev.pt] || result.book.name} {result.chapter}:{result.number}
                              </div>
                              <p className="text-sm text-muted-foreground font-serif">{result.text}</p>
                            </button>
                          </SheetClose>
                        )) || <p className="text-center text-muted-foreground">Nenhum resultado.</p>}
                      </div>
                    </ScrollArea>
                  )}
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
              <SheetContent side="bottom" className="h-[60vh]">
                <SheetHeader>
                  <SheetTitle>Versão & Capítulos</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
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
                  
                  {currentBook && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Capítulos de {currentBook.name}</h3>
                      <ScrollArea className="h-[30vh]">
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
                </div>
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
                        className={`flex items-start gap-2 cursor-pointer rounded-md px-2 py-1 transition-all hover:bg-accent/50 ${highlightBg}`}
                        data-testid={`verse-container-${verse.number}`}
                      >
                        <sup className="text-xs font-bold text-muted-foreground min-w-[1.5rem] text-right flex-shrink-0" data-testid={`verse-number-${verse.number}`}>
                          {toSuperscript(verse.number)}
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
                      
                      {/* Share Button */}
                      <div className="mt-3 pt-3 border-t">
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
              onClick={isPlayingAudio ? stopAudio : playAudio}
              disabled={!selectedBook}
              data-testid="button-toggle-audio"
            >
              {isPlayingAudio ? (
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
    </div>
  );
}
