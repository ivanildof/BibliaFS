import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
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
  Plus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Podcast } from "@shared/schema";

export default function Podcasts() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);

  const { data: podcasts = [] } = useQuery<Podcast[]>({
    queryKey: ["/api/podcasts"],
  });

  const { data: subscriptions = [] } = useQuery<any[]>({
    queryKey: ["/api/podcasts/subscriptions"],
  });

  // Sample featured podcast
  const featuredPodcast = {
    title: "Teologia Sem Queda",
    episode: "O Significado do Batismo",
    duration: 2400, // 40 minutes in seconds
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop",
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2" data-testid="text-page-title">
            BíbliaFS Rádio
          </h1>
          <p className="text-lg text-muted-foreground">
            Podcasts cristãos integrados ao seu estudo
          </p>
        </div>

        {/* Search */}
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
            <TabsTrigger value="discover" data-testid="tab-discover">
              Descobrir
            </TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
              Minhas Inscrições ({subscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="library" data-testid="tab-library">
              Biblioteca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-8">
            {/* Featured */}
            <section>
              <h2 className="font-display text-2xl font-bold mb-4">Em Destaque</h2>
              <Card className="md:flex overflow-hidden hover-elevate">
                <div 
                  className="md:w-64 h-64 md:h-auto bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${featuredPodcast.imageUrl})` }}
                />
                <div className="flex-1">
                  <CardHeader>
                    <Badge className="w-fit mb-2">Novo Episódio</Badge>
                    <CardTitle className="text-2xl">{featuredPodcast.title}</CardTitle>
                    <CardDescription className="text-base">
                      {featuredPodcast.episode}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Neste episódio exploramos o significado bíblico e histórico do batismo cristão, 
                      suas diferentes interpretações denominacionais e sua importância na vida do crente.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.floor(featuredPodcast.duration / 60)} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Hoje
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button data-testid="button-play-featured">
                      <Play className="h-4 w-4 mr-2" />
                      Ouvir Agora
                    </Button>
                    <Button variant="outline" data-testid="button-download-featured">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            </section>

            {/* Popular Podcasts */}
            <section>
              <h2 className="font-display text-2xl font-bold mb-4">Podcasts Populares</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: "Seara News", subs: "12.5k", episodes: 156 },
                  { name: "Palavra de Deus", subs: "8.2k", episodes: 89 },
                  { name: "Estudos Bíblicos", subs: "6.8k", episodes: 124 },
                ].map((podcast, index) => (
                  <Card key={index} className="hover-elevate" data-testid={`card-podcast-${index}`}>
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Headphones className="h-16 w-16 text-primary" />
                    </div>
                    <CardHeader>
                      <CardTitle>{podcast.name}</CardTitle>
                      <CardDescription>
                        {podcast.subs} inscritos • {podcast.episodes} episódios
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button variant="outline" className="w-full" data-testid={`button-subscribe-${index}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Inscrever-se
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
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
                {subscriptions.map((sub: any, index: number) => (
                  <Card key={index} className="hover-elevate">
                    <CardHeader>
                      <CardTitle>{sub.podcast.title}</CardTitle>
                      <CardDescription>
                        {sub.podcast.episodes?.length || 3} episódios disponíveis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(sub.podcast.episodes || [
                          { title: "Episódio 1: Introdução", duration: 1800 },
                          { title: "Episódio 2: Desenvolvimento", duration: 2400 },
                          { title: "Episódio 3: Conclusão", duration: 1500 }
                        ]).map((ep: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted hover-elevate">
                            <div className="flex-1">
                              <p className="font-sm text-sm">{ep.title}</p>
                              <p className="text-xs text-muted-foreground">{Math.floor((ep.duration || 1800) / 60)} min</p>
                            </div>
                            <Button size="icon" variant="ghost" data-testid={`button-play-episode-${i}`}>
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="library">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Download className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Biblioteca vazia</h3>
                <p className="text-muted-foreground">
                  Episódios baixados aparecerão aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-4">
            {/* Album Art */}
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Headphones className="h-8 w-8 text-primary" />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Episódio selecionado</p>
              <p className="text-sm text-muted-foreground truncate">Nome do Podcast</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" data-testid="button-skip-back">
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                className="h-12 w-12"
                onClick={() => setIsPlaying(!isPlaying)}
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button size="icon" variant="ghost" data-testid="button-skip-forward">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Progress */}
            <div className="hidden md:flex items-center gap-3 flex-1">
              <span className="text-xs text-muted-foreground min-w-[40px]">
                {Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, '0')}
              </span>
              <Slider
                value={[currentTime]}
                max={featuredPodcast.duration}
                step={1}
                className="flex-1"
                onValueChange={([value]) => setCurrentTime(value)}
              />
              <span className="text-xs text-muted-foreground min-w-[40px]">
                {Math.floor(featuredPodcast.duration / 60)}:
                {String(featuredPodcast.duration % 60).padStart(2, '0')}
              </span>
            </div>

            {/* Volume */}
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
