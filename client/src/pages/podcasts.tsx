import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  WifiOff,
  Radio,
  Library,
  Bookmark,
  Users,
  LayoutGrid,
  List,
  CheckSquare,
  X
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
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPodcastTitle, setNewPodcastTitle] = useState("");
  const [newPodcastDescription, setNewPodcastDescription] = useState("");
  const [newPodcastBook, setNewPodcastBook] = useState("");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [downloadedEpisodes, setDownloadedEpisodes] = useState<Set<string>>(new Set());
  const [downloadingEpisodes, setDownloadingEpisodes] = useState<Set<string>>(new Set());
  
  // View mode and selection
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPodcasts, setSelectedPodcasts] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

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
      const authHeaders = await getAuthHeaders();
      const response = await fetch(`/api/bible/audio?book=${episode.bookAbbrev}&chapter=${episode.chapterNumber}`, {
        headers: authHeaders,
      });
      if (!response.ok) throw new Error("Failed to fetch audio");
      const data = await response.json();
      const audioUrl = data.audioUrl;
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      await podcastStorage.saveEpisode({
        id: episode.id,
        podcastId: podcast.id,
        title: episode.title,
        audioData: audioBlob,
        downloadedAt: Date.now(),
        size: audioBlob.size,
      });
      setDownloadedEpisodes(prev => new Set(prev).add(episode.id));
      toast({ title: "Episódio baixado!", description: `"${episode.title}" disponível offline` });
    } catch (error: any) {
      toast({ title: "Erro ao baixar", description: error.message || "Tente novamente mais tarde", variant: "destructive" });
    } finally {
      setDownloadingEpisodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(episode.id);
        return newSet;
      });
    }
  };

  const [selectedTab, setSelectedTab] = useState("discover");

  const { data: podcasts = [] } = useQuery<Podcast[]>({ queryKey: ["/api/podcasts"] });
  const { data: subscriptions = [] } = useQuery<any[]>({ queryKey: ["/api/podcasts/subscriptions"] });
  const { data: myPodcasts = [] } = useQuery<Podcast[]>({ queryKey: ["/api/podcasts/my"] });

  const subscribeMutation = useMutation({
    mutationFn: async (podcastId: string) => {
      return apiRequest("POST", `/api/podcasts/${podcastId}/subscribe`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/subscriptions"] });
      toast({ title: "Inscrito!", description: "Você agora segue este podcast" });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (podcastId: string) => {
      return apiRequest("DELETE", `/api/podcasts/${podcastId}/subscribe`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/subscriptions"] });
      toast({ title: "Inscrição removida", description: "Você não segue mais este podcast" });
    },
  });

  const deletePodcastMutation = useMutation({
    mutationFn: async (podcastId: string) => {
      return apiRequest("DELETE", `/api/podcasts/${podcastId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/my"] });
      toast({ title: "Podcast excluído" });
      setDeleteDialogOpen(false);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (podcastIds: string[]) => {
      const results = await Promise.all(
        podcastIds.map(id => apiRequest("DELETE", `/api/podcasts/${id}`))
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts/my"] });
      toast({ title: "Podcasts excluídos", description: `${selectedPodcasts.size} podcasts foram removidos` });
      setSelectedPodcasts(new Set());
      setSelectionMode(false);
      setBulkDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao excluir", description: "Alguns podcasts não puderam ser excluídos", variant: "destructive" });
    },
  });

  const togglePodcastSelection = (podcastId: string) => {
    setSelectedPodcasts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(podcastId)) {
        newSet.delete(podcastId);
      } else {
        newSet.add(podcastId);
      }
      return newSet;
    });
  };

  const selectAllPodcasts = () => {
    const allIds = myPodcasts.map(p => p.id);
    setSelectedPodcasts(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedPodcasts(new Set());
    setSelectionMode(false);
  };

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
  });

  const resetCreateForm = () => {
    setNewPodcastTitle("");
    setNewPodcastDescription("");
    setNewPodcastBook("");
  };

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
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const playEpisode = async (episode: Episode, podcast: Podcast) => {
    setCurrentEpisode(episode);
    setCurrentPodcast(podcast);
    if (episode.audioData) {
      if (audioRef.current) {
        audioRef.current.src = episode.audioData;
        audioRef.current.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      }
      return;
    }
    if (episode.bookAbbrev && episode.chapterNumber) {
      setIsLoadingAudio(true);
      try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`/api/bible/audio/pt/nvi/${episode.bookAbbrev}/${episode.chapterNumber}`, { credentials: 'include', headers: authHeaders });
        if (response.ok) {
          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
          }
        }
      } catch (error) {
        toast({ title: "Erro de conexão", variant: "destructive" });
      } finally {
        setIsLoadingAudio(false);
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentEpisode) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-40">
      <audio ref={audioRef} className="hidden" />
      
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Radio className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                BíbliaFS Rádio
              </h1>
              <p className="text-lg text-muted-foreground">
                Podcasts cristãos integrados ao seu estudo
              </p>
            </div>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5 mr-2" />
                Criar Podcast
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Podcast</DialogTitle>
                <DialogDescription>Escolha um livro da Bíblia para gerar episódios automaticamente.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Livro da Bíblia *</Label>
                  <Select value={newPodcastBook} onValueChange={setNewPodcastBook}>
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Selecione um livro..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_BOOKS.map(book => <SelectItem key={book} value={book}>{book}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título do Podcast</Label>
                  <Input 
                    placeholder="Ex: Leitura de Romanos"
                    className="rounded-xl h-12"
                    value={newPodcastTitle}
                    onChange={(e) => setNewPodcastTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                <Button 
                  className="rounded-xl"
                  onClick={() => createPodcastMutation.mutate({ title: newPodcastTitle.trim() || `Leitura de ${newPodcastBook}`, description: newPodcastDescription, bibleBook: newPodcastBook })}
                  disabled={createPodcastMutation.isPending || !newPodcastBook}
                >
                  {createPodcastMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Criar Podcast"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar podcasts ou episódios..." 
              className="pl-12 h-14 rounded-2xl bg-card/80 backdrop-blur-xl border-none shadow-lg text-lg"
            />
          </div>
        </motion.div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto flex-wrap">
            <TabsTrigger value="discover" className="rounded-xl px-6 py-3 data-[state=active]:bg-background data-[state=active]:shadow-lg">Descobrir</TabsTrigger>
            <TabsTrigger value="subscriptions" className="rounded-xl px-6 py-3 data-[state=active]:bg-background data-[state=active]:shadow-lg">Inscrições ({subscriptions.length})</TabsTrigger>
            <TabsTrigger value="my-podcasts" className="rounded-xl px-6 py-3 data-[state=active]:bg-background data-[state=active]:shadow-lg">Meus Podcasts ({myPodcasts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {podcasts.map((podcast: any, idx: number) => (
                  <motion.div
                    key={podcast.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="rounded-[2rem] border-none bg-card/80 backdrop-blur-xl shadow-lg group overflow-hidden h-full flex flex-col">
                      <div className="h-48 relative overflow-hidden bg-primary/10">
                        {podcast.imageUrl ? (
                          <img src={podcast.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Headphones className="h-16 w-16 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <Badge className="rounded-full bg-white/20 backdrop-blur-md border-none text-white font-bold">{podcast.category || 'Geral'}</Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{podcast.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm leading-relaxed">{podcast.description || 'Sem descrição'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1"><Library className="h-3 w-3" /> {podcast.episodes?.length || 0} Episódios</span>
                          {podcast.bibleBook && <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" /> {podcast.bibleBook}</span>}
                        </div>
                        {podcast.episodes?.length > 0 && (
                          <div className="space-y-2">
                            {podcast.episodes.slice(0, 2).map((ep: Episode) => (
                              <div 
                                key={ep.id} 
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-primary/5 transition-colors cursor-pointer group/ep"
                                onClick={() => playEpisode(ep, podcast)}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate group-hover/ep:text-primary">{ep.title}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    {formatTime(ep.duration)}
                                    {downloadedEpisodes.has(ep.id) && <Badge variant="secondary" className="h-4 text-[8px] bg-green-500/10 text-green-600 border-none">OFFLINE</Badge>}
                                  </p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/ep:bg-primary group-hover/ep:text-white transition-all">
                                  <Play className="h-4 w-4 fill-current" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0 border-t border-border/50 p-6 flex justify-between gap-4">
                        <Button 
                          variant="ghost" 
                          className="flex-1 rounded-xl h-11 font-bold group-hover:bg-primary group-hover:text-white transition-all"
                          onClick={() => {
                            // Logic to view details could go here
                            toast({ title: "Em breve", description: "Visualização detalhada do podcast" });
                          }}
                        >
                          Ver Podcast
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="rounded-xl h-11 w-11 hover:bg-primary/10"
                          onClick={() => {
                            const isSubscribed = subscriptions.some(s => s.id === podcast.id);
                            if (isSubscribed) {
                              unsubscribeMutation.mutate(podcast.id);
                            } else {
                              subscribeMutation.mutate(podcast.id);
                            }
                          }}
                          disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
                        >
                          {subscriptions.some(s => s.id === podcast.id) ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Plus className="h-5 w-5" />
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {subscriptions.length > 0 ? (
                  subscriptions.map((podcast: any, idx: number) => (
                    <motion.div
                      key={podcast.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="rounded-[2rem] border-none bg-card/80 backdrop-blur-xl shadow-lg group overflow-hidden h-full flex flex-col">
                        <div className="h-48 relative overflow-hidden bg-primary/10">
                          {podcast.imageUrl ? (
                            <img src={podcast.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Headphones className="h-16 w-16 text-primary/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <Badge className="rounded-full bg-white/20 backdrop-blur-md border-none text-white font-bold">{podcast.category || 'Geral'}</Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{podcast.title}</CardTitle>
                          <CardDescription className="line-clamp-2 text-sm leading-relaxed">{podcast.description || 'Sem descrição'}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Library className="h-3 w-3" /> {podcast.episodes?.length || 0} Episódios</span>
                            {podcast.bibleBook && <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" /> {podcast.bibleBook}</span>}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 border-t border-border/50 p-6 flex justify-between gap-4">
                          <Button 
                            variant="ghost" 
                            className="flex-1 rounded-xl h-11 font-bold group-hover:bg-primary group-hover:text-white transition-all"
                            onClick={() => {
                              toast({ title: "Em breve", description: "Visualização detalhada do podcast" });
                            }}
                          >
                            Ver Podcast
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="rounded-xl h-11 w-11 hover:bg-destructive/10 text-destructive"
                            onClick={() => {
                              setSelectedPodcast(podcast);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-muted-foreground">Você ainda não se inscreveu em nenhum podcast.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="my-podcasts">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center bg-muted/50 rounded-xl p-1">
                  <Button 
                    size="icon" 
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    className="rounded-lg h-9 w-9"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-view-grid"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant={viewMode === "list" ? "default" : "ghost"}
                    className="rounded-lg h-9 w-9"
                    onClick={() => setViewMode("list")}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selection Mode Toggle */}
                <Button 
                  variant={selectionMode ? "secondary" : "outline"}
                  className="rounded-xl h-9"
                  onClick={() => {
                    if (selectionMode) {
                      clearSelection();
                    } else {
                      setSelectionMode(true);
                    }
                  }}
                  data-testid="button-toggle-selection"
                >
                  {selectionMode ? <X className="h-4 w-4 mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
                  {selectionMode ? "Cancelar" : "Selecionar"}
                </Button>
              </div>

              {/* Selection Actions */}
              {selectionMode && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="rounded-xl h-9"
                    onClick={selectAllPodcasts}
                    disabled={myPodcasts.length === 0}
                    data-testid="button-select-all"
                  >
                    Selecionar Tudo ({myPodcasts.length})
                  </Button>
                  {selectedPodcasts.size > 0 && (
                    <Button 
                      variant="destructive" 
                      className="rounded-xl h-9"
                      onClick={() => setBulkDeleteDialogOpen(true)}
                      data-testid="button-delete-selected"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir ({selectedPodcasts.size})
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {myPodcasts.length > 0 ? (
                    myPodcasts.map((podcast: any, idx: number) => (
                      <motion.div
                        key={podcast.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className={`rounded-[2rem] border-none bg-card/80 backdrop-blur-xl shadow-lg group overflow-hidden h-full flex flex-col ${selectionMode && selectedPodcasts.has(podcast.id) ? 'ring-2 ring-primary' : ''}`}>
                          <div className="h-48 relative overflow-hidden bg-primary/10">
                            {selectionMode && (
                              <div 
                                className="absolute top-4 left-4 z-10 cursor-pointer"
                                onClick={() => togglePodcastSelection(podcast.id)}
                              >
                                <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${selectedPodcasts.has(podcast.id) ? 'bg-primary border-primary' : 'bg-white/80 border-white/50'}`}>
                                  {selectedPodcasts.has(podcast.id) && <Check className="h-4 w-4 text-white" />}
                                </div>
                              </div>
                            )}
                            {podcast.imageUrl ? (
                              <img src={podcast.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Headphones className="h-16 w-16 text-primary/40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                              <Badge className="rounded-full bg-white/20 backdrop-blur-md border-none text-white font-bold">{podcast.category || 'Geral'}</Badge>
                            </div>
                          </div>
                          <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{podcast.title}</CardTitle>
                            <CardDescription className="line-clamp-2 text-sm leading-relaxed">{podcast.description || 'Sem descrição'}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 space-y-4">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Library className="h-3 w-3" /> {podcast.episodes?.length || 0} Episódios</span>
                              {podcast.bibleBook && <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" /> {podcast.bibleBook}</span>}
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0 border-t border-border/50 p-6 flex justify-between gap-4">
                            <Button variant="ghost" className="flex-1 rounded-xl h-11 font-bold group-hover:bg-primary group-hover:text-white transition-all">
                              Gerenciar
                            </Button>
                            {!selectionMode && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="rounded-xl h-11 w-11 hover:bg-destructive/10 text-destructive"
                                onClick={() => {
                                  setSelectedPodcast(podcast);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-muted-foreground">Você ainda não criou nenhum podcast.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {myPodcasts.length > 0 ? (
                    myPodcasts.map((podcast: any, idx: number) => (
                      <motion.div
                        key={podcast.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <Card className={`rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-sm group overflow-hidden ${selectionMode && selectedPodcasts.has(podcast.id) ? 'ring-2 ring-primary' : ''}`}>
                          <div className="flex items-center gap-4 p-4">
                            {selectionMode && (
                              <div 
                                className="cursor-pointer flex-shrink-0"
                                onClick={() => togglePodcastSelection(podcast.id)}
                              >
                                <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${selectedPodcasts.has(podcast.id) ? 'bg-primary border-primary' : 'bg-muted border-border'}`}>
                                  {selectedPodcasts.has(podcast.id) && <Check className="h-4 w-4 text-white" />}
                                </div>
                              </div>
                            )}
                            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {podcast.imageUrl ? (
                                <img src={podcast.imageUrl} className="w-full h-full object-cover" />
                              ) : (
                                <Headphones className="h-8 w-8 text-primary/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{podcast.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{podcast.description || 'Sem descrição'}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Library className="h-3 w-3" /> {podcast.episodes?.length || 0} Episódios</span>
                                {podcast.bibleBook && <span className="flex items-center gap-1"><Bookmark className="h-3 w-3" /> {podcast.bibleBook}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button variant="ghost" className="rounded-xl h-9 font-bold">
                                Gerenciar
                              </Button>
                              {!selectionMode && (
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="rounded-xl h-9 w-9 hover:bg-destructive/10 text-destructive"
                                  onClick={() => {
                                    setSelectedPodcast(podcast);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-muted-foreground">Você ainda não criou nenhum podcast.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o podcast
                "{selectedPodcast?.title}" e todos os seus episódios.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (selectedPodcast) {
                    deletePodcastMutation.mutate(selectedPodcast.id);
                  }
                }}
                disabled={deletePodcastMutation.isPending}
              >
                {deletePodcastMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {selectedPodcasts.size} podcasts?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente 
                {selectedPodcasts.size === 1 ? " o podcast selecionado" : ` os ${selectedPodcasts.size} podcasts selecionados`} e todos os seus episódios.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  bulkDeleteMutation.mutate(Array.from(selectedPodcasts));
                }}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  `Excluir ${selectedPodcasts.size} podcasts`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Floating Player */}
      <AnimatePresence>
        {currentEpisode && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 md:left-10 md:right-10 z-50"
          >
            <Card className="rounded-[2.5rem] border-none bg-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto border-t border-white/10">
              <div className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
                    {currentPodcast?.imageUrl ? <img src={currentPodcast.imageUrl} className="w-full h-full object-cover" /> : <Radio className="h-10 w-10 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg line-clamp-1">{currentEpisode.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-1">{currentPodcast?.title}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1 w-full md:max-w-md">
                  <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => skip(-15)}><SkipBack className="h-5 w-5 fill-current" /></Button>
                    <Button size="icon" className="h-14 w-14 rounded-full shadow-xl shadow-primary/20" onClick={togglePlay}>
                      {isLoadingAudio ? <Loader2 className="h-6 w-6 animate-spin" /> : isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => skip(15)}><SkipForward className="h-5 w-5 fill-current" /></Button>
                  </div>
                  <div className="w-full flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
                    <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={(v) => skip(v[0] - currentTime)} className="flex-1" />
                    <span className="text-[10px] font-bold text-muted-foreground w-10">{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-4 w-40">
                  <Volume2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <Slider value={[volume]} max={100} step={1} onValueChange={(v) => setVolume(v[0])} />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
