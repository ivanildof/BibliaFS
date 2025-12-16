import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { getBookName } from "@/lib/i18n";

const BIBLE_VERSIONS = ["nvi", "acf", "arc", "ra"];
const BIBLE_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute",
  "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias",
  "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares", "Isaías", "Jeremias",
  "Lamentações", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas",
  "Miquéias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios",
  "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses",
  "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
  "1 João", "2 João", "3 João", "Judas", "Apocalipse"
];

export default function ReadingPlans() {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReadingPlanTemplate | null>(null);
  
  // Custom plan state
  const [customVersion, setCustomVersion] = useState("nvi");
  const [customBook, setCustomBook] = useState("");
  const [customStartChapter, setCustomStartChapter] = useState("");
  const [customEndChapter, setCustomEndChapter] = useState("");
  const [customVerses, setCustomVerses] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [activeTab, setActiveTab] = useState("templates");

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
        title: t.plans.dayCompleted,
        description: t.plans.dayCompleted,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t.common.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createCustomPlanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/reading-plans/custom", {
        version: customVersion,
        book: customBook,
        startChapter: customStartChapter,
        endChapter: customEndChapter,
        verses: customVerses || undefined,
        title: customTitle
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-plans"] });
      setIsTemplatesDialogOpen(false);
      setCustomVersion("nvi");
      setCustomBook("");
      setCustomStartChapter("");
      setCustomEndChapter("");
      setCustomVerses("");
      setCustomTitle("");
      setActiveTab("templates");
      toast({
        title: "Plano criado!",
        description: "Seu plano de leitura customizado foi criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t.common.error,
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
        title: t.plans.dayComplete,
        description: t.plans.youEarnedXP.replace('{xp}', '10'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t.plans.errorMarkingProgress,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activePlans = plans.filter(p => !p.isCompleted);
  const completedPlans = plans.filter(p => p.isCompleted);

  // Show templates loading if no plans and templates are loading
  const showTemplatesOnEmpty = activePlans.length === 0 && completedPlans.length === 0 && !templatesLoading && templates.length > 0;

  if (plansLoading && activePlans.length === 0 && completedPlans.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t.common.loading}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" data-testid="text-page-title">
              {t.plans.title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              {t.plans.subtitle}
            </p>
          </div>
          
          <Dialog open={isTemplatesDialogOpen} onOpenChange={setIsTemplatesDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-plan" className="whitespace-nowrap">
                <Plus className="h-5 w-5 mr-2" />
                {t.plans.startPlan}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Plano de Leitura</DialogTitle>
                <DialogDescription>
                  Escolha um modelo pré-definido ou crie um plano customizado
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Modelos</TabsTrigger>
                  <TabsTrigger value="custom">Customizado</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
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
                        <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {template.duration} {t.plans.days}
                          </Badge>
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
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="version">Versão</Label>
                        <Select value={customVersion} onValueChange={setCustomVersion}>
                          <SelectTrigger id="version" data-testid="select-version">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BIBLE_VERSIONS.map(v => (
                              <SelectItem key={v} value={v}>{v.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="book">Livro</Label>
                        <Select value={customBook} onValueChange={setCustomBook}>
                          <SelectTrigger id="book" data-testid="select-book">
                            <SelectValue placeholder="Escolha um livro" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {BIBLE_BOOKS.map(book => (
                              <SelectItem key={book} value={book}>{book}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start">Capítulo Inicial</Label>
                        <Input 
                          id="start" 
                          type="number" 
                          min="1" 
                          value={customStartChapter}
                          onChange={(e) => setCustomStartChapter(e.target.value)}
                          placeholder="Ex: 1"
                          data-testid="input-start-chapter"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end">Capítulo Final</Label>
                        <Input 
                          id="end" 
                          type="number" 
                          min="1" 
                          value={customEndChapter}
                          onChange={(e) => setCustomEndChapter(e.target.value)}
                          placeholder="Ex: 5"
                          data-testid="input-end-chapter"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verses">Versículos (opcional)</Label>
                      <Input 
                        id="verses" 
                        value={customVerses}
                        onChange={(e) => setCustomVerses(e.target.value)}
                        placeholder="Ex: 1-10 ou deixe em branco para todos"
                        data-testid="input-verses"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Plano (opcional)</Label>
                      <Input 
                        id="title" 
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Ex: Minha Leitura de Mateus"
                        data-testid="input-plan-title"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsTemplatesDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  {t.common.cancel}
                </Button>
                {activeTab === "templates" ? (
                  <Button 
                    disabled={!selectedTemplate || createFromTemplateMutation.isPending}
                    onClick={() => selectedTemplate && createFromTemplateMutation.mutate(selectedTemplate.id)}
                    data-testid="button-start-plan"
                  >
                    {createFromTemplateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {createFromTemplateMutation.isPending ? t.plans.starting : t.plans.startPlan}
                  </Button>
                ) : (
                  <Button
                    disabled={!customBook || !customStartChapter || !customEndChapter || createCustomPlanMutation.isPending}
                    onClick={() => createCustomPlanMutation.mutate()}
                    data-testid="button-create-custom"
                  >
                    {createCustomPlanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {createCustomPlanMutation.isPending ? "Criando..." : "Criar Plano"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.plans.activePlans}</CardTitle>
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
              <CardTitle className="text-sm font-medium">{t.plans.completedPlans}</CardTitle>
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
              <CardTitle className="text-sm font-medium">{t.plans.currentDay}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {activePlans[0]?.currentDay ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-4">{t.plans.activePlans}</h2>
          
          {activePlans.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t.plans.noActivePlans}</h3>
                <p className="text-muted-foreground mb-4">
                  {t.plans.choosePlanDescription}
                </p>
                <Button onClick={() => setIsTemplatesDialogOpen(true)} data-testid="button-start-first-plan">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.plans.startFirstPlan}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activePlans.map((plan) => {
                const currentDay = plan.currentDay ?? 1;
                const progress = (currentDay / plan.totalDays) * 100;
                const schedule = plan.schedule as Array<{ day: number; readings: any[]; isCompleted: boolean }>;
                const completedDays = schedule.filter(s => s.isCompleted).length;
                
                return (
                  <Card key={plan.id} data-testid={`card-plan-${plan.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{plan.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {plan.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          <Target className="h-3 w-3 mr-1" />
                          {t.plans.day} {currentDay}/{plan.totalDays}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">{t.plans.progress}</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {completedDays} {t.plans.of_days_completed.replace('{total}', plan.totalDays.toString())}
                        </span>
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>

                      {schedule[currentDay - 1] && !schedule[currentDay - 1].isCompleted && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">{t.plans.todayReading}</p>
                          <div className="space-y-1">
                            {schedule[currentDay - 1].readings.map((reading: any, idx: number) => (
                              <p key={idx} className="text-sm font-medium">
                                {getBookName(reading.book, language)} {reading.chapter}
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
                        onClick={() => completeDayMutation.mutate({ planId: plan.id, day: currentDay })}
                        disabled={
                          completeDayMutation.isPending || 
                          (schedule[currentDay - 1]?.isCompleted ?? false)
                        }
                        data-testid={`button-complete-day-${plan.id}`}
                      >
                        {completeDayMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {schedule[currentDay - 1]?.isCompleted ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            {t.plans.dayCompleted}
                          </>
                        ) : (
                          t.plans.markDayComplete
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
            <h2 className="font-display text-2xl font-bold mb-4">{t.plans.completedPlans}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {completedPlans.map((plan) => (
                <Card key={plan.id} className="bg-muted/30" data-testid={`card-completed-plan-${plan.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{plan.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {plan.description}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="bg-primary">
                        <Trophy className="h-3 w-3 mr-1" />
                        {t.plans.completed}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t.plans.completedOn} {new Date(plan.completedAt!).toLocaleDateString(language)}
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
