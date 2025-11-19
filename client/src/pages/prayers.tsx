import { useState } from "react";
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
  Loader2
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

// Form schema
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
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/prayers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      setIsCreateDialogOpen(false);
      form.reset();
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

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const activePrayers = prayers.filter(p => !p.isAnswered);
  const answeredPrayers = prayers.filter(p => p.isAnswered);

  const handleStartRecording = () => {
    setIsRecording(true);
    // In real implementation, would start MediaRecorder
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // In real implementation, would stop and save recording
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando orações...</p>
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
        <div className="max-w-5xl mx-auto p-6">
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
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2" data-testid="text-page-title">
              Minhas Orações
            </h1>
            <p className="text-lg text-muted-foreground">
              Registre e acompanhe suas orações
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-new-prayer">
                <Plus className="h-5 w-5 mr-2" />
                Nova Oração
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                            className="min-h-[120px]"
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
                          className="flex-1"
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
                          className="flex-1"
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
                        Gravando...
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
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-prayer"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
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
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orações Ativas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary" data-testid="text-active-prayers">
                {activePrayers.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orações Respondidas</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600" data-testid="text-answered-prayers">
                {answeredPrayers.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Orações</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {prayers.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prayers List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="active" data-testid="tab-active-prayers">
              Ativas ({activePrayers.length})
            </TabsTrigger>
            <TabsTrigger value="answered" data-testid="tab-answered-prayers">
              Respondidas ({answeredPrayers.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activePrayers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhuma oração ativa</h3>
                  <p className="text-muted-foreground mb-4">
                    Registre sua primeira oração
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Oração
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activePrayers.map((prayer) => (
                  <Card key={prayer.id} className="hover-elevate" data-testid={`card-prayer-${prayer.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{prayer.title}</CardTitle>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(prayer.createdAt!), { 
                                addSuffix: true,
                                locale: ptBR 
                              })}
                            </div>
                            {prayer.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {prayer.location.name || "Localização salva"}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary">Ativa</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {prayer.content && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {prayer.content}
                        </p>
                      )}
                      
                      {prayer.audioUrl && (
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Button size="icon" variant="outline" className="h-10 w-10 shrink-0">
                            <Play className="h-4 w-4" />
                          </Button>
                          <div className="flex-1">
                            <div className="h-1 bg-background rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-1/3" />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor((prayer.audioDuration || 0) / 60)}:
                            {String((prayer.audioDuration || 0) % 60).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button variant="outline" size="sm" data-testid="button-mark-answered">
                        <Check className="h-4 w-4 mr-2" />
                        Marcar como Respondida
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="answered">
            {answeredPrayers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhuma oração respondida</h3>
                  <p className="text-muted-foreground">
                    Marque suas orações como respondidas quando forem atendidas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {answeredPrayers.map((prayer) => (
                  <Card key={prayer.id} className="border-green-500/20 bg-green-500/5">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                          {prayer.title}
                        </CardTitle>
                        <Badge className="bg-green-500/20 text-green-700">
                          Respondida
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {prayer.content && (
                        <p className="text-sm text-muted-foreground">
                          {prayer.content}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
