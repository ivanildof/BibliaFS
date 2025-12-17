import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Headphones, 
  Search, 
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  MoreVertical,
  Download,
  Check,
  WifiOff
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getAuthHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { podcastStorage } from "@/lib/offline/podcastStorage";
import type { Podcast } from "@shared/schema";

const BIBLE_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
  "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras",
  "Neemias", "Ester", "Jó", "Salmos", "Provérbios",
  "Eclesiastes", "Cantares", "Isaías", "Jeremias", "Lamentações",
  "Ezequiel", "Daniel", "Oséias", "Joel", "Amós",
  "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque",
  "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios",
  "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses",
  "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus",
  "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João",
  "Judas", "Apocalipse"
];

interface Episode {
  id: string;
  title: string;
  description: string;
  audioData: string;
  duration: number;
  publishedAt: string;
  chapterNumber?: number;
  bookAbbrev?: string;
}

export default function Podcasts() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  // Reserve space for fixed player bar
  const playerBarHeight = "pb-24";

  // Create podcast dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPodcastTitle, setNewPodcastTitle] = useState("");
  const [newPodcastDescription, setNewPodcastDescription] = useState("");
  const [newPodcastBook, setNewPodcastBook] = useState("");

  // Edit/Delete podcast state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Offline download state
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<Set<string>>(new Set());
  const [downloadingEpisodes, setDownloadingEpisodes] = useState<Set<string>>(new Set());

  // Load downloaded episodes on mount
  useEffect(() => {
    async function loadDownloaded() {
      try {
        const episodes = await podcastStorage.getAllEpisodes();
        setDownloadedEpisodes(new Set(episodes.map(e => e.id)));
      } catch (error) {
        console.error("Error loading downloaded episodes:", error);
      }
    }
    loadDownloaded();
  }, []);

  const downloadEpisode = async (episode: Episode, podcast: Podcast) => {
    if (downloadingEpisodes.has(episode.id) || downloadedEpisodes.has(episode.id)) return;

    setDownloadingEpisodes(prev => new Set(prev).add(episode.id));
    
    try {
      // First, generate the audio if needed
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/bible/audio?book=${episode.bookAbbrev}&chapter=${episode.chapterNumber}`, {
        headers: authHeaders,
      });
      
      if (!response.ok) throw new Error("Failed to fetch audio");
      
      const data = await response.json();
      const audioUrl = data.audioUrl;
      
      // Fetch the actual audio data
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      
      // Save to IndexedDB
      await podcastStorage.saveEpisode({
        id: episode.id,
        podcastId: podcast.id,
        title: episode.title,
        audioData: audioBlob,
        downloadedAt: Date.now(),
        size: audioBlob.size,
      });
      
      setDownloadedEpisodes(prev => new Set(prev).add(episode.id));
      toast({
        title: "Episódio baixado!",
        description: `"${episode.title}" disponível offline`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao baixar",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setDownloadingEpisodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(episode.id);
        return newSet;
      });
    }
  };

  const { data: podcasts = [] } = useQuery<Podcast[]>({
    queryKey: ["/api/podcasts"],
  });

  const { data: subscriptions = [] } = useQuery<any[]>({
    queryKey: ["/api/podcasts/subscriptions"],
  });

  const { data: myPodcasts = [] } = useQuery<Podcast[]>({
    queryKey: ["/api/podcasts/my"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (podcastId: string) => {
      return apiRequest("POST", "/api/podcasts/subscribe", { podcastId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/subscriptions"] });
      toast({ title: "Inscrito!", description: "Você se inscreveu no podcast" });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (podcastId: string) => {
      return apiRequest("DELETE", `/api/podcasts/subscribe/${podcastId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/subscriptions"] });
      toast({ title: "Desinscrito", description: "Você se desinscreveu do podcast" });
    },
  });

  const createPodcastMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; bibleBook?: string; bibleChapter?: number }) => {
      return apiRequest("POST", "/api/podcasts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/my"] });
      toast({ title: "Podcast criado!", description: "Seu podcast foi criado com sucesso" });
      setCreateDialogOpen(false);
      resetCreateForm();
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível criar o podcast", variant: "destructive" });
    },
  });

  const updatePodcastMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; description?: string } }) => {
      return apiRequest("PATCH", `/api/podcasts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/my"] });
      toast({ title: "Podcast atualizado!", description: "As alterações foram salvas" });
      setEditDialogOpen(false);
      setSelectedPodcast(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível atualizar o podcast", variant: "destructive" });
    },
  });

  const deletePodcastMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/podcasts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/my"] });
      toast({ title: "Podcast excluído", description: "O podcast foi removido" });
      setDeleteDialogOpen(false);
      setSelectedPodcast(null);
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível excluir o podcast", variant: "destructive" });
    },
  });

  const openEditDialog = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setEditTitle(podcast.title);
    setEditDescription(podcast.description || "");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setDeleteDialogOpen(true);
  };

  const handleUpdatePodcast = () => {
    if (!selectedPodcast || !editTitle.trim()) return;
    updatePodcastMutation.mutate({
      id: selectedPodcast.id,
      data: { title: editTitle.trim(), description: editDescription.trim() },
    });
  };

  const handleDeletePodcast = () => {
    if (!selectedPodcast) return;
    deletePodcastMutation.mutate(selectedPodcast.id);
  };

  const resetCreateForm = () => {
    setNewPodcastTitle("");
    setNewPodcastDescription("");
    setNewPodcastBook("");
  };

  // Audio player controls
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentEpisode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const playEpisode = async (episode: Episode, podcast: Podcast) => {
    setCurrentEpisode(episode);
    setCurrentPodcast(podcast);
    
    // If episode has pre-recorded audio, use it
    if (episode.audioData) {
      if (audioRef.current) {
        audioRef.current.src = episode.audioData;
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
      return;
    }
    
    // Generate audio via TTS using the chapter info
    if (episode.bookAbbrev && episode.chapterNumber) {
      setIsLoadingAudio(true);
      toast({ 
        title: "Gerando áudio...", 
        description: "O áudio está sendo gerado. Isso pode levar alguns segundos." 
      });
      
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(
          `/api/bible/audio/pt/nvi/${episode.bookAbbrev}/${episode.chapterNumber}`,
          { 
            credentials: 'include',
            headers: authHeaders
          }
        );
        
        if (response.ok) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(() => {
              toast({ 
                title: "Erro ao reproduzir", 
                description: "Não foi possível reproduzir o áudio",
                variant: "destructive"
              });
              setIsPlaying(false);
            });
            setIsPlaying(true);
          }
        } else {
          toast({ 
            title: "Áudio não disponível", 
            description: "Não foi possível gerar o áudio neste momento",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({ 
          title: "Erro de conexão", 
          description: "Verifique sua conexão e tente novamente",
          variant: "destructive"
        });
      } finally {
        setIsLoadingAudio(false);
      }
    } else {
      toast({ 
        title: "Áudio não disponível", 
        description: "Este episódio não tem informações do capítulo" 
      });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentEpisode) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleCreatePodcast = () => {
    if (!newPodcastBook) {
      toast({ title: "Erro", description: "Selecione um livro da Bíblia", variant: "destructive" });
      return;
    }
    const title = newPodcastTitle.trim() || `Leitura de ${newPodcastBook}`;
    createPodcastMutation.mutate({
      title,
      description: newPodcastDescription,
      bibleBook: newPodcastBook,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <audio ref={audioRef} className="hidden" />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2" data-testid="text-page-title">
              BíbliaFS Rádio
            </h1>
            <p className="text-lg text-muted-foreground">
              Podcasts cristãos integrados ao seu estudo
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-podcast">
                <Plus className="h-4 w-4 mr-2" />
                Criar Podcast
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Podcast</DialogTitle>
                <DialogDescription>
                  Escolha um livro da Bíblia e o sistema gerará automaticamente os episódios para cada capítulo com áudio narrado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Livro da Bíblia *</Label>
                  <Select value={newPodcastBook} onValueChange={setNewPodcastBook}>
                    <SelectTrigger data-testid="select-bible-book">
                      <SelectValue placeholder="Selecione um livro..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_BOOKS.map(book => (
                        <SelectItem key={book} value={book}>{book}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="podcast-title">Título do Podcast</Label>
                  <Input 
                    id="podcast-title" 
                    placeholder={newPodcastBook ? `Leitura de ${newPodcastBook}` : "Ex: Leitura de Romanos"}
                    value={newPodcastTitle}
                    onChange={(e) => setNewPodcastTitle(e.target.value)}
                    data-testid="input-podcast-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="podcast-description">Descrição (opcional)</Label>
                  <Textarea 
                    id="podcast-description" 
                    placeholder="Descrição será gerada automaticamente se não preenchida"
                    value={newPodcastDescription}
                    onChange={(e) => setNewPodcastDescription(e.target.value)}
                    data-testid="input-podcast-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreatePodcast}
                  disabled={createPodcastMutation.isPending || !newPodcastBook}
                  data-testid="button-confirm-create"
                >
                  {createPodcastMutation.isPending ? "Gerando episódios..." : "Criar Podcast"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar podcasts ou episódios..." 
              className="pl-10 h-12"
              data-testid="input-search-podcasts"
            />
          </div>
        </div>

        <Tabs defaultValue="discover" className="space-y-8">
          <TabsList>
            <TabsTrigger value="discover" data-testid="tab-discover">Descobrir</TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
              Inscrições ({subscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="my-podcasts" data-testid="tab-my-podcasts">
              Meus Podcasts ({myPodcasts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold mb-4">Podcasts Disponíveis</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {podcasts.map((podcast: any, index: number) => {
                  const isSubscribed = subscriptions.some((s: any) => s.podcastId === podcast.id);
                  const episodes: Episode[] = podcast.episodes || [];
                  
                  return (
                    <Card key={podcast.id} className="hover-elevate" data-testid={`card-podcast-${index}`}>
                      <div 
                        className="h-48 bg-cover bg-center flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5" 
                        style={{ backgroundImage: podcast.imageUrl ? `url(${podcast.imageUrl})` : undefined }}
                      >
                        {!podcast.imageUrl && <Headphones className="h-16 w-16 text-primary" />}
                      </div>
                      <CardHeader>
                        <CardTitle className="truncate">{podcast.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {podcast.description || 'Sem descrição'}
                        </CardDescription>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{episodes.length} episódios</span>
                          <span>•</span>
                          <span>{podcast.category || 'Geral'}</span>
                          {podcast.bibleBook && (
                            <>
                              <span>•</span>
                              <span>{podcast.bibleBook}{podcast.bibleChapter ? ` ${podcast.bibleChapter}` : ''}</span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {episodes.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {episodes.slice(0, 2).map((ep: Episode) => (
                              <div 
                                key={ep.id} 
                                className="flex items-center justify-between p-2 rounded-lg bg-muted hover-elevate cursor-pointer"
                                onClick={() => playEpisode(ep, podcast)}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{ep.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatTime(ep.duration)}
                                    {downloadedEpisodes.has(ep.id) && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        <WifiOff className="h-2 w-2 mr-1" />
                                        Offline
                                      </Badge>
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadEpisode(ep, podcast);
                                    }}
                                    disabled={downloadingEpisodes.has(ep.id) || downloadedEpisodes.has(ep.id)}
                                    data-testid={`button-download-${ep.id}`}
                                  >
                                    {downloadingEpisodes.has(ep.id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : downloadedEpisodes.has(ep.id) ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button size="icon" variant="ghost" data-testid={`button-play-${ep.id}`}>
                                    <Play className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant={isSubscribed ? "default" : "outline"} 
                          className="w-full" 
                          data-testid={`button-subscribe-${index}`}
                          onClick={() => {
                            if (isSubscribed) {
                              unsubscribeMutation.mutate(podcast.id);
                            } else {
                              subscribeMutation.mutate(podcast.id);
                            }
                          }}
                          disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {isSubscribed ? "Inscrito" : "Inscrever-se"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="subscriptions">
            {subscriptions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Headphones className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhuma inscrição</h3>
                  <p className="text-muted-foreground mb-4">
                    Inscreva-se em podcasts para acompanhar novos episódios
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {subscriptions.map((sub: any, index: number) => {
                  const episodes: Episode[] = sub.podcast.episodes || [];
                  return (
                    <Card key={index} className="hover-elevate">
                      <CardHeader>
                        <CardTitle>{sub.podcast.title}</CardTitle>
                        <CardDescription>{episodes.length} episódios disponíveis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {episodes.map((ep: Episode) => (
                            <div 
                              key={ep.id} 
                              className="flex items-center justify-between p-3 rounded-lg bg-muted hover-elevate cursor-pointer"
                              onClick={() => playEpisode(ep, sub.podcast)}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{ep.title}</p>
                                <p className="text-xs text-muted-foreground">{formatTime(ep.duration)}</p>
                              </div>
                              <Button size="icon" variant="ghost" data-testid={`button-play-sub-${ep.id}`}>
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-podcasts">
            {myPodcasts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Headphones className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhum podcast criado</h3>
                  <p className="text-muted-foreground mb-4">
                    Escolha um livro da Bíblia e o sistema gerará episódios automaticamente
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Podcast
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {myPodcasts.map((podcast: any) => {
                  const episodes: Episode[] = podcast.episodes || [];
                  return (
                    <Card key={podcast.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="truncate">{podcast.title}</CardTitle>
                            {podcast.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {podcast.description}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" data-testid={`button-podcast-menu-${podcast.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(podcast)} data-testid="menu-edit-podcast">
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(podcast)} 
                                className="text-destructive focus:text-destructive"
                                data-testid="menu-delete-podcast"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          {podcast.bibleBook && (
                            <Badge variant="secondary">{podcast.bibleBook}</Badge>
                          )}
                          <span>{episodes.length} capítulos</span>
                          <span>•</span>
                          <span>Gerado automaticamente</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {episodes.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Gerando episódios...
                          </p>
                        ) : (
                          <div className="grid gap-2 max-h-64 overflow-y-auto">
                            {episodes.slice(0, 10).map((ep: Episode) => (
                              <div 
                                key={ep.id} 
                                className="flex items-center justify-between p-3 rounded-lg bg-muted hover-elevate cursor-pointer"
                                onClick={() => playEpisode(ep, podcast)}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{ep.title}</p>
                                  <p className="text-xs text-muted-foreground">Áudio narrado</p>
                                </div>
                                <Button size="icon" variant="ghost">
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {episodes.length > 10 && (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                +{episodes.length - 10} capítulos
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Podcast Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Podcast</DialogTitle>
            <DialogDescription>
              Altere o título ou a descrição do seu podcast
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input 
                id="edit-title" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                data-testid="input-edit-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea 
                id="edit-description" 
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                data-testid="input-edit-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdatePodcast}
              disabled={updatePodcastMutation.isPending || !editTitle.trim()}
              data-testid="button-save-edit"
            >
              {updatePodcastMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir podcast?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{selectedPodcast?.title}"? Esta ação não pode ser desfeita e todos os episódios serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePodcast}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deletePodcastMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fixed Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="max-w-7xl mx-auto p-2 md:p-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Headphones className="h-8 w-8 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {currentEpisode?.title || "Selecione um episódio"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {currentPodcast?.title || "Nenhum podcast selecionado"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => skip(-15)} data-testid="button-skip-back">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                className="h-12 w-12"
                onClick={togglePlay}
                disabled={!currentEpisode || isLoadingAudio}
                data-testid="button-play-pause"
              >
                {isLoadingAudio ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => skip(30)} data-testid="button-skip-forward">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-3 flex-1">
              <span className="text-xs text-muted-foreground min-w-[40px]">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                className="flex-1"
                onValueChange={([value]) => seekTo(value)}
                disabled={!currentEpisode}
              />
              <span className="text-xs text-muted-foreground min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 w-32">
              <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={([value]) => setVolume(value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
