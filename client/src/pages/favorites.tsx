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

export default function Favorites() {
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
  
  const { data: bookmarks = [], isLoading: loadingBookmarks, error: bookmarksError } = useQuery<Bookmark[]>({
    queryKey: ["/api/bible/bookmarks"],
    retry: 1,
  });

  const { data: highlights = [], isLoading: loadingHighlights, error: highlightsError } = useQuery<Highlight[]>({
    queryKey: ["/api/bible/highlights"],
    retry: 1,
  });

  const { data: notes = [], isLoading: loadingNotes, error: notesError } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    retry: 1,
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
      <div className="flex items-center justify-center min-h-screen bg-background/50 backdrop-blur-sm">
        <div className="text-center space-y-6 p-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-primary relative" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Carregando seus tesouros...</h3>
            <p className="text-muted-foreground max-w-[250px] mx-auto text-sm">Estamos preparando sua coleção personalizada de versículos e notas.</p>
          </div>
        </div>
      </div>
    );
  }

  const hasError = bookmarksError || highlightsError || notesError;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center space-y-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <Heart className="h-12 w-12 text-destructive opacity-50" />
        </div>
        <h2 className="text-2xl font-bold">Ops! Algo deu errado</h2>
        <p className="text-muted-foreground max-w-md">
          Não conseguimos carregar seus favoritos no momento. Verifique sua conexão.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="container max-w-5xl mx-auto p-4 md:p-8 pb-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm border-primary/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-5 w-5 text-primary fill-current" />
                <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">{t.favorites.title}</h1>
              </div>
              <p className="text-muted-foreground font-medium">
                {t.favorites.subtitle}
              </p>
            </div>
          </div>
          
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
          <div className="flex justify-center mb-8 px-2 overflow-x-auto no-scrollbar">
            <TabsList className="inline-flex h-14 items-center justify-center rounded-full bg-white dark:bg-zinc-900 p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/5 dark:border-white/5 min-w-fit">
              <TabsTrigger 
                value="bookmarks" 
                className="flex items-center gap-2 px-6 h-11 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_4px_14px_0_rgba(107,33,240,0.39)] transition-all duration-300 whitespace-nowrap"
              >
                <BookmarkIcon className="h-4 w-4" />
                <span className="font-bold text-sm">{t.favorites.bookmarks}</span>
                <Badge variant="outline" className="ml-1 px-1.5 h-5 border-current opacity-80 rounded-full bg-transparent">{filteredBookmarks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="highlights" 
                className="flex items-center gap-2 px-6 h-11 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_4px_14px_0_rgba(107,33,240,0.39)] transition-all duration-300 whitespace-nowrap"
              >
                <Highlighter className="h-4 w-4" />
                <span className="font-bold text-sm">{t.favorites.highlights}</span>
                <Badge variant="outline" className="ml-1 px-1.5 h-5 border-current opacity-80 rounded-full bg-transparent">{filteredHighlights.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="flex items-center gap-2 px-6 h-11 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_4px_14px_0_rgba(107,33,240,0.39)] transition-all duration-300 whitespace-nowrap"
              >
                <FileText className="h-4 w-4" />
                <span className="font-bold text-sm">{t.favorites.notes}</span>
                <Badge variant="outline" className="ml-1 px-1.5 h-5 border-current opacity-80 rounded-full bg-transparent">{filteredNotes.length}</Badge>
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
                      <Card key={bookmark.id} className="group relative overflow-hidden border-primary/5 bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/20 hover:shadow-xl transition-all duration-500 rounded-3xl">
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
                            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary hover:text-primary-foreground" onClick={() => setShareData({...shareData, open: true, book: bookmark.book, chapter: bookmark.chapter, verse: bookmark.verse, text: bookmark.verseText, version: bookmark.version || 'nvi'})}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive hover:text-destructive-foreground" onClick={() => deleteBookmarkMutation.mutate(bookmark.id)}>
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
                      <Card key={highlight.id} className={`group relative overflow-hidden border-2 transition-all duration-500 rounded-3xl ${getHighlightCardStyles(highlight.color)} shadow-sm hover:shadow-lg`}>
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
                            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary hover:text-primary-foreground" onClick={() => setShareData({...shareData, open: true, book: highlight.book, chapter: highlight.chapter, verse: highlight.verse, text: highlight.verseText, version: 'nvi'})}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive hover:text-destructive-foreground" onClick={() => deleteHighlightMutation.mutate(highlight.id)}>
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
                      <Card key={note.id} className="group relative overflow-hidden border-primary/5 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-500 rounded-3xl">
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
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all" onClick={() => deleteNoteMutation.mutate(note.id)}>
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
