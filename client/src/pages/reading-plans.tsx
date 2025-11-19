import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  BookOpen, 
  Plus, 
  Check,
  Clock,
  Headphones,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertReadingPlanSchema, type ReadingPlan } from "@shared/schema";

// Form schema extending the insert schema
const formSchema = insertReadingPlanSchema.extend({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres").optional(),
  totalDays: z.number().min(1, "O plano deve ter pelo menos 1 dia").max(365, "O plano não pode ter mais de 365 dias"),
}).omit({ userId: true });

type FormData = z.infer<typeof formSchema>;

export default function ReadingPlans() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: plans = [], isLoading, error } = useQuery<ReadingPlan[]>({
    queryKey: ["/api/reading-plans"],
    retry: 2,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      totalDays: 30,
      schedule: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/reading-plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Plano criado!",
        description: "Seu plano de leitura foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const activePlans = plans.filter(p => !p.isCompleted);
  const completedPlans = plans.filter(p => p.isCompleted);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando planos...</p>
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
        <div className="max-w-7xl mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <BookOpen className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Erro ao carregar planos</h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar seus planos de leitura. Tente novamente.
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2" data-testid="text-page-title">
              Planos de Leitura
            </h1>
            <p className="text-lg text-muted-foreground">
              Organize e acompanhe seu estudo bíblico
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-plan">
                <Plus className="h-5 w-5 mr-2" />
                Criar Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Plano de Leitura</DialogTitle>
                <DialogDescription>
                  Defina um plano personalizado para seu estudo bíblico
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Plano</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Leitura do Novo Testamento em 90 dias"
                            data-testid="input-plan-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o objetivo deste plano..."
                            data-testid="textarea-plan-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (dias)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input 
                              type="number" 
                              placeholder="30" 
                              className="w-24"
                              data-testid="input-plan-days"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                            <span className="text-muted-foreground self-center">dias</span>
                          </div>
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
                      data-testid="button-cancel-plan"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-save-plan"
                    >
                      {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {createMutation.isPending ? "Criando..." : "Criar Plano"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary" data-testid="text-active-plans">
                {activePlans.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planos Concluídos</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-completed-plans">
                {completedPlans.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dia Atual</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {activePlans[0]?.currentDay || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Plans */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-4">Planos Ativos</h2>
          
          {activePlans.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Nenhum plano ativo</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro plano de leitura para começar
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Plano
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activePlans.map((plan) => (
                <Card key={plan.id} className="hover-elevate" data-testid={`card-plan-${plan.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">
                        Dia {plan.currentDay}/{plan.schedule?.length || 0}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {Math.round((plan.currentDay / (plan.schedule?.length || 1)) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(plan.currentDay / (plan.schedule?.length || 1)) * 100}
                        className="h-2"
                      />
                    </div>
                    
                    {/* Today's Reading Preview */}
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Leitura de Hoje</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span>João 3:1-21</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Headphones className="h-3 w-3" />
                          <span>Podcast: "Novo Nascimento"</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="gap-2">
                    <Button className="flex-1" data-testid="button-continue-plan">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Continuar
                    </Button>
                    <Button variant="outline" size="icon" data-testid="button-plan-settings">
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Completed Plans */}
        {completedPlans.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold mb-4">Planos Concluídos</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {completedPlans.map((plan) => (
                <Card key={plan.id} className="hover-elevate" data-testid={`card-completed-${plan.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                        Concluído
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {plan.schedule?.length} dias completados
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
