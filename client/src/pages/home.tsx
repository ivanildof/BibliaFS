import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  MessageSquare, 
  Users, 
  Brain,
  Headphones,
  Sparkles,
  Calendar,
  ChevronRight,
  Flame,
  GraduationCap,
  Loader2
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

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery<any[]>({
    queryKey: ["/api/activity/recent"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: GraduationCap, label: "Modo Professor", href: "/teacher", gradient: "from-blue-800 to-slate-800" },
    { icon: MessageSquare, label: "Nova Oração", href: "/prayers", gradient: "from-rose-400 to-pink-500" },
    { icon: Headphones, label: "Ouvir Podcast", href: "/podcasts", gradient: "from-teal-400 to-emerald-500" },
    { icon: Users, label: "Comunidade", href: "/community", gradient: "from-amber-400 to-orange-500" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">Bem-vindo de volta</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-welcome">
            {user?.firstName || "Estudante"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Continue sua jornada espiritual hoje
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AISearch />
        </motion.div>

        <motion.div variants={itemVariants}>
          <GamificationBanner />
        </motion.div>

        <motion.div variants={itemVariants}>
          <DailyVerse />
        </motion.div>

        {currentPlan && (
          <motion.div variants={itemVariants}>
            <Card className="relative glass border-0 overflow-hidden rounded-2xl">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50" />
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Leitura de Hoje</CardTitle>
                      <CardDescription className="text-xs mt-0.5">{currentPlan.title}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-0 font-semibold px-3 py-1 rounded-full text-xs">
                    Dia {currentPlan.currentDay}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Progresso do Plano</span>
                    <span className="font-semibold text-primary">
                      {Math.round(((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    />
                  </div>
                </div>
                
                <Button size="lg" className="w-full rounded-xl font-semibold shadow-sm" asChild data-testid="button-continue-reading">
                  <Link href="/bible">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Continuar Leitura
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="font-semibold text-lg text-foreground">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="cursor-pointer border-0 glass hover-elevate rounded-2xl overflow-visible" data-testid={`card-quick-action-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-md`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="font-medium text-xs text-foreground">{action.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass border-0 rounded-3xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Atividade Recente</CardTitle>
                    <p className="text-[10px] text-muted-foreground font-medium">Seu histórico de atividades</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1 relative">
              <div className="space-y-3">
                {isLoadingActivity ? (
                  <div className="flex justify-center py-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <p className="text-xs text-muted-foreground">Carregando atividades...</p>
                    </div>
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/40 transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary/10 shadow-sm hover:shadow-md"
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${
                        item.type === 'read' ? 'from-blue-500 to-indigo-600 shadow-blue-500/20' :
                        item.type === 'prayer' ? 'from-rose-400 to-pink-500 shadow-rose-500/20' :
                        item.type === 'post' ? 'from-amber-400 to-orange-500 shadow-amber-500/20' :
                        'from-gray-400 to-gray-500 shadow-gray-500/20'
                      } shadow-lg ring-2 ring-white/10`}>
                        {item.type === 'read' ? <BookOpen className="h-5 w-5 text-white" /> :
                         item.type === 'prayer' ? <MessageSquare className="h-5 w-5 text-white" /> :
                         item.type === 'post' ? <Users className="h-5 w-5 text-white" /> :
                         <Sparkles className="h-5 w-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{item.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
                      </div>
                      <div className="p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <ChevronRight className="h-4 w-4 text-primary/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center p-10 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed border-muted-foreground/15"
                  >
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-indigo-500/40" />
                      </div>
                      <p className="text-sm text-foreground font-semibold mb-1">Nenhuma atividade recente</p>
                      <p className="text-xs text-muted-foreground max-w-[200px]">Comece a ler a Bíblia para ver seu progresso aqui</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
