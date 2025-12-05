import { useState } from "react";
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
  Printer
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
        <p>© 2025 BíbliaFS. Desenvolvido por FabriSite</p>
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

// Form schema - simplified for lesson creation
const formSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  scriptureBase: z.string().min(1, "Digite o texto-base"),
});

type FormData = z.infer<typeof formSchema>;

export default function Teacher() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/teacher/lessons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/lessons"] });
      setIsCreateDialogOpen(false);
      form.reset();
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
    createMutation.mutate(data);
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
        <div className="max-w-7xl mx-auto p-6">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              {t.teacherMode.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              Crie e gerencie aulas bíblicas
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-lesson">
                <Plus className="h-5 w-5 mr-2" />
                {t.teacherMode.new_lesson}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Aula</DialogTitle>
                <DialogDescription>
                  Monte uma aula completa com objetivos, perguntas e recursos
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="max-h-[60vh] overflow-y-auto px-1 space-y-4">
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
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel-lesson"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      data-testid="button-save-lesson"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Aula"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
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

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lessons" data-testid="tab-lessons">
              Minhas Aulas ({lessons.length})
            </TabsTrigger>
            <TabsTrigger value="students" data-testid="tab-students">
              {t.teacherMode.students}
            </TabsTrigger>
            <TabsTrigger value="calendar" data-testid="tab-calendar">
              Calendário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
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
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Draft Lessons */}
                {draftLessons.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Rascunhos</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {draftLessons.map((lesson) => (
                        <Card key={lesson.id} className="border-dashed">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="mb-2">{lesson.title}</CardTitle>
                              <Badge variant="secondary">Rascunho</Badge>
                            </div>
                          </CardHeader>
                          <CardFooter>
                            <Button variant="outline" className="w-full">
                              Continuar Editando
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>{t.teacherMode.progress} dos {t.teacherMode.students}</CardTitle>
                <CardDescription>Acompanhe o desempenho da turma</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop: Table view */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.teacherMode.students.slice(0, -1)}</TableHead>
                        <TableHead>Aulas Concluídas</TableHead>
                        <TableHead>Média de Notas</TableHead>
                        <TableHead>Última Atividade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">João Silva</TableCell>
                        <TableCell>8/10</TableCell>
                        <TableCell>92%</TableCell>
                        <TableCell className="text-muted-foreground">Há 2 dias</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Maria Santos</TableCell>
                        <TableCell>10/10</TableCell>
                        <TableCell>95%</TableCell>
                        <TableCell className="text-muted-foreground">Ontem</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Pedro Costa</TableCell>
                        <TableCell>6/10</TableCell>
                        <TableCell>78%</TableCell>
                        <TableCell className="text-muted-foreground">Há 1 semana</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile: Card view */}
                <div className="md:hidden space-y-4">
                  <Card className="hover-elevate">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">João Silva</h4>
                        <Badge variant="secondary">92%</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Aulas</p>
                          <p className="font-medium">8/10</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Última atividade</p>
                          <p className="font-medium">Há 2 dias</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">Maria Santos</h4>
                        <Badge variant="default">95%</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Aulas</p>
                          <p className="font-medium">10/10</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Última atividade</p>
                          <p className="font-medium">Ontem</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">Pedro Costa</h4>
                        <Badge variant="outline">78%</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Aulas</p>
                          <p className="font-medium">6/10</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Última atividade</p>
                          <p className="font-medium">Há 1 semana</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full sm:w-auto" data-testid="button-export-students">
                  <Download className="h-4 w-4 mr-2" />
                  {t.teacherMode.export_report}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Aulas Agendadas</CardTitle>
                <CardDescription>Próximas aulas programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg shrink-0">
                      <span className="text-2xl font-bold text-primary">24</span>
                      <span className="text-xs text-muted-foreground">JAN</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">O Sermão do Monte</h4>
                      <p className="text-sm text-muted-foreground mb-2">Mateus 5-7</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        19:00 - 20:30
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
