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
  Calendar,
  TrendingUp,
  Award,
  ChevronRight,
  Flame
} from "lucide-react";
import { Link } from "wouter";
import type { ReadingPlan } from "@shared/schema";
import { DailyVerse } from "@/components/DailyVerse";
import { GamificationBanner } from "@/components/GamificationBanner";
import { AISearch } from "@/components/AISearch";
import { motion } from "framer-motion";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
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
    { icon: Brain, label: "Modo Professor", href: "/teacher", color: "from-purple-500 to-indigo-600", iconColor: "text-white" },
    { icon: MessageSquare, label: "Nova Oração", href: "/prayers", color: "from-pink-500 to-rose-500", iconColor: "text-white" },
    { icon: Headphones, label: "Ouvir Podcast", href: "/podcasts", color: "from-emerald-500 to-teal-500", iconColor: "text-white" },
    { icon: Users, label: "Comunidade", href: "/community", color: "from-amber-400 to-orange-500", iconColor: "text-white" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Welcome Header - More Premium */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Bem-vindo de volta</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight" data-testid="text-welcome">
            {user?.firstName || "Estudante"}
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Continue sua jornada espiritual hoje
          </p>
        </motion.div>

        {/* AI Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AISearch />
        </motion.div>

        {/* Gamification Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GamificationBanner />
        </motion.div>

        {/* Daily Verse */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DailyVerse />
        </motion.div>

        {/* Stats Overview - Premium Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm hover:shadow-xl transition-all duration-500 rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Flame className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                  +5 hoje
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground" data-testid="text-reading-streak">
                  {readingStreak}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  dias de sequência
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-amber-500/5 backdrop-blur-sm hover:shadow-xl transition-all duration-500 rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none font-bold">
                  {user?.experiencePoints || 0} XP
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground" data-testid="text-level">
                  {levelLabels[level]}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  nível espiritual
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 backdrop-blur-sm hover:shadow-xl transition-all duration-500 rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground" data-testid="text-community-count">
                  {stats?.communityPosts || 0}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  publicações
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Reading Plan - Premium Design */}
        {currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden border-none bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm rounded-3xl">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Leitura de Hoje</CardTitle>
                      <CardDescription className="mt-0.5 font-medium">{currentPlan.title}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground font-bold px-4 py-1.5 rounded-full text-sm">
                    Dia {currentPlan.currentDay}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground font-medium">Progresso do Plano</span>
                    <span className="font-bold text-primary">
                      {Math.round(((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-primary/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                      style={{ width: `${((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                
                <Button className="w-full h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild data-testid="button-continue-reading">
                  <Link href="/bible">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Continuar Leitura
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions - Premium Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-5"
        >
          <h2 className="font-display text-2xl font-bold text-foreground">
            Ações <span className="text-primary">Rápidas</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="group cursor-pointer border-none bg-card/40 backdrop-blur-sm hover:bg-card/60 shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden" data-testid={`card-quick-action-${index}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className={`h-7 w-7 ${action.iconColor}`} />
                      </div>
                      <p className="font-semibold text-sm text-foreground">{action.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-none bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Atividade Recente</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { icon: BookOpen, text: "Você leu Salmos 23", time: "Há 2 horas", color: "from-purple-500 to-indigo-600" },
                  { icon: MessageSquare, text: "Nova oração registrada", time: "Ontem", color: "from-pink-500 to-rose-500" },
                  { icon: Users, text: "Você publicou na comunidade", time: "Há 3 dias", color: "from-amber-400 to-orange-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-md`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{item.text}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
