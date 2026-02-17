import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Plus, 
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { insertCommunityPostSchema, type CommunityPost } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Form schema
const formSchema = insertCommunityPostSchema.extend({
  verseReference: z.string().min(1, "Digite a referência do versículo"),
  verseText: z.string().min(5, "Digite o texto do versículo"),
  note: z.string().min(10, "A reflexão deve ter pelo menos 10 caracteres"),
}).omit({ userId: true });

type FormData = z.infer<typeof formSchema>;

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: posts = [], isLoading, error } = useQuery<(CommunityPost & { user: any; isLikedByCurrentUser?: boolean })[]>({
    queryKey: ["/api/community/posts"],
    retry: 2,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verseReference: "",
      verseText: "",
      note: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/community/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Publicado com sucesso!",
        description: "Seu post foi compartilhado com a comunidade.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao publicar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (isLiked) {
        return await apiRequest("DELETE", `/api/community/posts/${postId}/like`);
      } else {
        return await apiRequest("POST", `/api/community/posts/${postId}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando posts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <Users className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Erro ao carregar posts</h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar os posts da comunidade. Tente novamente.
              </p>
              <Button onClick={() => window.location.reload()} data-testid="button-retry">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
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
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-6 sm:py-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <BookOpen className="h-5 w-5 text-primary" />
            <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">ESTUDO BÍBLICO</p>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground" data-testid="text-page-title">
            Comunidade Bíblica
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Espaço exclusivo para compartilhar reflexões, versículos e aprendizados da Palavra de Deus. Todas as publicações são públicas e visíveis para todos os usuários do aplicativo.
          </p>
        </div>

        <Card className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 px-4 space-y-3">
            <p className="text-xs text-center font-semibold text-foreground">Regras da Comunidade Bíblica</p>
            <div className="text-[11px] text-muted-foreground space-y-2">
              <p>1. Este espaço é dedicado <span className="font-semibold text-foreground">exclusivamente</span> ao estudo da Bíblia Sagrada. Publique apenas versículos, reflexões e aprendizados bíblicos.</p>
              <p>2. Conteúdos que não estejam de acordo com os princípios bíblicos, incluindo linguagem ofensiva, discurso de ódio, spam ou qualquer material não relacionado às Escrituras, serão removidos imediatamente.</p>
              <p>3. <span className="font-semibold text-destructive">Usuários que publicarem conteúdo impróprio ou em desacordo com as regras terão suas contas permanentemente excluídas</span>, conforme previsto nos Termos de Uso da plataforma e em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei n.º 13.709/2018) e o Marco Civil da Internet (Lei n.º 12.965/2014, Art. 19).</p>
              <p>4. Todas as publicações são públicas e visíveis para todos os usuários do BíbliaFS. Ao publicar, você concorda com estas regras.</p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center mb-6">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-post" className="flex-shrink-0">
                <Plus className="h-4 w-4 mr-1.5" />
                Compartilhar Estudo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartilhar Estudo Bíblico</DialogTitle>
                <DialogDescription>
                  Compartilhe um versículo da Bíblia e sua reflexão com a comunidade. Somente conteúdo bíblico é permitido.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="verseReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referência Bíblica *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: João 3:16, Salmos 23:1, Romanos 8:28"
                            data-testid="input-verse-reference"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="verseText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Versículo *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cole aqui o texto exato do versículo bíblico..."
                            className="min-h-[100px] font-serif"
                            data-testid="textarea-verse-text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sua Reflexão Bíblica *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="O que Deus falou ao seu coração através deste versículo? Compartilhe sua reflexão..."
                            className="min-h-[120px]"
                            data-testid="textarea-post-note"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <p className="text-[10px] text-muted-foreground text-center">
                    Ao publicar, você confirma que o conteúdo está relacionado ao estudo da Bíblia Sagrada.
                  </p>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel-post"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      data-testid="button-publish-post"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        "Publicar Estudo"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {posts.length > 0 && (
          <Card className="mb-8 rounded-xl border">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary" data-testid="text-total-posts">{posts.length}</div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Publicações</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" data-testid="text-total-members">{new Set(posts.map(p => p.userId)).size}</div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Participantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Nenhuma publicação ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Seja o primeiro a compartilhar um estudo
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Publicação
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Posts */}
              {posts.map((post) => (
                <Card key={post.id} className="border-0 glass rounded-2xl hover-elevate overflow-hidden" data-testid={`card-post-${post.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={post.user?.profileImageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-800 to-foreground text-white font-bold">
                          {post.user?.firstName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm truncate">{post.user?.firstName} {post.user?.lastName}</p>
                          <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0 h-4 bg-primary/10 text-primary border-0">
                            {post.user?.level}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {formatDistanceToNow(new Date(post.createdAt!), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2">
                    {/* Verse */}
                    <div className="relative overflow-hidden p-4 bg-muted/30 rounded-2xl">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40" />
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <span className="font-bold text-xs text-primary">{post.verseReference}</span>
                      </div>
                      <p className="font-serif text-base sm:text-lg leading-relaxed italic text-foreground/90">
                        "{post.verseText}"
                      </p>
                    </div>

                    {/* User's Note */}
                    <p className="text-sm leading-relaxed text-foreground/80 font-medium">{post.note}</p>
                  </CardContent>

                  <Separator className="opacity-50" />

                  <CardFooter className="py-2 px-2">
                    <div className="flex items-center gap-1 w-full">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1 rounded-xl h-9 font-bold text-xs"
                        onClick={() => toggleLikeMutation.mutate({ 
                          postId: post.id, 
                          isLiked: post.isLikedByCurrentUser || false 
                        })}
                        disabled={toggleLikeMutation.isPending}
                        data-testid={`button-like-post-${post.id}`}
                      >
                        <Heart 
                          className={`h-4 w-4 mr-2 ${post.isLikedByCurrentUser ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} 
                        />
                        {post.likeCount || 0}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1 rounded-xl h-9 font-bold text-xs text-muted-foreground"
                        data-testid="button-comment-post"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.commentCount || 0}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1 rounded-xl h-9 font-bold text-xs text-muted-foreground"
                        data-testid="button-share-post"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </>
          )}
        </div>

        {posts.length > 0 && (() => {
          const verseCounts: Record<string, number> = {};
          posts.forEach(p => {
            if (p.verseReference) {
              const book = p.verseReference.split(/\s*\d/)[0].trim();
              if (book) verseCounts[book] = (verseCounts[book] || 0) + 1;
            }
          });
          const sortedBooks = Object.entries(verseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
          if (sortedBooks.length === 0) return null;
          return (
            <Card className="mt-6 rounded-xl border">
              <CardHeader>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Livros Mais Estudados
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {sortedBooks.map(([book, count], index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg hover-elevate"
                    >
                      <span className="text-sm">{book}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {count} {count === 1 ? 'post' : 'posts'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </div>
    </div>
  );
}
