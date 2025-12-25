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
  ChevronRight
} from "lucide-react";
import type { Bookmark, Highlight, Note } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShareSheet } from "@/components/ShareSheet";

export default function Favorites() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
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

  const getHighlightCardBg = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-200/40 dark:bg-yellow-900/40 border-yellow-300/50 dark:border-yellow-700/50";
      case "green": return "bg-green-200/40 dark:bg-green-900/40 border-green-300/50 dark:border-green-700/50";
      case "blue": return "bg-blue-200/40 dark:bg-blue-900/40 border-blue-300/50 dark:border-blue-700/50";
      case "purple": return "bg-purple-200/40 dark:bg-purple-900/40 border-purple-300/50 dark:border-purple-700/50";
      case "pink": return "bg-pink-200/40 dark:bg-pink-900/40 border-pink-300/50 dark:border-pink-700/50";
      case "orange": return "bg-orange-200/40 dark:bg-orange-900/40 border-orange-300/50 dark:border-orange-700/50";
      default: return "";
    }
  };

  const getHighlightBadgeBg = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-400 text-yellow-950 hover:bg-yellow-500";
      case "green": return "bg-green-400 text-green-950 hover:bg-green-500";
      case "blue": return "bg-blue-400 text-blue-950 hover:bg-blue-500";
      case "purple": return "bg-purple-400 text-purple-950 hover:bg-purple-500";
      case "pink": return "bg-pink-400 text-pink-950 hover:bg-pink-500";
      case "orange": return "bg-orange-400 text-orange-950 hover:bg-orange-500";
      default: return "";
    }
  };

  if (loadingBookmarks || loadingHighlights || loadingNotes) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{t.favorites.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.favorites.subtitle}
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar em favoritos, destaques ou notas..." 
          className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="bookmarks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 h-12">
          <TabsTrigger value="bookmarks" className="flex items-center gap-2 data-[state=active]:bg-background">
            <BookmarkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.favorites.bookmarks}</span>
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">{filteredBookmarks.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="highlights" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Highlighter className="h-4 w-4" />
            <span className="hidden sm:inline">{t.favorites.highlights}</span>
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">{filteredHighlights.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2 data-[state=active]:bg-background">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t.favorites.notes}</span>
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">{filteredNotes.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="mt-6">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">
                  {search ? "Nenhum favorito encontrado" : `${t.favorites.no_favorites}. ${t.favorites.add_first}!`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredBookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="group overflow-hidden border-none bg-muted/30 hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Link href={`/bible?book=${bookmark.book.toLowerCase()}&chapter=${bookmark.chapter}&verse=${bookmark.verse}&version=${bookmark.version || 'nvi'}`}>
                          <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group/link">
                            <CardTitle className="text-lg font-bold">
                              {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                            </CardTitle>
                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                          </div>
                        </Link>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setShareData({
                              open: true,
                              book: bookmark.book,
                              chapter: bookmark.chapter,
                              verse: bookmark.verse,
                              text: bookmark.verseText,
                              version: bookmark.version || 'nvi'
                            })}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteBookmarkMutation.mutate(bookmark.id)}
                            disabled={deleteBookmarkMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-fit font-mono text-[10px] py-0">{bookmark.version?.toUpperCase() || "NVI"}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="font-serif text-lg leading-relaxed text-foreground/90 italic">"{bookmark.verseText}"</p>
                      {bookmark.note && (
                        <div className="mt-4 p-3 bg-background/50 rounded-lg border border-primary/10">
                          <p className="text-sm text-muted-foreground italic">{bookmark.note}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="highlights" className="mt-6">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {filteredHighlights.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <Highlighter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">
                  {search ? "Nenhum destaque encontrado" : `${t.favorites.no_favorites}. ${t.favorites.add_first}!`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredHighlights.map((highlight) => (
                  <Card key={highlight.id} className={`group overflow-hidden border-2 transition-all ${getHighlightCardBg(highlight.color)}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Link href={`/bible?book=${highlight.book.toLowerCase()}&chapter=${highlight.chapter}&verse=${highlight.verse}`}>
                          <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group/link">
                            <CardTitle className="text-lg font-bold">
                              {highlight.book} {highlight.chapter}:{highlight.verse}
                            </CardTitle>
                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                          </div>
                        </Link>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setShareData({
                              open: true,
                              book: highlight.book,
                              chapter: highlight.chapter,
                              verse: highlight.verse,
                              text: highlight.verseText,
                              version: 'nvi'
                            })}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteHighlightMutation.mutate(highlight.id)}
                            disabled={deleteHighlightMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge className={`w-fit uppercase text-[10px] tracking-wider font-bold ${getHighlightBadgeBg(highlight.color)}`}>
                        {highlight.color}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="font-serif text-lg leading-relaxed text-foreground/90">{highlight.verseText}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-medium">
                  {search ? "Nenhuma nota encontrada" : `${t.favorites.no_favorites}. ${t.favorites.add_first}!`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="group border-none bg-muted/30 hover:bg-muted/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Link href={`/bible?book=${note.book.toLowerCase()}&chapter=${note.chapter}${note.verse ? `&verse=${note.verse}` : ''}`}>
                          <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group/link">
                            <CardTitle className="text-lg font-bold">
                              {note.book} {note.chapter}:{note.verse}
                            </CardTitle>
                            <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                          </div>
                        </Link>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            disabled={deleteNoteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-tight">
                        {new Date(note.createdAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{note.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

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
