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

  const { data: stats } = useQuery<{ communityPosts: string | number }>({
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
    { icon: Brain, label: "Modo Professor", href: "/teacher", color: "bg-gradient-to-br from-purple-500 to-indigo-600" },
    { icon: MessageSquare, label: "Nova Oração", href: "/prayers", color: "bg-gradient-to-br from-blue-500 to-purple-500" },
    { icon: Headphones, label: "Ouvir Podcast", href: "/podcasts", color: "bg-gradient-to-br from-emerald-500 to-teal-500" },
    { icon: Users, label: "Comunidade", href: "/community", color: "bg-gradient-to-br from-amber-400 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-background to-amber-50/30 dark:from-purple-950/30 dark:via-background dark:to-amber-950/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold gradient-text leading-tight" data-testid="text-welcome">
            Bem-vindo, {user?.firstName || "estudante"}!
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Continue sua jornada espiritual hoje
          </p>
        </div>

        {/* Daily Verse */}
        <DailyVerse />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="premium-card bg-white/90 dark:bg-card/90 border-purple-200/50 dark:border-purple-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Sequência de Leitura</CardTitle>
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold gradient-text" data-testid="text-reading-streak">
                {readingStreak} dias
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Continue lendo para manter sua sequência!
              </p>
            </CardContent>
          </Card>

          <Card className="premium-card bg-white/90 dark:bg-card/90 border-purple-200/50 dark:border-purple-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Nível Espiritual</CardTitle>
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg">
                <Award className="h-4 w-4 text-purple-900" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-level">
                {levelLabels[level]}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {user?.experiencePoints || 0} XP
              </p>
            </CardContent>
          </Card>

          <Card className="premium-card bg-white/90 dark:bg-card/90 border-purple-200/50 dark:border-purple-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Atividade Comunitária</CardTitle>
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-community-count">
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
                    {Math.round(((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100} 
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
          <h2 className="font-display text-2xl font-bold">Ações <span className="gradient-text">Rápidas</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="cursor-pointer border-purple-200/50 dark:border-purple-800/30 bg-white/90 dark:bg-card/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" data-testid={`card-quick-action-${index}`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`${action.color} p-4 rounded-xl shadow-lg`}>
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
        <Card className="premium-card bg-white/90 dark:bg-card/90 border-purple-200/50 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Você leu Salmos 23</p>
                  <p className="text-xs text-muted-foreground">Há 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Nova oração registrada</p>
                  <p className="text-xs text-muted-foreground">Ontem</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                  <Users className="h-5 w-5 text-white" />
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
