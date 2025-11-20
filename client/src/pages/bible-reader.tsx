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
  Volume2,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Book,
  BookmarkPlus,
  Settings2,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Bookmark } from "@shared/schema";

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
  const [version, setVersion] = useState("nvi");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBooksOpen, setIsBooksOpen] = useState(false);
  const [isChaptersOpen, setIsChaptersOpen] = useState(false);

  // Fetch all Bible books
  const { data: books = [], isLoading: loadingBooks, error: booksError } = useQuery<BibleBook[]>({
    queryKey: ["/api/bible/books"],
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch current chapter
  const { data: chapterData, isLoading: loadingChapter, error: chapterError } = useQuery<Chapter>({
    queryKey: selectedBook ? [`/api/bible/${version}/${selectedBook}/${selectedChapter}`] : [""],
    enabled: !!selectedBook,
    retry: 2,
    retryDelay: 1000,
    queryFn: async ({ queryKey }) => {
      const url = queryKey[0] as string;
      if (!url || url === "") return null;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Falha ao carregar capítulo");
      }
      return response.json();
    },
  });

  // Fetch user bookmarks
  const { data: bookmarks = [] } = useQuery<Bookmark[]>({
    queryKey: ["/api/bible/bookmarks"],
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
        title: "Favorito adicionado!",
        description: "Versículo salvo nos seus favoritos.",
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
      
      let description = `Você ganhou ${data.xpGained} XP!`;
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        description += ` 🏆 ${data.unlockedAchievements.map((a: any) => a.name).join(", ")}`;
      }
      
      toast({
        title: "Capítulo completo! 🎉",
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

  useEffect(() => {
    if (booksError) {
      toast({
        title: "Erro ao carregar livros",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [booksError, toast]);

  useEffect(() => {
    if (chapterError) {
      toast({
        title: "Erro ao carregar capítulo",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [chapterError, toast]);

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
            <Button variant="ghost" size="icon" disabled data-testid="button-audio">
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
          
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
                                {result.book.name} {result.chapter}:{result.number}
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
                              {book.name}
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
                              {book.name}
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
              {chapterData.book.name}
            </h1>
            
            {/* Chapter Number - Gigantic Centered */}
            <div className="text-center text-8xl md:text-9xl font-display font-bold text-foreground/90 mb-8" data-testid="text-chapter-number">
              {chapterData.chapter.number}
            </div>

            {/* Verses - Clean Reading Mode */}
            <div className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed text-foreground">
              <p className="text-base md:text-lg leading-loose">
                {chapterData.verses.map((verse, idx) => (
                  <span key={verse.number}>
                    <sup className="text-xs font-bold text-muted-foreground mr-1" data-testid={`verse-number-${verse.number}`}>
                      {toSuperscript(verse.number)}
                    </sup>
                    <span className="inline" data-testid={`verse-text-${verse.number}`}>{verse.text}</span>
                    {idx < chapterData.verses.length - 1 && " "}
                  </span>
                ))}
              </p>
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
                Marcar como Lido
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            Selecione um livro para começar
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-24 md:bottom-4 left-0 right-0 z-30 px-4">
        <div className="max-w-md mx-auto bg-background/95 backdrop-blur border rounded-full shadow-lg px-4 py-2">
          <div className="flex items-center justify-center gap-4">
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
            
            <button
              onClick={() => setIsChaptersOpen(true)}
              className="text-sm font-medium min-w-[120px] text-center hover-elevate px-4 py-2 rounded-full transition-colors"
              data-testid="text-chapter-navigation"
            >
              {chapterData ? `${chapterData.book.name} ${chapterData.chapter.number}` : "Selecione"}
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
