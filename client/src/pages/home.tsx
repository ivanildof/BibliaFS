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
          <Card className="glass border-0 rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-800 to-slate-800 shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-bold">Atividade Recente</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center p-8 rounded-xl bg-muted/20 border border-dashed border-muted-foreground/20"
                >
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">Nenhuma atividade recente encontrada</p>
                    <p className="text-xs text-muted-foreground/60">Comece a ler a Bíblia para ver seu progresso aqui</p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
