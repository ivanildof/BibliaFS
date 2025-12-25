import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Plus, 
  Mic, 
  MapPin,
  Play,
  Pause,
  Check,
  Calendar,
  Clock,
  Loader2,
  Heart,
  Sparkles,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPrayerSchema, type Prayer } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const formSchema = insertPrayerSchema.extend({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  content: z.string().min(5, "O conteúdo deve ter pelo menos 5 caracteres"),
}).omit({ userId: true });

type FormData = z.infer<typeof formSchema>;

export default function Prayers() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const { data: prayers = [], isLoading, error } = useQuery<Prayer[]>({
    queryKey: ["/api/prayers"],
    retry: 2,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/prayers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setIsCreateDialogOpen(false);
      form.reset();
      setAudioBlob(null);
      setRecordingTime(0);
      toast({
        title: "Oração registrada!",
        description: "Sua oração foi salva com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar oração",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAnsweredMutation = useMutation({
    mutationFn: async ({ id, isAnswered }: { id: string; isAnswered: boolean }) => {
      return await apiRequest("PATCH", `/api/prayers/${id}`, { 
        isAnswered, 
        answeredAt: isAnswered ? new Date().toISOString() : null 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({ title: "Atualizado!", description: "Status da oração atualizado" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/prayers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({ title: "Removido!", description: "Oração excluída" });
    },
  });

  const onSubmit = async (data: FormData) => {
    let audioUrl: string | undefined;
    if (audioBlob) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      audioUrl = base64;
    }
    createMutation.mutate({ ...data, audioUrl, audioDuration: recordingTime });
  };

  const activePrayers = prayers.filter(p => !p.isAnswered);
  const answeredPrayers = prayers.filter(p => p.isAnswered);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const MAX_RECORDING_SECONDS = 300;
  const MAX_AUDIO_SIZE_MB = 5;

  const cleanupRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  useEffect(() => {
    if (!isCreateDialogOpen) {
      if (isRecording) {
        handleStopRecording();
      }
      cleanupRecording();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setAudioBlob(null);
      setPreviewUrl(null);
      setRecordingTime(0);
      setIsPlayingPreview(false);
    }
  }, [isCreateDialogOpen]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm;codecs=opus" });
        const sizeMB = audioBlob.size / (1024 * 1024);
        
        if (sizeMB > MAX_AUDIO_SIZE_MB) {
          toast({
            title: "Áudio muito grande",
            description: `O arquivo excede ${MAX_AUDIO_SIZE_MB}MB. Grave um áudio mais curto.`,
            variant: "destructive",
          });
          setAudioBlob(null);
          setPreviewUrl(null);
        } else {
          setAudioBlob(audioBlob);
          const url = URL.createObjectURL(audioBlob);
          setPreviewUrl(url);
          toast({
            title: "Áudio gravado!",
            description: "Ouça o preview antes de salvar.",
          });
        }
        
        cleanupRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_SECONDS) {
            handleStopRecording();
            toast({
              title: "Gravação finalizada",
              description: "Tempo máximo de 5 minutos atingido",
            });
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Permissão de microfone negada",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando orações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <MessageSquare className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Erro ao carregar orações</h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar suas orações. Tente novamente.
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent" data-testid="text-page-title">
                Minhas Orações
              </h1>
              <p className="text-lg text-muted-foreground">
                Registre e acompanhe suas orações
              </p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20" data-testid="button-new-prayer">
                <Plus className="h-5 w-5 mr-2" />
                Nova Oração
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Oração</DialogTitle>
                <DialogDescription>
                  Escreva ou grave sua oração em áudio
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Pela saúde da família"
                            className="rounded-xl"
                            data-testid="input-prayer-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escreva sua oração..."
                            className="min-h-[120px] rounded-xl"
                            data-testid="textarea-prayer-content"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormLabel>Ou grave em áudio</FormLabel>
                    <div className="flex items-center gap-3">
                      {!isRecording ? (
                        <Button 
                          type="button"
                          variant="outline" 
                          className="flex-1 rounded-xl"
                          onClick={handleStartRecording}
                          data-testid="button-start-recording"
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Gravar Oração
                        </Button>
                      ) : (
                        <Button 
                          type="button"
                          variant="destructive" 
                          className="flex-1 rounded-xl"
                          onClick={handleStopRecording}
                          data-testid="button-stop-recording"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Parar Gravação
                        </Button>
                      )}
                    </div>
                    {isRecording && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span>Gravando... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
                    </div>
                  )}
                  
                  {audioBlob && previewUrl && (
                    <div className="space-y-3 p-4 bg-muted rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Preview da Gravação</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </span>
                      </div>
                      <audio 
                        ref={previewAudioRef}
                        controls 
                        className="w-full h-8"
                        src={previewUrl}
                        onPlay={() => setIsPlayingPreview(true)}
                        onPause={() => setIsPlayingPreview(false)}
                        onEnded={() => setIsPlayingPreview(false)}
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl"
                        onClick={() => {
                          setAudioBlob(null);
                          setPreviewUrl(null);
                          setRecordingTime(0);
                        }}
                      >
                        <Mic className="h-3 w-3 mr-2" />
                        Gravar Novamente
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Adicionar localização (opcional)</span>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-prayer"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="rounded-xl"
                    disabled={createMutation.isPending}
                    data-testid="button-save-prayer"
                  >
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {createMutation.isPending ? "Salvando..." : "Salvar Oração"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10"
        >
          {[
            { label: "Orações Ativas", value: activePrayers.length, icon: MessageSquare, color: "text-primary", testId: "text-active-prayers" },
            { label: "Respondidas", value: answeredPrayers.length, icon: CheckCircle2, color: "text-green-600", testId: "text-answered-prayers" },
            { label: "Total", value: prayers.length, icon: Sparkles, color: "text-amber-600", testId: "text-total-prayers" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Card className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <div className="p-2 rounded-xl bg-muted/50">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`} data-testid={stat.testId}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 bg-muted/50 p-1.5 rounded-2xl h-auto">
              <TabsTrigger 
                value="active" 
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all py-3 px-6"
                data-testid="tab-active-prayers"
              >
                Ativas ({activePrayers.length})
              </TabsTrigger>
              <TabsTrigger 
                value="answered" 
                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all py-3 px-6"
                data-testid="tab-answered-prayers"
              >
                Respondidas ({answeredPrayers.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {activePrayers.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-none bg-muted/30">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-muted/50 mb-6">
                      <Heart className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Nenhuma oração ativa</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Registre sua primeira oração e acompanhe as bênçãos de Deus
                    </p>
                    <Button className="rounded-xl" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Oração
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {activePrayers.map((prayer, idx) => (
                      <motion.div
                        key={prayer.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg group" data-testid={`card-prayer-${prayer.id}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{prayer.title}</CardTitle>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatDistanceToNow(new Date(prayer.createdAt!), { 
                                      addSuffix: true,
                                      locale: ptBR 
                                    })}
                                  </div>
                                  {prayer.location && (
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {prayer.location.name || "Localização salva"}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest">Ativa</Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            {prayer.content && (
                              <p className="text-muted-foreground leading-relaxed mb-4">
                                {prayer.content}
                              </p>
                            )}
                            
                            {prayer.audioUrl && (
                              <div className="p-4 bg-muted/50 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Mic className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-sm font-medium">
                                    Gravação de {Math.floor((prayer.audioDuration || 0) / 60)}:
                                    {String((prayer.audioDuration || 0) % 60).padStart(2, '0')}
                                  </span>
                                </div>
                                <audio 
                                  controls 
                                  className="w-full" 
                                  src={prayer.audioUrl}
                                  data-testid={`audio-prayer-${prayer.id}`}
                                />
                              </div>
                            )}
                          </CardContent>
                          
                          <CardFooter className="gap-3 pt-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              className="rounded-xl"
                              onClick={() => markAnsweredMutation.mutate({ id: prayer.id, isAnswered: true })}
                              data-testid={`button-mark-answered-${prayer.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Marcar Respondida
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="rounded-xl hover:bg-destructive/10"
                              onClick={() => deleteMutation.mutate(prayer.id)}
                              data-testid={`button-delete-prayer-${prayer.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive/70" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="answered">
              {answeredPrayers.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-none bg-muted/30">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-green-500/10 mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Nenhuma oração respondida ainda</h3>
                    <p className="text-muted-foreground max-w-md">
                      Quando Deus responder suas orações, marque-as aqui para celebrar!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {answeredPrayers.map((prayer, idx) => (
                      <motion.div
                        key={prayer.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="rounded-2xl border-none bg-green-500/5 backdrop-blur-xl shadow-lg" data-testid={`card-answered-${prayer.id}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-xl font-bold mb-2">{prayer.title}</CardTitle>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Respondida {prayer.answeredAt && formatDistanceToNow(new Date(prayer.answeredAt), { 
                                      addSuffix: true,
                                      locale: ptBR 
                                    })}
                                  </div>
                                </div>
                              </div>
                              <Badge className="rounded-full px-3 py-1 bg-green-500/10 text-green-600 border-none font-bold text-[10px] uppercase tracking-widest">Respondida</Badge>
                            </div>
                          </CardHeader>
                          
                          {prayer.content && (
                            <CardContent>
                              <p className="text-muted-foreground leading-relaxed">
                                {prayer.content}
                              </p>
                            </CardContent>
                          )}
                          
                          <CardFooter className="gap-3 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="rounded-xl"
                              onClick={() => markAnsweredMutation.mutate({ id: prayer.id, isAnswered: false })}
                              data-testid={`button-unmark-answered-${prayer.id}`}
                            >
                              Mover para Ativas
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="rounded-xl hover:bg-destructive/10"
                              onClick={() => deleteMutation.mutate(prayer.id)}
                              data-testid={`button-delete-answered-${prayer.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive/70" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
