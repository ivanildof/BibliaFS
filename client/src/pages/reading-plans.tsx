import { useState } from "react";
import { motion } from "framer-motion";
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
  Target,
  Sparkles
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 sm:py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 mb-12"
        >
          <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">LEITURA BÍBLICA</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#333333]" data-testid="text-page-title">
            {t.plans.title}
          </h1>
          <p className="text-sm text-[#666666]">
            {t.plans.subtitle}
          </p>
        </motion.div>
        
        <div className="flex justify-center mb-8">
          <Dialog open={isTemplatesDialogOpen} onOpenChange={setIsTemplatesDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-plan" className="whitespace-nowrap rounded-2xl shadow-md hover-elevate bg-[#FFA500] hover:bg-[#FF8C00] text-white border-0">
                <Plus className="h-5 w-5 mr-2" />
                {t.plans.startPlan}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl border-0 bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#333333]">Criar Plano de Leitura</DialogTitle>
                <DialogDescription className="text-base text-[#666666]">
                  Escolha um modelo pré-definido ou crie um plano customizado
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-2xl">
                  <TabsTrigger value="templates" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Modelos</TabsTrigger>
                  <TabsTrigger value="custom" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Customizado</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-6 mt-6">
              {templatesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#FFA500]" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {templates.map((template, idx) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover-elevate rounded-3xl border-none shadow-sm bg-[#FFD1DC]/30 ${
                          selectedTemplate?.id === template.id ? 'ring-2 ring-[#FFA500] bg-[#FFD1DC]/50' : ''
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                        data-testid={`card-template-${template.id}`}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg truncate text-[#333333]">{template.name}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2 text-[#666666]">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="rounded-full px-3 bg-white/50 text-[#333333]">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.duration} {t.plans.days}
                            </Badge>
                            {template.category && (
                              <Badge variant="outline" className="rounded-full px-3 border-[#FFA500]/30 text-[#FFA500]">
                                {template.category}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
                </TabsContent>

                <TabsContent value="custom" className="space-y-6 mt-6">
                  <div className="space-y-6 bg-[#FFDAB9]/30 p-6 rounded-3xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="version" className="text-sm font-medium text-[#333333]">Versão</Label>
                        <Select value={customVersion} onValueChange={setCustomVersion}>
                          <SelectTrigger id="version" data-testid="select-version" className="rounded-xl bg-white border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {BIBLE_VERSIONS.map(v => (
                              <SelectItem key={v} value={v}>{v.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="book" className="text-sm font-medium text-[#333333]">Livro</Label>
                        <Select value={customBook} onValueChange={setCustomBook}>
                          <SelectTrigger id="book" data-testid="select-book" className="rounded-xl bg-white border-0">
                            <SelectValue placeholder="Escolha um livro" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 rounded-xl">
                            {BIBLE_BOOKS.map(book => (
                              <SelectItem key={book} value={book}>{book}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start" className="text-sm font-medium text-[#333333]">Capítulo Inicial</Label>
                        <Input 
                          id="start" 
                          type="number" 
                          min="1" 
                          value={customStartChapter}
                          onChange={(e) => setCustomStartChapter(e.target.value)}
                          placeholder="Ex: 1"
                          className="rounded-xl bg-white border-0"
                          data-testid="input-start-chapter"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end" className="text-sm font-medium text-[#333333]">Capítulo Final</Label>
                        <Input 
                          id="end" 
                          type="number" 
                          min="1" 
                          value={customEndChapter}
                          onChange={(e) => setCustomEndChapter(e.target.value)}
                          placeholder="Ex: 5"
                          className="rounded-xl bg-white border-0"
                          data-testid="input-end-chapter"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="mt-8 gap-3 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTemplatesDialogOpen(false)}
                  data-testid="button-cancel"
                  className="rounded-xl border-slate-200"
                >
                  {t.common.cancel}
                </Button>
                {activeTab === "templates" ? (
                  <Button 
                    disabled={!selectedTemplate || createFromTemplateMutation.isPending}
                    onClick={() => selectedTemplate && createFromTemplateMutation.mutate(selectedTemplate.id)}
                    data-testid="button-start-plan"
                    className="rounded-xl shadow-md bg-[#FFA500] hover:bg-[#FF8C00] text-white border-0"
                  >
                    {createFromTemplateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {createFromTemplateMutation.isPending ? t.plans.starting : t.plans.startPlan}
                  </Button>
                ) : (
                  <Button
                    disabled={!customBook || !customStartChapter || !customEndChapter || createCustomPlanMutation.isPending}
                    onClick={() => createCustomPlanMutation.mutate()}
                    data-testid="button-create-custom"
                    className="rounded-xl shadow-md bg-[#FFA500] hover:bg-[#FF8C00] text-white border-0"
                  >
                    {createCustomPlanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {createCustomPlanMutation.isPending ? "Criando..." : "Criar Plano"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: t.plans.activePlans, val: activePlans.length, icon: BookOpen, tid: "text-active-plans", color: "text-[#FFA500]", bgColor: "bg-[#D6EAF8]" },
            { title: t.plans.completedPlans, val: completedPlans.length, icon: Check, tid: "text-completed-plans", color: "text-[#800080]", bgColor: "bg-[#E6E6FA]" },
            { title: t.plans.currentDay, val: activePlans[0]?.currentDay ?? 0, icon: Calendar, tid: "text-current-day", color: "text-[#FF8C00]", bgColor: "bg-[#FFDAB9]" }
          ].map((stat, idx) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <Card className={`rounded-3xl border-none shadow-sm ${stat.bgColor} group transition-all`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[#333333] opacity-70">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${stat.color}`} data-testid={stat.tid}>
                    {stat.val}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <section className="mb-16">
          <div className="bg-[#D6EAF8]/30 p-6 rounded-[2rem] border border-[#D6EAF8]/50 mb-12">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-[#333333]">
              <Sparkles className="h-5 w-5 text-[#FFA500]" />
              Como funcionam os planos?
            </h2>
            <p className="text-[#666666] leading-relaxed">
              Os planos de leitura ajudam você a manter uma constância no estudo bíblico. 
              Ao iniciar um plano, você recebe leituras diárias organizadas. Cada dia concluído 
              rende <strong>10 XP</strong> para sua evolução no aplicativo e mantém sua <strong>ofensiva (streak)</strong> ativa. 
              Você pode escolher modelos prontos ou criar seu próprio roteiro personalizado.
            </p>
          </div>

          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2 text-[#333333]">
            <TrendingUp className="h-6 w-6 text-[#FFA500]" />
            {t.plans.activePlans}
          </h2>
          
          {activePlans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="rounded-3xl border-none bg-slate-50">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm mb-6">
                    <BookOpen className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-[#333333]">{t.plans.noActivePlans}</h3>
                  <p className="text-[#666666] mb-8 max-w-sm">
                    {t.plans.choosePlanDescription}
                  </p>
                  <Button onClick={() => setIsTemplatesDialogOpen(true)} data-testid="button-start-first-plan" size="lg" className="rounded-2xl px-8 bg-[#FFA500] hover:bg-[#FF8C00] text-white border-0">
                    <Plus className="h-5 w-5 mr-2" />
                    {t.plans.startFirstPlan}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {activePlans.map((plan, planIdx) => {
                const currentDay = plan.currentDay ?? 1;
                const progress = (currentDay / plan.totalDays) * 100;
                const schedule = plan.schedule as Array<{ day: number; readings: any[]; isCompleted: boolean }>;
                const completedDays = schedule.filter(s => s.isCompleted).length;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + planIdx * 0.1 }}
                  >
                    <Card className="rounded-[2.5rem] border-none bg-white shadow-md overflow-hidden transition-all" data-testid={`card-plan-${plan.id}`}>
                      <CardHeader className="pb-4 bg-[#FFD1DC]/10">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl sm:text-2xl mb-2 text-[#333333]">{plan.title}</CardTitle>
                            <CardDescription className="text-sm line-clamp-2 text-[#666666]">
                              {plan.description}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="rounded-full px-4 py-1 bg-[#FFA500]/10 text-[#FFA500] border-none text-sm font-semibold">
                            <Target className="h-3 w-3 mr-1.5" />
                            {t.plans.day} {currentDay}/{plan.totalDays}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        <div className="bg-slate-50 p-4 rounded-[1.5rem]">
                          <div className="flex justify-between text-sm font-bold mb-3">
                            <span className="text-[#666666]">{t.plans.progress}</span>
                            <span className="text-[#800080]">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-3 rounded-full bg-slate-200" />
                          <div className="flex items-center justify-between text-xs mt-3 text-[#666666]">
                            <span>{completedDays} dias concluídos</span>
                            <span>{plan.totalDays - completedDays} restantes</span>
                          </div>
                        </div>
                        
                        {schedule[currentDay - 1] && !schedule[currentDay - 1].isCompleted && (
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm font-bold text-[#666666] uppercase tracking-wider mb-4">{t.plans.todayReading}</p>
                            <div className="grid gap-2">
                              {schedule[currentDay - 1].readings.map((reading: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-[#D6EAF8]/20 border border-[#D6EAF8]/30">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {idx + 1}
                                  </div>
                                  <p className="text-base font-semibold">
                                    {getBookName(reading.book, language)} {reading.chapter}
                                    {reading.verses ? `:${reading.verses}` : ''}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-2 pb-6 px-6">
                        <Button 
                          size="lg"
                          className="w-full rounded-2xl h-12 text-base font-bold shadow-lg shadow-primary/20"
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
                              <Check className="h-5 w-5 mr-2" />
                              {t.plans.dayCompleted}
                            </>
                          ) : (
                            t.plans.markDayComplete
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {completedPlans.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              {t.plans.completedPlans}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {completedPlans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                >
                  <Card key={plan.id} className="rounded-[2rem] border-none bg-muted/20 backdrop-blur-sm shadow-sm opacity-80" data-testid={`card-completed-plan-${plan.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{plan.title}</CardTitle>
                          <CardDescription className="text-sm line-clamp-1">
                            {plan.description}
                          </CardDescription>
                        </div>
                        <Badge variant="default" className="rounded-full px-3 bg-amber-500">
                          <Trophy className="h-3 w-3 mr-1" />
                          {t.plans.completed}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Concluído em {new Date(plan.completedAt!).toLocaleDateString(language)}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
