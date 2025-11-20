import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  BookOpen, 
  Plus, 
  Check,
  Clock,
  TrendingUp,
  Loader2,
  Trophy,
  Target
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type ReadingPlan, type ReadingPlanTemplate } from "@shared/schema";

export default function ReadingPlans() {
  const { toast } = useToast();
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReadingPlanTemplate | null>(null);

  const { data: plans = [], isLoading: plansLoading } = useQuery<ReadingPlan[]>({
    queryKey: ["/api/reading-plans"],
    retry: 2,
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<ReadingPlanTemplate[]>({
    queryKey: ["/api/reading-plan-templates"],
    retry: 2,
  });

  const createFromTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      return await apiRequest("POST", "/api/reading-plans/from-template", { templateId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans"] });
      setIsTemplatesDialogOpen(false);
      setSelectedTemplate(null);
      toast({
        title: "Plano iniciado!",
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

  const completeDayMutation = useMutation({
    mutationFn: async ({ planId, day }: { planId: string; day: number }) => {
      return await apiRequest("PUT", `/api/reading-plans/${planId}/complete-day`, { day });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/gamification"] });
      toast({
        title: "Dia completo! 🎉",
        description: "Você ganhou 10 XP pela sua leitura.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao marcar progresso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activePlans = plans.filter(p => !p.isCompleted);
  const completedPlans = plans.filter(p => p.isCompleted);

  if (plansLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2" data-testid="text-page-title">
              Planos de Leitura
            </h1>
            <p className="text-lg text-muted-foreground">
              Organize e acompanhe seu estudo bíblico
            </p>
          </div>
          
          <Dialog open={isTemplatesDialogOpen} onOpenChange={setIsTemplatesDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-plan">
                <Plus className="h-5 w-5 mr-2" />
                Iniciar Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Escolher Plano de Leitura</DialogTitle>
                <DialogDescription>
                  Selecione um plano predefinido para começar sua jornada
                </DialogDescription>
              </DialogHeader>
              
              {templatesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all hover-elevate ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                      data-testid={`card-template-${template.id}`}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {template.duration} dias
                          </Badge>
                          {template.difficulty && (
                            <Badge variant="outline">
                              {template.difficulty}
                            </Badge>
                          )}
                          {template.category && (
                            <Badge variant="outline">
                              {template.category}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsTemplatesDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button 
                  disabled={!selectedTemplate || createFromTemplateMutation.isPending}
                  onClick={() => selectedTemplate && createFromTemplateMutation.mutate(selectedTemplate.id)}
                  data-testid="button-start-plan"
                >
                  {createFromTemplateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {createFromTemplateMutation.isPending ? "Iniciando..." : "Iniciar Plano"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
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
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
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
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
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
                  Escolha um plano predefinido para começar sua jornada
                </p>
                <Button onClick={() => setIsTemplatesDialogOpen(true)} data-testid="button-start-first-plan">
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Primeiro Plano
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activePlans.map((plan) => {
                const progress = (plan.currentDay / plan.totalDays) * 100;
                const schedule = plan.schedule as Array<{ day: number; readings: any[]; isCompleted: boolean }>;
                const completedDays = schedule.filter(s => s.isCompleted).length;
                
                return (
                  <Card key={plan.id} data-testid={`card-plan-${plan.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{plan.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {plan.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          <Target className="h-3 w-3 mr-1" />
                          Dia {plan.currentDay}/{plan.totalDays}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {completedDays} de {plan.totalDays} dias completos
                        </span>
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>

                      {schedule[plan.currentDay - 1] && !schedule[plan.currentDay - 1].isCompleted && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Leitura de hoje:</p>
                          <div className="space-y-1">
                            {schedule[plan.currentDay - 1].readings.map((reading: any, idx: number) => (
                              <p key={idx} className="text-sm font-medium">
                                {reading.book} {reading.chapter}
                                {reading.verses ? `:${reading.verses}` : ''}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => completeDayMutation.mutate({ planId: plan.id, day: plan.currentDay })}
                        disabled={
                          completeDayMutation.isPending || 
                          (schedule[plan.currentDay - 1]?.isCompleted ?? false)
                        }
                        data-testid={`button-complete-day-${plan.id}`}
                      >
                        {completeDayMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {schedule[plan.currentDay - 1]?.isCompleted ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Dia Completo
                          </>
                        ) : (
                          "Marcar Dia Como Completo"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {completedPlans.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold mb-4">Planos Concluídos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {completedPlans.map((plan) => (
                <Card key={plan.id} className="bg-muted/30" data-testid={`card-completed-plan-${plan.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{plan.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {plan.description}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="bg-primary">
                        <Trophy className="h-3 w-3 mr-1" />
                        Concluído
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Completado em {new Date(plan.completedAt!).toLocaleDateString('pt-BR')}
                      </span>
                      <Check className="h-5 w-5 text-primary" />
                    </div>
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
