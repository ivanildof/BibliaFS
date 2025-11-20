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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: posts = [], isLoading, error } = useQuery<(CommunityPost & { user: any })[]>({
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

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("POST", `/api/community/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest("DELETE", `/api/community/posts/${postId}/like`);
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
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando posts...</p>
            </div>
          </div>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700">
                <Users className="h-6 w-6 text-white" />
              </div>
              Comunidade
            </h1>
            <p className="text-lg text-muted-foreground">
              Compartilhe insights e conecte-se com outros
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-post">
                <Plus className="h-5 w-5 mr-2" />
                Publicar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>O que você está estudando?</DialogTitle>
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
                        <FormLabel>Referência do Versículo</FormLabel>
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
                        <FormLabel>Sua Reflexão</FormLabel>
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
                        "Publicar"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">{posts.length}</div>
                <p className="text-sm text-muted-foreground">Publicações</p>
              </div>
              <div>
                <div className="text-3xl font-bold">127</div>
                <p className="text-sm text-muted-foreground">Membros Ativos</p>
              </div>
              <div>
                <div className="text-3xl font-bold">1.2k</div>
                <p className="text-sm text-muted-foreground">Conexões</p>
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
              <Card className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Sugestão da IA</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Conecte-se com outros que estão estudando temas similares:
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Maria Silva</p>
                      <p className="text-xs text-muted-foreground">Estudando Provérbios</p>
                    </div>
                    <Button size="sm" variant="outline">Conectar</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              {posts.map((post) => (
                <Card key={post.id} className="hover-elevate" data-testid={`card-post-${post.id}`}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.user?.profileImageUrl} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {post.user?.firstName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{post.user?.firstName} {post.user?.lastName}</p>
                          <Badge variant="secondary" className="text-xs">
                            {post.user?.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt!), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Verse */}
                    <div className="border-l-4 border-l-primary pl-4 py-2 bg-muted/30 rounded-r">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{post.verseReference}</span>
                      </div>
                      <p className="font-serif text-base leading-relaxed italic">
                        {post.verseText}
                      </p>
                    </div>

                    {/* User's Note */}
                    <p className="text-sm leading-relaxed">{post.note}</p>
                  </CardContent>

                  <Separator />

                  <CardFooter className="pt-4">
                    <div className="flex items-center gap-4 w-full">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1"
                        onClick={() => likeMutation.mutate(post.id)}
                        data-testid={`button-like-post-${post.id}`}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        {post.likeCount || 0}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1"
                        data-testid="button-comment-post"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.commentCount || 0}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-1"
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
              Temas em Alta
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
