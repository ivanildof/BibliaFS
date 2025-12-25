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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  GraduationCap, 
  Plus, 
  Calendar,
  Users,
  FileText,
  Download,
  BarChart,
  BookOpen,
  CheckCircle2,
  Loader2,
  Clock,
  Printer,
  Sparkles,
  Trash2,
  HelpCircle,
  Brain,
  MessageSquare
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { type Lesson } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';

const exportLessonToPDF = (lesson: Lesson) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const objectives = lesson.objectives || [];
  const quizQuestions = lesson.questions || [];
  const scriptureRef = lesson.scriptureReferences?.[0];

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${lesson.title} - BíbliaFS</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Georgia', serif; 
          line-height: 1.6; 
          padding: 40px; 
          max-width: 800px; 
          margin: 0 auto;
          color: #1a1a1a;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #5711D9; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .logo { 
          font-size: 24px; 
          font-weight: bold; 
          color: #5711D9; 
          margin-bottom: 10px; 
        }
        h1 { 
          font-size: 28px; 
          color: #1a1a1a; 
          margin-bottom: 10px; 
        }
        .scripture-base { 
          font-size: 18px; 
          color: #5711D9; 
          font-style: italic; 
        }
        .section { 
          margin-bottom: 25px; 
        }
        .section-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: #5711D9; 
          border-bottom: 1px solid #e0e0e0; 
          padding-bottom: 5px; 
          margin-bottom: 10px; 
        }
        .description { 
          font-size: 14px; 
          color: #444; 
        }
        ul { 
          padding-left: 20px; 
        }
        li { 
          margin-bottom: 8px; 
        }
        .quiz-question { 
          background: #f5f5f5; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 10px; 
        }
        .quiz-number { 
          font-weight: bold; 
          color: #5711D9; 
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          font-size: 12px; 
          color: #888; 
          border-top: 1px solid #e0e0e0; 
          padding-top: 20px; 
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">BíbliaFS</div>
        <h1>${lesson.title}</h1>
        ${scriptureRef ? `<div class="scripture-base">${scriptureRef.book} ${scriptureRef.chapter}${scriptureRef.verses ? ':' + scriptureRef.verses : ''}</div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Descrição</div>
        <p class="description">${lesson.description || 'Sem descrição'}</p>
      </div>

      ${objectives.length > 0 ? `
        <div class="section">
          <div class="section-title">Objetivos da Aula</div>
          <ul>
            ${objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${quizQuestions.length > 0 ? `
        <div class="section">
          <div class="section-title">Perguntas para Reflexão</div>
          ${quizQuestions.map((q: any, i: number) => `
            <div class="quiz-question">
              <span class="quiz-number">${i + 1}.</span> ${q.question || q}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="footer">
        <p>Material gerado pelo BíbliaFS | www.bibliafs.app</p>
        <p>© 2026 - BíbliaFS. Todos os direitos reservados. Desenvolvido por | <a href="https://fabrisite.com.br/" target="_blank">FabriSite</a></p>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Form schema - complete lesson creation
const formSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  scriptureBase: z.string().min(1, "Digite o texto-base"),
  duration: z.number().min(15, "Mínimo 15 minutos").max(300, "Máximo 300 minutos").optional(),
  objectives: z.array(z.string()).optional(),
  discussionQuestions: z.array(z.string()).optional(),
  applicationPoints: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Teacher() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const isFreeUser = user?.subscriptionPlan === "free";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");
  const [contentBlocks, setContentBlocks] = useState<Array<{title: string; content: string}>>([]);
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [newBlockContent, setNewBlockContent] = useState("");
  const [questions, setQuestions] = useState<Array<{question: string; answer: string}>>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [expandedAnswerIndex, setExpandedAnswerIndex] = useState<number | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [currentTab, setCurrentTab] = useState<"lessons" | "assistant">("lessons");
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [assistantInput, setAssistantInput] = useState("");
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [conversationsUsed, setConversationsUsed] = useState(0);
  const [conversationsLimit, setConversationsLimit] = useState(0);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [userPlan, setUserPlan] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const objectivesRef = useRef<HTMLDivElement>(null);

  const { data: lessons = [], isLoading, error } = useQuery<Lesson[]>({
    queryKey: ["/api/teacher/lessons"],
    retry: 2,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      scriptureBase: "",
      duration: 50,
      objectives: [],
      discussionQuestions: [],
      applicationPoints: [],
    },
  });

  const addObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const addContentBlock = () => {
    if (newBlockTitle.trim() && newBlockContent.trim()) {
      setContentBlocks([...contentBlocks, { title: newBlockTitle.trim(), content: newBlockContent.trim() }]);
      setNewBlockTitle("");
      setNewBlockContent("");
    }
  };

  const removeContentBlock = (index: number) => {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, { question: newQuestion.trim(), answer: newAnswer.trim() || "Resposta será preenchida aqui" }]);
      setNewQuestion("");
      setNewAnswer("");
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [assistantMessages]);

  const handleAssistantSubmit = async () => {
    if (!assistantInput.trim()) return;
    
    // Check if limit is reached
    if (limitReached) {
      let message = "Você atingiu o limite de conversas.";
      
      if (userPlan === "free") {
        message = "Você atingiu o limite de 3 conversas por dia. Assine um plano premium para mais conversas.";
      } else if (userPlan === "monthly" || userPlan === "annual" || userPlan === "yearly") {
        message = "Você atingiu o limite mensal de conversas. Faça upgrade para Premium Plus.";
      } else if (userPlan === "premium_plus") {
        message = "Você atingiu o limite mensal de conversas. Entre em contato para um plano customizado.";
      }
      
      toast({
        title: "Limite atingido",
        description: message,
        variant: "destructive",
      });
      return;
    }

    const userMessage = { role: "user" as const, content: assistantInput };
    const questionToSend = assistantInput;
    
    setAssistantMessages(prev => [...prev, userMessage]);
    setAssistantInput("");
    setIsAssistantLoading(true);

    try {
      const res = await apiRequest("POST", "/api/teacher/ask-assistant", { question: questionToSend, context: "Aula bíblica" });
      const data = await res.json();
      console.log("Resposta do assistente:", data);
      
      if (data.limitReached) {
        setLimitReached(true);
        throw new Error("Você atingiu o limite de conversas.");
      }
      
      if (!data || !data.answer) {
        console.error("Resposta inválida:", data);
        throw new Error("Resposta vazia do assistente - tente novamente");
      }
      
      // Update conversation counter and plan info for all users
      if (data.conversationsUsed !== undefined) {
        setConversationsUsed(data.conversationsUsed);
        if (data.conversationsLimit) {
          setConversationsLimit(data.conversationsLimit);
        }
        if (data.plan) {
          setUserPlan(data.plan);
        }
        
        // Show warning at 75% of limit
        if (data.conversationsLimit && data.conversationsUsed >= Math.floor(data.conversationsLimit * 0.75)) {
          if (!showLimitWarning) {
            setShowLimitWarning(true);
            const remaining = data.conversationsLimit - data.conversationsUsed;
            let upgradeMessage = "";
            
            if (data.plan === "free") {
              upgradeMessage = "Assine um plano premium para mais conversas.";
            } else if (data.plan === "monthly" || data.plan === "annual" || data.plan === "yearly") {
              upgradeMessage = "Faça upgrade para Premium Plus para aumentar seu limite.";
            } else if (data.plan === "premium_plus") {
              upgradeMessage = "Entre em contato para um plano customizado.";
            }
            
            toast({
              title: `Próximo do limite (${remaining} conversas restantes)`,
              description: upgradeMessage,
            });
          }
        }
      }
      
      setAssistantMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error: any) {
      console.error("Erro no assistente:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível consultar o assistente IA",
        variant: "destructive",
      });
      setAssistantMessages(prev => prev.slice(0, -1));
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const generateWithAI = async () => {
    const title = form.getValues("title");
    const scriptureBase = form.getValues("scriptureBase");
    const duration = form.getValues("duration") || 50;
    
    if (!title || !scriptureBase) {
      toast({
        title: "Preencha os campos",
        description: "Digite o título e texto-base para gerar conteúdo com IA",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      const res = await apiRequest("POST", "/api/teacher/generate-lesson-content", { title, scriptureBase, duration });
      const data = await res.json();
      
      if (data.description) form.setValue("description", data.description);
      if (data.objectives?.length) setObjectives(data.objectives);
      if (data.contentBlocks?.length) setContentBlocks(data.contentBlocks);
      if (data.questions?.length) {
        // Convert questions to {question, answer} format if needed
        const formattedQuestions = data.questions.map((q: any) => 
          typeof q === 'string' ? { question: q, answer: "" } : q
        );
        setQuestions(formattedQuestions);
      }

      // Scroll para mostrar conteúdo gerado
      setTimeout(() => {
        objectivesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);

      toast({
        title: "Conteúdo gerado!",
        description: "A IA sugeriu objetivos e perguntas para sua aula",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar",
        description: error.message || "Tente novamente ou preencha manualmente",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const lessonData = {
        ...data,
        objectives,
        contentBlocks,
        questions: questions.map((q, i) => ({
          id: `q-${i}`,
          question: typeof q === 'string' ? q : q.question,
          answer: typeof q === 'string' ? "" : q.answer,
          options: [],
          correctAnswer: -1,
        })),
      };
      const res = await apiRequest("POST", "/api/teacher/lessons", lessonData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/lessons"] });
      setIsCreateDialogOpen(false);
      form.reset();
      setObjectives([]);
      setContentBlocks([]);
      setQuestions([]);
      toast({
        title: "Aula criada!",
        description: "Sua aula foi salva com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar aula",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingLessonId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const lessonData = {
        ...data,
        objectives,
        contentBlocks,
        questions: questions.map((q, i) => ({
          id: `q-${i}`,
          question: typeof q === 'string' ? q : q.question,
          answer: typeof q === 'string' ? "" : q.answer,
          options: [],
          correctAnswer: -1,
        })),
      };
      const res = await apiRequest("PATCH", `/api/teacher/lessons/${editingLessonId}`, lessonData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/lessons"] });
      setEditingLessonId(null);
      setIsCreateDialogOpen(false);
      form.reset();
      setObjectives([]);
      setContentBlocks([]);
      setQuestions([]);
      toast({ title: "Aula atualizada!", description: "Alterações salvas com sucesso." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const res = await apiRequest("DELETE", `/api/teacher/lessons/${lessonId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/lessons"] });
      toast({ title: "Aula deletada!", description: "A aula foi removida com sucesso." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    },
  });

  const handleEditLesson = (lesson: Lesson) => {
    const scriptureBase = typeof lesson.scriptureReferences?.[0] === 'string' 
      ? lesson.scriptureReferences[0] 
      : lesson.scriptureReferences?.[0]?.verses || "";
    
    form.reset({
      title: lesson.title,
      description: lesson.description || "",
      scriptureBase,
    });
    setObjectives(lesson.objectives || []);
    setContentBlocks(lesson.contentBlocks || []);
    setQuestions((lesson.questions || []).map((q: any) => {
      if (typeof q === 'string') return { question: q, answer: "" };
      if (q.question) return { question: q.question, answer: q.answer || "" };
      return { question: "", answer: "" };
    }));
    setEditingLessonId(lesson.id);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (confirm("Tem certeza que deseja deletar esta aula?")) {
      deleteMutation.mutate(lessonId);
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingLessonId(null);
    form.reset();
    setObjectives([]);
    setContentBlocks([]);
    setQuestions([]);
    setNewBlockTitle("");
    setNewBlockContent("");
    setExpandedAnswerIndex(null);
  };

  const publishedLessons = lessons.filter(l => l.isPublished);
  const draftLessons = lessons.filter(l => !l.isPublished);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando aulas...</p>
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
        <div className="max-w-7xl mx-auto p-6 text-center">
          <p className="text-destructive">Erro ao carregar aulas</p>
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <GraduationCap className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Erro ao carregar aulas</h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar suas aulas. Tente novamente.
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
            <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              {t.teacherMode.title}
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </h1>
            <p className="text-lg text-muted-foreground">
              Crie aulas, gerencie estudantes e converse com IA
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => open ? setIsCreateDialogOpen(true) : handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-lesson" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                {t.teacherMode.new_lesson}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingLessonId ? "Editar Aula" : "Criar Nova Aula"}</DialogTitle>
                <DialogDescription>
                  Monte uma aula completa com objetivos, perguntas e recursos
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="max-h-[70vh] overflow-y-auto px-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.teacherMode.lesson_title}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: A Parábola do Filho Pródigo"
                              data-testid="input-lesson-title"
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
                              placeholder="Breve descrição do tema da aula..."
                              data-testid="textarea-lesson-description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="scriptureBase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto-Base</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Lucas 15:11-32"
                              data-testid="input-scripture-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Duração da Aula (minutos)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Ex: 50"
                              data-testid="input-lesson-duration"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              value={field.value || 50}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* AI Generation Button */}
                    <div className="flex justify-center pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateWithAI}
                        disabled={isGeneratingAI}
                        className="gap-2"
                        data-testid="button-generate-ai"
                      >
                        {isGeneratingAI ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Gerando com IA...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Gerar Conteúdo com IA
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Objectives Section */}
                    <div ref={objectivesRef} className="space-y-3 pt-4 border-t">
                      <FormLabel className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Objetivos da Aula
                      </FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Compreender o amor incondicional do Pai"
                          value={newObjective}
                          onChange={(e) => setNewObjective(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
                          data-testid="input-new-objective"
                        />
                        <Button type="button" onClick={addObjective} size="icon" variant="outline" data-testid="button-add-objective">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {objectives.length > 0 && (
                        <ul className="space-y-2">
                          {objectives.map((obj, i) => (
                            <li key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="flex-1 text-sm">{obj}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeObjective(i)}
                                className="h-6 w-6"
                                data-testid={`button-remove-objective-${i}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Content Blocks Section */}
                    <div className="space-y-3 pt-4 border-t">
                      <FormLabel className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Conteúdo da Aula (Blocos Principais)
                      </FormLabel>
                      <div className="space-y-2">
                        <Input
                          placeholder="Título do bloco (ex: A Incarnação de Cristo)"
                          value={newBlockTitle}
                          onChange={(e) => setNewBlockTitle(e.target.value)}
                          data-testid="input-block-title"
                        />
                        <Textarea
                          placeholder="Conteúdo do bloco (parágrafos com versículos, exemplos e aplicações)"
                          value={newBlockContent}
                          onChange={(e) => setNewBlockContent(e.target.value)}
                          className="min-h-24"
                          data-testid="textarea-block-content"
                        />
                        <Button type="button" onClick={addContentBlock} className="w-full gap-2" data-testid="button-add-block">
                          <Plus className="h-4 w-4" />
                          Adicionar Bloco de Conteúdo
                        </Button>
                      </div>
                      {contentBlocks.length > 0 && (
                        <ul className="space-y-2">
                          {contentBlocks.map((block, i) => (
                            <li key={i} className="p-3 bg-muted rounded-lg space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm mb-1">{block.title}</p>
                                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{block.content}</p>
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeContentBlock(i)}
                                  className="h-6 w-6 flex-shrink-0"
                                  data-testid={`button-remove-block-${i}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Discussion Questions Section */}
                    <div className="space-y-3 pt-4 border-t">
                      <FormLabel className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Perguntas para Discussão com Gabarito
                      </FormLabel>
                      <div className="space-y-2">
                        <Input
                          placeholder="Ex: O que significa ser um filho pródigo hoje?"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          data-testid="input-new-question"
                        />
                        <Textarea
                          placeholder="Resposta/Gabarito (2-3 frases com fundamentação bíblica)"
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          className="min-h-20"
                          data-testid="textarea-new-answer"
                        />
                        <Button type="button" onClick={addQuestion} className="w-full gap-2" data-testid="button-add-question">
                          <Plus className="h-4 w-4" />
                          Adicionar Pergunta e Resposta
                        </Button>
                      </div>
                      {questions.length > 0 && (
                        <ul className="space-y-2">
                          {questions.map((q, i) => (
                            <li key={i} className="p-3 bg-muted rounded-lg space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium">{q.question}</p>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedAnswerIndex(expandedAnswerIndex === i ? null : i)}
                                    className="text-xs h-6"
                                    data-testid={`button-toggle-answer-${i}`}
                                  >
                                    {expandedAnswerIndex === i ? "Ocultar Resposta" : "Ver Resposta"}
                                  </Button>
                                  {expandedAnswerIndex === i && (
                                    <div className="p-2 bg-background rounded text-sm mt-2 border-l-2 border-primary">
                                      {q.answer}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeQuestion(i)}
                                  className="h-6 w-6 flex-shrink-0"
                                  data-testid={`button-remove-question-${i}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCloseDialog}
                      data-testid="button-cancel-lesson"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-lesson"
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        editingLessonId ? "Atualizar Aula" : "Salvar Aula"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as "lessons" | "assistant")} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="lessons" data-testid="tab-lessons" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all py-3">
              <BookOpen className="h-4 w-4 mr-2" />
              Minhas Aulas
            </TabsTrigger>
            <TabsTrigger value="assistant" data-testid="tab-assistant" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all py-3">
              <Brain className="h-4 w-4 mr-2" />
              Assistente IA Teológico
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Assistant Tab */}
        {currentTab === "assistant" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Assistente IA Teológico
              </CardTitle>
              <CardDescription>
                Faça perguntas sobre conteúdo bíblico, métodos de ensino e planejamento de aulas
              </CardDescription>
              {conversationsUsed > 0 && conversationsLimit > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Conversas usadas: <span className={conversationsUsed >= Math.floor(conversationsLimit * 0.75) ? "text-destructive font-bold" : ""}>{conversationsUsed}</span> / {conversationsLimit}
                  </p>
                  {showLimitWarning && !limitReached && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                      {userPlan === "free" && "⚠️ Você está próximo do limite. Assine um plano premium."}
                      {(userPlan === "monthly" || userPlan === "annual" || userPlan === "yearly") && "⚠️ Você está próximo do limite. Faça upgrade para Premium Plus."}
                      {userPlan === "premium_plus" && "⚠️ Você está próximo do limite. Entre em contato para um plano customizado."}
                    </p>
                  )}
                  {limitReached && (
                    <p className="text-xs text-destructive mt-2">
                      {userPlan === "free" && "❌ Limite atingido. Assine um plano."}
                      {(userPlan === "monthly" || userPlan === "annual" || userPlan === "yearly") && "❌ Limite atingido. Faça upgrade para Premium Plus."}
                      {userPlan === "premium_plus" && "❌ Limite atingido. Entre em contato para plano customizado."}
                    </p>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat Area */}
                <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-muted/30 space-y-3">
                  {assistantMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p className="text-center">
                        Comece perguntando algo sobre educação bíblica, pedagogia ou conteúdo...
                      </p>
                    </div>
                  ) : (
                    <>
                      {assistantMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-md px-4 py-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-background border"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isAssistantLoading && (
                        <div className="flex justify-start">
                          <div className="bg-background border px-4 py-2 rounded-lg">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Faça uma pergunta..."
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAssistantSubmit()}
                    disabled={isAssistantLoading}
                    data-testid="input-assistant-question"
                  />
                  <Button
                    onClick={handleAssistantSubmit}
                    disabled={isAssistantLoading || !assistantInput.trim()}
                    size="icon"
                    data-testid="button-send-question"
                  >
                    {isAssistantLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {currentTab === "lessons" && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-total-lessons">
                {lessons.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aulas Publicadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {publishedLessons.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.teacherMode.students} Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                24
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                87%
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Lessons List */}
        {currentTab === "lessons" && (
          <>
            {lessons.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhuma aula criada</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie sua primeira aula para começar a ensinar
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Aula
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Published Lessons */}
                {publishedLessons.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Publicadas</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {publishedLessons.map((lesson) => (
                        <Card key={lesson.id} className="hover-elevate" data-testid={`card-lesson-${lesson.id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="mb-2">{lesson.title}</CardTitle>
                                <CardDescription>{lesson.description}</CardDescription>
                              </div>
                              <Badge className="bg-green-500/10 text-green-700">Publicada</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                {lesson.scriptureReferences?.[0]?.book} {lesson.scriptureReferences?.[0]?.chapter}
                              </div>
                              {lesson.scheduledFor && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  Agendada
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                12 alunos participando
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="gap-2">
                            <Button variant="outline" size="sm">
                              <BarChart className="h-4 w-4 mr-2" />
                              Ver {t.teacherMode.progress}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => exportLessonToPDF(lesson)}
                              data-testid="button-export-pdf"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditLesson(lesson)}
                              data-testid={`button-edit-lesson-${lesson.id}`}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-destructive"
                              data-testid={`button-delete-lesson-${lesson.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Draft Lessons */}
                {draftLessons.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Rascunhos ({draftLessons.length})</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {draftLessons.map((lesson) => (
                        <Card key={lesson.id} className="border-dashed">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="mb-2">{lesson.title}</CardTitle>
                              <Badge variant="secondary">Rascunho</Badge>
                            </div>
                          </CardHeader>
                          <CardFooter className="gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleEditLesson(lesson)}
                              data-testid={`button-edit-draft-${lesson.id}`}
                            >
                              Continuar Editando
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-destructive"
                              data-testid={`button-delete-draft-${lesson.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
