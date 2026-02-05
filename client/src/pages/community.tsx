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
  Sparkles,
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
    <div className="min-h-screen bg-[#fcfaff] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100/50 blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-6 sm:py-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">CONEXÕES</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-page-title">
            {t.community.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Compartilhe insights e conecte-se com outros
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-post" className="flex-shrink-0">
                <Plus className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{t.community.post}</span>
                <span className="sm:hidden">Post</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.community.what_studying}</DialogTitle>
                <DialogDescription>
                  Compartilhe um versículo e sua reflexão
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="verseReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.community.verse_reference}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: João 3:16"
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
                        <FormLabel>Texto do Versículo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cole o texto do versículo..."
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
                        <FormLabel>{t.community.your_reflection}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Compartilhe o que você aprendeu ou como esse versículo te tocou..."
                            className="min-h-[120px]"
                            data-testid="textarea-post-note"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                        t.community.post
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Banner */}
        <Card className="mb-8 premium-card border-none rounded-2xl ring-2 ring-primary/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary" data-testid="text-total-posts">{posts.length}</div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Publicações</p>
              </div>
              <div>
                <div className="text-3xl font-bold">127</div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Membros</p>
              </div>
              <div>
                <div className="text-3xl font-bold">1.2k</div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Conexões</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              {/* AI Suggestion Card */}
              <Card className="premium-card border-none rounded-2xl ring-2 ring-slate-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-slate-600" />
                    <h3 className="font-bold text-sm">Sugestão da IA</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4 font-medium">
                    Conecte-se com outros que estão estudando temas similares:
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarFallback className="bg-slate-600 text-white font-bold">MS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">Maria Silva</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Estudando Provérbios</p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full px-4 h-8 text-xs font-bold">Conectar</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              {posts.map((post) => (
                <Card key={post.id} className="border-0 glass rounded-2xl hover-elevate overflow-hidden" data-testid={`card-post-${post.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={post.user?.profileImageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-800 to-slate-800 text-white font-bold">
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

        {/* Trending Topics */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t.community.trending_topics}
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Fé e Obras", "Jejum Bíblico", "Perdão", "Oração Eficaz"].map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded hover-elevate cursor-pointer"
                >
                  <span className="text-sm">{topic}</span>
                  <Badge variant="secondary">
                    {Math.floor(Math.random() * 50) + 10} posts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
