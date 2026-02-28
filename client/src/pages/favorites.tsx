import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  BookmarkIcon, 
  Highlighter, 
  FileText, 
  ArrowLeft, 
  Search, 
  Trash2, 
  Share2,
  ChevronRight,
  Heart
} from "lucide-react";
import type { Bookmark, Highlight, Note } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShareSheet } from "@/components/ShareSheet";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { QueryErrorBoundary, LoadingBoundary } from "@/components/QueryErrorBoundary";

function FavoritesContent() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("bookmarks");
  const [shareData, setShareData] = useState<{
    open: boolean;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    version: string;
  }>({
    open: false,
    book: "",
    chapter: 1,
    verse: 1,
    text: "",
    version: "nvi"
  });
  
  const { data: bookmarks = [], isLoading: loadingBookmarks } = useQuery<Bookmark[]>({
    queryKey: ["/api/bible/bookmarks"],
  });

  const { data: highlights = [], isLoading: loadingHighlights } = useQuery<Highlight[]>({
    queryKey: ["/api/bible/highlights"],
  });

  const { data: notes = [], isLoading: loadingNotes } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bible/bookmarks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bible/bookmarks"] });
      toast({ title: "Removido", description: "Favorito removido com sucesso" });
    }
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bible/highlights/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bible/highlights"] });
      toast({ title: "Removido", description: "Destaque removido com sucesso" });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Removido", description: "Nota removida com sucesso" });
    }
  });

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => 
      b.book.toLowerCase().includes(search.toLowerCase()) || 
      b.verseText.toLowerCase().includes(search.toLowerCase())
    );
  }, [bookmarks, search]);

  const filteredHighlights = useMemo(() => {
    return highlights.filter(h => 
      h.book.toLowerCase().includes(search.toLowerCase()) || 
      h.verseText.toLowerCase().includes(search.toLowerCase())
    );
  }, [highlights, search]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.book.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase())
    );
  }, [notes, search]);

  const getHighlightCardStyles = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-900 dark:text-yellow-200";
      case "green": return "bg-green-500/10 border-green-500/20 text-green-900 dark:text-green-200";
      case "blue": return "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200";
      case "purple": return "bg-purple-500/10 border-purple-500/20 text-purple-900 dark:text-purple-200";
      case "pink": return "bg-pink-500/10 border-pink-500/20 text-pink-900 dark:text-pink-200";
      case "orange": return "bg-orange-500/10 border-orange-500/20 text-orange-900 dark:text-orange-200";
      default: return "bg-muted/30 border-muted-foreground/10";
    }
  };

  const getHighlightBadgeBg = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-500 text-white";
      case "green": return "bg-green-500 text-white";
      case "blue": return "bg-blue-500 text-white";
      case "purple": return "bg-purple-500 text-white";
      case "pink": return "bg-pink-500 text-white";
      case "orange": return "bg-orange-500 text-white";
      default: return "";
    }
  };

  if (loadingBookmarks || loadingHighlights || loadingNotes) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden mesh-primary">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-muted/50 dark:bg-muted/30 blur-3xl" />
      </div>
      <div className="relative z-10 container max-w-5xl mx-auto p-4 md:p-8 pb-32">
        {/* Header Section */}
        <div className="text-center space-y-2 mb-10">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">MEUS TESOUROS</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{t.favorites.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.favorites.subtitle}
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Pesquisar tesouros..." 
              className="pl-11 h-12 bg-card/50 backdrop-blur-md border-primary/10 rounded-2xl focus-visible:ring-primary/30 shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Custom Modern Tabs List */}
        <div className="flex justify-center mb-8 w-full overflow-hidden">
          <TabsList className="inline-flex h-14 md:h-14 h-auto items-center justify-center rounded-2xl bg-muted/40 p-1.5 backdrop-blur-md border border-white/10 shadow-lg w-full md:w-auto flex-wrap md:flex-nowrap">
            <TabsTrigger 
              value="bookmarks" 
              className="flex-1 md:flex-none flex items-center gap-2 md:gap-3 px-3 md:px-6 h-10 md:h-11 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 min-w-0"
            >
              <BookmarkIcon className="h-4 w-4 shrink-0" />
              <span className="font-semibold text-xs md:text-sm truncate">{t.favorites.bookmarks}</span>
              <Badge variant="outline" className="hidden xs:flex ml-1 px-1 h-4 md:h-5 border-current opacity-80 text-[10px]">{filteredBookmarks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="highlights" 
              className="flex-1 md:flex-none flex items-center gap-2 md:gap-3 px-3 md:px-6 h-10 md:h-11 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 min-w-0"
            >
              <Highlighter className="h-4 w-4 shrink-0" />
              <span className="font-semibold text-xs md:text-sm truncate">{t.favorites.highlights}</span>
              <Badge variant="outline" className="hidden xs:flex ml-1 px-1 h-4 md:h-5 border-current opacity-80 text-[10px]">{filteredHighlights.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="flex-1 md:flex-none flex items-center gap-2 md:gap-3 px-3 md:px-6 h-10 md:h-11 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 min-w-0"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="font-semibold text-xs md:text-sm truncate">{t.favorites.notes}</span>
              <Badge variant="outline" className="hidden xs:flex ml-1 px-1 h-4 md:h-5 border-current opacity-80 text-[10px]">{filteredNotes.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

          <ScrollArea className="h-[calc(100vh-320px)] pr-4 -mr-4">
              {/* Bookmarks Tab */}
              <TabsContent value="bookmarks" className="m-0 focus-visible:ring-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-6"
                >
                  {filteredBookmarks.length === 0 ? (
                    <EmptyState icon={BookmarkIcon} text={search ? "Nenhum favorito encontrado" : `${t.favorites.no_favorites}. ${t.favorites.add_first}!`} />
                  ) : (
                    filteredBookmarks.map((bookmark) => (
                      <Card key={bookmark.id} className="glass-premium hover-premium group relative overflow-hidden border-primary/5 bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/20 hover:shadow-xl transition-all duration-500 rounded-3xl">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                          <div className="space-y-1.5">
                            <Link href={`/bible?book=${bookmark.book.toLowerCase()}&chapter=${bookmark.chapter}&verse=${bookmark.verse}&version=${bookmark.version || 'nvi'}`}>
                              <div className="inline-flex items-center gap-2 group/link cursor-pointer">
                                <CardTitle className="text-xl font-bold tracking-tight text-primary">
                                  {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                                </CardTitle>
                                <ChevronRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                              </div>
                            </Link>
                            <Badge variant="secondary" className="block w-fit bg-primary/5 text-primary-foreground/70 font-mono text-[10px] uppercase tracking-widest">{bookmark.version || "NVI"}</Badge>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShareData({...shareData, open: true, book: bookmark.book, chapter: bookmark.chapter, verse: bookmark.verse, text: bookmark.verseText, version: bookmark.version || 'nvi'})}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl text-destructive" onClick={() => deleteBookmarkMutation.mutate(bookmark.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="font-serif text-xl leading-relaxed text-foreground/90 italic decoration-primary/10 underline-offset-8">"{bookmark.verseText}"</p>
                          {bookmark.note && (
                            <div className="mt-5 p-4 bg-primary/5 border border-primary/10 rounded-2xl relative">
                              <FileText className="absolute top-4 right-4 h-4 w-4 text-primary/30" />
                              <p className="text-sm text-muted-foreground font-medium leading-relaxed">{bookmark.note}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </motion.div>
              </TabsContent>

              {/* Highlights Tab */}
              <TabsContent value="highlights" className="m-0 focus-visible:ring-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-6"
                >
                  {filteredHighlights.length === 0 ? (
                    <EmptyState icon={Highlighter} text={search ? "Nenhum destaque encontrado" : `${t.favorites.no_favorites}. ${t.favorites.add_first}!`} />
                  ) : (
                    filteredHighlights.map((highlight) => (
                      <Card key={highlight.id} className={`glass-premium hover-premium group relative overflow-hidden border-2 transition-all duration-500 rounded-3xl ${getHighlightCardStyles(highlight.color)} shadow-sm hover:shadow-lg`}>
                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                          <div className="space-y-2">
                            <Link href={`/bible?book=${highlight.book.toLowerCase()}&chapter=${highlight.chapter}&verse=${highlight.verse}`}>
                              <div className="inline-flex items-center gap-2 group/link cursor-pointer">
                                <CardTitle className="text-xl font-bold tracking-tight">
                                  {highlight.book} {highlight.chapter}:{highlight.verse}
                                </CardTitle>
                                <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                              </div>
                            </Link>
                            <Badge className={`w-fit uppercase text-[10px] tracking-widest font-bold px-2 py-0.5 rounded-lg ${getHighlightBadgeBg(highlight.color)}`}>
                              {highlight.color}
                            </Badge>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShareData({...shareData, open: true, book: highlight.book, chapter: highlight.chapter, verse: highlight.verse, text: highlight.verseText, version: 'nvi'})}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl text-destructive" onClick={() => deleteHighlightMutation.mutate(highlight.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="font-serif text-xl leading-relaxed font-medium">{highlight.verseText}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </motion.div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="m-0 focus-visible:ring-0">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-6"
                >
                  {filteredNotes.length === 0 ? (
                    <EmptyState icon={FileText} text={search ? "Nenhuma nota encontrada" : `${t.favorites.no_favorites}. ${t.favorites.add_first}!`} />
                  ) : (
                    filteredNotes.map((note) => (
                      <Card key={note.id} className="glass-premium hover-premium group relative overflow-hidden border-primary/5 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-500 rounded-3xl">
                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                          <div className="space-y-1.5">
                            <Link href={`/bible?book=${note.book.toLowerCase()}&chapter=${note.chapter}${note.verse ? `&verse=${note.verse}` : ''}`}>
                              <div className="inline-flex items-center gap-2 group/link cursor-pointer">
                                <CardTitle className="text-xl font-bold tracking-tight text-primary">
                                  {note.book} {note.chapter}:{note.verse}
                                </CardTitle>
                                <ChevronRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                              </div>
                            </Link>
                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                              <Heart className="h-2.5 w-2.5 fill-current" />
                              {new Date(note.createdAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 text-destructive transition-all" onClick={() => deleteNoteMutation.mutate(note.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="p-5 bg-background/40 rounded-2xl border border-primary/5 shadow-inner">
                            <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-wrap font-medium">{note.content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </motion.div>
              </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      <ShareSheet 
        open={shareData.open}
        onOpenChange={(open) => setShareData(prev => ({ ...prev, open }))}
        bookName={shareData.book}
        bookAbbrev={shareData.book}
        chapter={shareData.chapter}
        verseNumber={shareData.verse}
        verseText={shareData.text}
        version={shareData.version}
      />
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-6 bg-card/20 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-primary/10"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <Icon className="relative h-16 w-16 text-primary opacity-30" />
      </div>
      <p className="text-muted-foreground font-semibold text-lg text-center max-w-xs leading-tight">
        {text}
      </p>
    </motion.div>
  );
}

export default function Favorites() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
