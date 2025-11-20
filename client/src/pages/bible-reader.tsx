import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Book,
  BookmarkPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  BookOpen,
  Settings,
  Menu,
  CheckCircle,
  Trophy
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  { value: "nvi", label: "NVI - Nova Versão Internacional" },
  { value: "acf", label: "ACF - Almeida Corrigida Fiel" },
  { value: "arc", label: "ARC - Almeida Revista e Corrigida" },
  { value: "ra", label: "RA - Almeida Revista e Atualizada" },
];

export default function BibleReader() {
  const { toast } = useToast();
  const [version, setVersion] = useState("nvi");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBooksMenuOpen, setIsBooksMenuOpen] = useState(false);

  // Fetch all Bible books (backend has offline fallback)
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

  // Fetch Bible settings
  const { data: settings } = useQuery({
    queryKey: ["/api/bible/settings"],
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
        description += ` 🏆 Conquistas desbloqueadas: ${data.unlockedAchievements.map((a: any) => a.name).join(", ")}`;
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

  // Show error toast when books API fails
  useEffect(() => {
    if (booksError) {
      toast({
        title: "Erro ao carregar livros da Bíblia",
        description: "Não foi possível carregar a lista de livros. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [booksError, toast]);

  // Show error toast when chapter API fails
  useEffect(() => {
    if (chapterError) {
      toast({
        title: "Erro ao carregar capítulo",
        description: "Não foi possível carregar o capítulo. Tente novamente mais tarde.",
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
      // Go to next book
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
      // Go to previous book
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold" data-testid="text-page-title">
                Bíblia Sagrada
              </h1>
              <p className="text-muted-foreground">
                {chapterData ? `${chapterData.book.name} ${chapterData.chapter.number}` : "Selecione um livro"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Version Selector */}
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger className="w-[200px]" data-testid="select-bible-version">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERSIONS.map(v => (
                  <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Books Menu */}
            <Dialog open={isBooksMenuOpen} onOpenChange={setIsBooksMenuOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-open-books">
                  <Menu className="h-4 w-4 mr-2" />
                  Livros
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Livros da Bíblia</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="ot">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ot">Antigo Testamento ({oldTestament.length})</TabsTrigger>
                    <TabsTrigger value="nt">Novo Testamento ({newTestament.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ot" className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {oldTestament.map(book => (
                        <Button
                          key={book.abbrev.pt}
                          variant={selectedBook === book.abbrev.pt ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => {
                            setSelectedBook(book.abbrev.pt);
                            setSelectedChapter(1);
                            setIsBooksMenuOpen(false);
                          }}
                          data-testid={`button-book-${book.abbrev.pt}`}
                        >
                          <Book className="h-4 w-4 mr-2" />
                          {book.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="nt" className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {newTestament.map(book => (
                        <Button
                          key={book.abbrev.pt}
                          variant={selectedBook === book.abbrev.pt ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => {
                            setSelectedBook(book.abbrev.pt);
                            setSelectedChapter(1);
                            setIsBooksMenuOpen(false);
                          }}
                          data-testid={`button-book-${book.abbrev.pt}`}
                        >
                          <Book className="h-4 w-4 mr-2" />
                          {book.name}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar versículos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-search-bible"
              />
              <Button onClick={handleSearch} disabled={searchMutation.isPending} data-testid="button-search">
                {searchMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {booksError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Book className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Serviço Temporariamente Indisponível</h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar os livros da Bíblia. Por favor, tente novamente mais tarde.
              </p>
              <Button onClick={() => window.location.reload()} data-testid="button-reload-page">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        ) : loadingBooks || loadingChapter ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Chapter Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Capítulos</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentBook && (
                    <div className="grid grid-cols-4 gap-2 max-h-[600px] overflow-y-auto">
                      {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(chap => (
                        <Button
                          key={chap}
                          size="sm"
                          variant={selectedChapter === chap ? "default" : "outline"}
                          onClick={() => setSelectedChapter(chap)}
                          data-testid={`button-chapter-${chap}`}
                        >
                          {chap}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chapter Text */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-display">
                      {chapterData?.book.name} {chapterData?.chapter.number}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPreviousChapter}
                        disabled={!selectedBook || (booksArray.length > 0 && selectedBook === booksArray[0]?.abbrev?.pt && selectedChapter === 1)}
                        data-testid="button-previous-chapter"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNextChapter}
                        disabled={!currentBook || (booksArray.length > 0 && selectedBook === booksArray[booksArray.length - 1]?.abbrev?.pt && selectedChapter === currentBook?.chapters)}
                        data-testid="button-next-chapter"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="space-y-4 font-serif text-lg leading-relaxed">
                    {chapterData?.verses.map(verse => (
                      <div key={verse.number} className="group flex gap-3 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                        <Badge variant="outline" className="shrink-0 h-fit">{verse.number}</Badge>
                        <p className="flex-1">{verse.text}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleAddBookmark(verse)}
                          disabled={bookmarkMutation.isPending}
                          data-testid={`button-bookmark-${verse.number}`}
                        >
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    {chapterData?.verses.length} versículos
                  </p>
                  <Button
                    onClick={() => markReadMutation.mutate({ 
                      book: chapterData?.book.name || "", 
                      chapter: chapterData?.chapter.number || 0 
                    })}
                    disabled={markReadMutation.isPending}
                    data-testid="button-mark-read"
                  >
                    {markReadMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {markReadMutation.isPending ? "Marcando..." : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Lido
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Search Results Dialog */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Resultados da Busca: "{searchQuery}"</DialogTitle>
            </DialogHeader>
            {searchMutation.isPending ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : searchMutation.data ? (
              <div className="space-y-4">
                {searchMutation.data.verses?.map((result: any, index: number) => (
                  <Card key={index} className="hover-elevate cursor-pointer" onClick={() => {
                    setSelectedBook(result.book.abbrev.pt);
                    setSelectedChapter(result.chapter);
                    setIsSearchOpen(false);
                  }}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {result.book.name} {result.chapter}:{result.number}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-serif">{result.text}</p>
                    </CardContent>
                  </Card>
                )) || <p className="text-center text-muted-foreground">Nenhum resultado encontrado.</p>}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
