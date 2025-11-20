import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookmarkIcon, Highlighter, FileText } from "lucide-react";
import type { Bookmark, Highlight, Note } from "@shared/schema";

export default function Favorites() {
  const { data: bookmarks = [], isLoading: loadingBookmarks } = useQuery<Bookmark[]>({
    queryKey: ["/api/bible/bookmarks"],
  });

  const { data: highlights = [], isLoading: loadingHighlights } = useQuery<Highlight[]>({
    queryKey: ["/api/bible/highlights"],
  });

  const { data: notes = [], isLoading: loadingNotes } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const getHighlightCardBg = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-200/30 dark:bg-yellow-900/30";
      case "green": return "bg-green-200/30 dark:bg-green-900/30";
      case "blue": return "bg-blue-200/30 dark:bg-blue-900/30";
      case "purple": return "bg-purple-200/30 dark:bg-purple-900/30";
      case "pink": return "bg-pink-200/30 dark:bg-pink-900/30";
      case "orange": return "bg-orange-200/30 dark:bg-orange-900/30";
      default: return "";
    }
  };

  const getHighlightBadgeBg = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-200 dark:bg-yellow-900";
      case "green": return "bg-green-200 dark:bg-green-900";
      case "blue": return "bg-blue-200 dark:bg-blue-900";
      case "purple": return "bg-purple-200 dark:bg-purple-900";
      case "pink": return "bg-pink-200 dark:bg-pink-900";
      case "orange": return "bg-orange-200 dark:bg-orange-900";
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
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Meus Favoritos</h1>
        <p className="text-muted-foreground">
          Seus versículos salvos, destaques e notas
        </p>
      </div>

      <Tabs defaultValue="bookmarks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <BookmarkIcon className="h-4 w-4" />
            Favoritos ({bookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="highlights" className="flex items-center gap-2">
            <Highlighter className="h-4 w-4" />
            Destaques ({highlights.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notas ({notes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="mt-6">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {bookmarks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum favorito ainda. Adicione seus versículos favoritos no leitor da Bíblia!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="hover-elevate">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                        </CardTitle>
                        <Badge variant="outline">{bookmark.version?.toUpperCase() || "NVI"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-serif text-base leading-relaxed">{bookmark.verseText}</p>
                      {bookmark.note && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">{bookmark.note}</p>
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
          <ScrollArea className="h-[calc(100vh-300px)]">
            {highlights.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum destaque ainda. Clique em versículos na Bíblia para destacá-los!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {highlights.map((highlight) => (
                  <Card key={highlight.id} className={`hover-elevate ${getHighlightCardBg(highlight.color)}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {highlight.book} {highlight.chapter}:{highlight.verse}
                        </CardTitle>
                        <Badge className={getHighlightBadgeBg(highlight.color)}>
                          {highlight.color}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-serif text-base leading-relaxed">{highlight.verseText}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {notes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhuma nota ainda. Adicione notas aos versículos no leitor da Bíblia!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {notes.map((note) => (
                  <Card key={note.id} className="hover-elevate">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {note.book} {note.chapter}:{note.verse}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(note.createdAt!).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
