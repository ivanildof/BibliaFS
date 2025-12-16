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
  Download,
  Clock,
  Calendar,
  Plus,
  Mic,
  Square,
  Upload
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
}

export default function Podcasts() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Create podcast dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPodcastTitle, setNewPodcastTitle] = useState("");
  const [newPodcastDescription, setNewPodcastDescription] = useState("");
  const [newPodcastBook, setNewPodcastBook] = useState("");
  const [newPodcastChapter, setNewPodcastChapter] = useState("");
  
  // Episode recording state
  const [addEpisodeDialogOpen, setAddEpisodeDialogOpen] = useState(false);
  const [selectedPodcastForEpisode, setSelectedPodcastForEpisode] = useState<Podcast | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeDescription, setEpisodeDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const addEpisodeMutation = useMutation({
    mutationFn: async ({ podcastId, data }: { podcastId: string; data: any }) => {
      return apiRequest("POST", `/api/podcasts/${podcastId}/episodes`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/my"] });
      toast({ title: "Episódio adicionado!", description: "Seu episódio foi publicado" });
      setAddEpisodeDialogOpen(false);
      resetEpisodeForm();
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível adicionar o episódio", variant: "destructive" });
    },
  });

  const resetCreateForm = () => {
    setNewPodcastTitle("");
    setNewPodcastDescription("");
    setNewPodcastBook("");
    setNewPodcastChapter("");
  };

  const resetEpisodeForm = () => {
    setEpisodeTitle("");
    setEpisodeDescription("");
    setRecordedAudio("");
    setRecordingTime(0);
    setSelectedPodcastForEpisode(null);
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

  const playEpisode = (episode: Episode, podcast: Podcast) => {
    setCurrentEpisode(episode);
    setCurrentPodcast(podcast);
    setIsPlaying(true);
    
    setTimeout(() => {
      if (audioRef.current && episode.audioData) {
        audioRef.current.src = episode.audioData;
        audioRef.current.play().catch(() => {
          toast({ 
            title: "Áudio não disponível", 
            description: "Este episódio ainda não tem áudio gravado",
            variant: "destructive"
          });
          setIsPlaying(false);
        });
      } else {
        toast({ 
          title: "Áudio não disponível", 
          description: "Este episódio ainda não tem áudio gravado" 
        });
        setIsPlaying(false);
      }
    }, 100);
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

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedAudio(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível acessar o microfone", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleCreatePodcast = () => {
    if (!newPodcastTitle.trim()) {
      toast({ title: "Erro", description: "Digite um título para o podcast", variant: "destructive" });
      return;
    }
    createPodcastMutation.mutate({
      title: newPodcastTitle,
      description: newPodcastDescription,
      bibleBook: newPodcastBook || undefined,
      bibleChapter: newPodcastChapter ? parseInt(newPodcastChapter) : undefined,
    });
  };

  const handleAddEpisode = () => {
    if (!selectedPodcastForEpisode || !episodeTitle.trim()) {
      toast({ title: "Erro", description: "Preencha o título do episódio", variant: "destructive" });
      return;
    }
    addEpisodeMutation.mutate({
      podcastId: selectedPodcastForEpisode.id,
      data: {
        title: episodeTitle,
        description: episodeDescription,
        audioData: recordedAudio,
        duration: recordingTime,
      },
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
                  Crie seu próprio podcast sobre um livro ou capítulo da Bíblia
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="podcast-title">Título do Podcast</Label>
                  <Input 
                    id="podcast-title" 
                    placeholder="Ex: Estudos em Romanos"
                    value={newPodcastTitle}
                    onChange={(e) => setNewPodcastTitle(e.target.value)}
                    data-testid="input-podcast-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="podcast-description">Descrição</Label>
                  <Textarea 
                    id="podcast-description" 
                    placeholder="Descreva seu podcast..."
                    value={newPodcastDescription}
                    onChange={(e) => setNewPodcastDescription(e.target.value)}
                    data-testid="input-podcast-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Livro da Bíblia (opcional)</Label>
                    <Select value={newPodcastBook} onValueChange={setNewPodcastBook}>
                      <SelectTrigger data-testid="select-bible-book">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {BIBLE_BOOKS.map(book => (
                          <SelectItem key={book} value={book}>{book}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="podcast-chapter">Capítulo (opcional)</Label>
                    <Input 
                      id="podcast-chapter" 
                      type="number" 
                      placeholder="1"
                      value={newPodcastChapter}
                      onChange={(e) => setNewPodcastChapter(e.target.value)}
                      data-testid="input-podcast-chapter"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreatePodcast}
                  disabled={createPodcastMutation.isPending}
                  data-testid="button-confirm-create"
                >
                  {createPodcastMutation.isPending ? "Criando..." : "Criar Podcast"}
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
                        <CardDescription className="truncate">
                          {episodes.length} episódios • {podcast.category || 'Geral'}
                        </CardDescription>
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
                                  <p className="text-xs text-muted-foreground">{formatTime(ep.duration)}</p>
                                </div>
                                <Button size="icon" variant="ghost" data-testid={`button-play-${ep.id}`}>
                                  <Play className="h-4 w-4" />
                                </Button>
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
                    <Mic className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhum podcast criado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu próprio podcast sobre livros e capítulos da Bíblia
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
                      <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                          <CardTitle>{podcast.title}</CardTitle>
                          <CardDescription>
                            {podcast.bibleBook && `${podcast.bibleBook}${podcast.bibleChapter ? ` ${podcast.bibleChapter}` : ''} • `}
                            {episodes.length} episódios
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setSelectedPodcastForEpisode(podcast);
                            setAddEpisodeDialogOpen(true);
                          }}
                          data-testid={`button-add-episode-${podcast.id}`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Episódio
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {episodes.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum episódio ainda. Grave seu primeiro!
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {episodes.map((ep: Episode) => (
                              <div 
                                key={ep.id} 
                                className="flex items-center justify-between p-3 rounded-lg bg-muted hover-elevate cursor-pointer"
                                onClick={() => playEpisode(ep, podcast)}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{ep.title}</p>
                                  <p className="text-xs text-muted-foreground">{formatTime(ep.duration)}</p>
                                </div>
                                <Button size="icon" variant="ghost">
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
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

      {/* Add Episode Dialog */}
      <Dialog open={addEpisodeDialogOpen} onOpenChange={(open) => {
        setAddEpisodeDialogOpen(open);
        if (!open) {
          stopRecording();
          resetEpisodeForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Episódio</DialogTitle>
            <DialogDescription>
              Grave um novo episódio para {selectedPodcastForEpisode?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="episode-title">Título do Episódio</Label>
              <Input 
                id="episode-title" 
                placeholder="Ex: Introdução ao Capítulo 1"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                data-testid="input-episode-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="episode-description">Descrição</Label>
              <Textarea 
                id="episode-description" 
                placeholder="Descreva o episódio..."
                value={episodeDescription}
                onChange={(e) => setEpisodeDescription(e.target.value)}
                data-testid="input-episode-description"
              />
            </div>
            <div className="space-y-2">
              <Label>Gravação de Áudio</Label>
              <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-muted/50">
                {isRecording ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse flex items-center justify-center">
                      <Mic className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-2xl font-mono">{formatTime(recordingTime)}</p>
                    <Button variant="destructive" onClick={stopRecording} data-testid="button-stop-recording">
                      <Square className="h-4 w-4 mr-2" />
                      Parar Gravação
                    </Button>
                  </>
                ) : recordedAudio ? (
                  <>
                    <audio src={recordedAudio} controls className="w-full" />
                    <p className="text-sm text-muted-foreground">Duração: {formatTime(recordingTime)}</p>
                    <Button variant="outline" onClick={() => { setRecordedAudio(""); setRecordingTime(0); }}>
                      Gravar Novamente
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Máximo 5 minutos de gravação
                    </p>
                    <Button onClick={startRecording} data-testid="button-start-recording">
                      <Mic className="h-4 w-4 mr-2" />
                      Iniciar Gravação
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEpisodeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddEpisode}
              disabled={addEpisodeMutation.isPending || !episodeTitle.trim()}
              data-testid="button-confirm-episode"
            >
              {addEpisodeMutation.isPending ? "Salvando..." : "Publicar Episódio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fixed Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="max-w-7xl mx-auto p-4">
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
                disabled={!currentEpisode}
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
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
