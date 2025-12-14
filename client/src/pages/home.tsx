import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  MessageSquare, 
  Users, 
  Brain,
  Headphones,
  Sparkles,
  TrendingUp,
  Calendar,
  Award
} from "lucide-react";
import { Link } from "wouter";
import type { ReadingPlan } from "@shared/schema";
import { DailyVerse } from "@/components/DailyVerse";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autenticado",
        description: "Redirecionando para login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/dashboard"],
    enabled: isAuthenticated,
  });

  const { data: currentPlan } = useQuery<ReadingPlan>({
    queryKey: ["/api/reading-plans/current"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const readingStreak = user?.readingStreak || 0;
  const level = user?.level || "iniciante";
  const levelLabels: Record<string, string> = {
    iniciante: "Iniciante",
    crescendo: "Crescendo",
    discipulo: "Discípulo",
    professor: "Professor",
  };

  const quickActions = [
    { icon: Brain, label: "Perguntar à IA", href: "/ai-study", color: "bg-purple-500" },
    { icon: MessageSquare, label: "Nova Oração", href: "/prayers", color: "bg-blue-500" },
    { icon: Headphones, label: "Ouvir Podcast", href: "/podcasts", color: "bg-green-500" },
    { icon: Users, label: "Comunidade", href: "/community", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-welcome">
            Bem-vindo, {user?.firstName || "estudante"}!
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Continue sua jornada espiritual hoje
          </p>
        </div>

        {/* Daily Verse */}
        <DailyVerse />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="hover-elevate bg-gradient-to-br from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-900/30 backdrop-blur-sm border-white/40 dark:border-slate-700/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sequência de Leitura</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-reading-streak">
                {readingStreak} dias
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Continue lendo para manter sua sequência!
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate bg-gradient-to-br from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-900/30 backdrop-blur-sm border-white/40 dark:border-slate-700/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível Espiritual</CardTitle>
              <div className="p-2 rounded-lg bg-accent/10">
                <Award className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold" data-testid="text-level">
                {levelLabels[level]}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {user?.experiencePoints || 0} XP
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate bg-gradient-to-br from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-900/30 backdrop-blur-sm border-white/40 dark:border-slate-700/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividade Comunitária</CardTitle>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold" data-testid="text-community-count">
                {stats?.communityPosts || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Publicações
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Reading Plan */}
        {currentPlan && (
          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-900/40 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                    Leitura de Hoje
                  </CardTitle>
                  <CardDescription className="mt-1">{currentPlan.title}</CardDescription>
                </div>
                <Badge variant="secondary" data-testid="badge-plan-day" className="whitespace-nowrap">
                  Dia {currentPlan.currentDay}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso do Plano</span>
                  <span className="font-medium">
                    {Math.round((currentPlan.currentDay / (currentPlan.schedule?.length || 1)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(currentPlan.currentDay / (currentPlan.schedule?.length || 1)) * 100} 
                  className="h-2"
                />
              </div>
              
              <Button className="w-full" asChild data-testid="button-continue-reading">
                <Link href="/bible">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Continuar Leitura
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Ações Rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-quick-action-${index}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`${action.color} p-4 rounded-full`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-medium">{action.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-r from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-900/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Você leu Salmos 23</p>
                  <p className="text-xs text-muted-foreground">Há 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Nova oração registrada</p>
                  <p className="text-xs text-muted-foreground">Ontem</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Você publicou na comunidade</p>
                  <p className="text-xs text-muted-foreground">Há 3 dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
