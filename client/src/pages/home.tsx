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
  Loader2,
  TrendingUp,
  Star,
  Zap,
  Crown,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import type { ReadingPlan } from "@shared/schema";
import { DailyVerse } from "@/components/DailyVerse";
import { GamificationBanner } from "@/components/GamificationBanner";
import { AISearch } from "@/components/AISearch";
import { motion, AnimatePresence } from "framer-motion";

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
          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Iniciando Experiência Premium...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: GraduationCap, label: "Modo Professor", href: "/teacher", gradient: "from-blue-700 to-indigo-900", shadow: "shadow-blue-500/30" },
    { icon: MessageSquare, label: "Nova Oração", href: "/prayers", gradient: "from-rose-500 to-pink-700", shadow: "shadow-rose-500/30" },
    { icon: Headphones, label: "Ouvir Podcast", href: "/podcasts", gradient: "from-teal-500 to-emerald-700", shadow: "shadow-teal-500/30" },
    { icon: Users, label: "Comunidade", href: "/community", gradient: "from-amber-500 to-orange-700", shadow: "shadow-amber-500/30" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-200/40 dark:bg-slate-700/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100/50 dark:bg-slate-800/40 blur-3xl" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
            <Crown className="h-8 w-8 text-amber-500 fill-amber-500/30 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)] animate-pulse" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
          </div>
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] drop-shadow-sm">RECONHECIMENTO DE USUÁRIO</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black bg-gradient-to-r from-foreground via-primary/80 to-foreground bg-clip-text text-transparent" data-testid="text-welcome">
            Olá, {user?.firstName || "Estudante"}
          </h1>
          <p className="text-base text-muted-foreground font-medium">
            Sua jornada espiritual continua com força total hoje.
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
            <Card className="relative premium-card border-none overflow-hidden rounded-[2rem] group hover:shadow-primary/20 transition-all duration-500 ring-2 ring-primary/20 hover:ring-primary/40">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary to-indigo-600" />
              <CardHeader className="pb-4 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary to-indigo-700 shadow-xl shadow-primary/20">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight">Leitura de Hoje</CardTitle>
                      <CardDescription className="text-sm font-bold opacity-70 mt-0.5 uppercase tracking-wider">{currentPlan.title}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-indigo-600 text-white border-none font-black px-6 py-2 rounded-full text-xs shadow-lg shadow-primary/20 transform hover:scale-105 transition-transform">
                    DIA {currentPlan.currentDay}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-2 relative">
                <div className="bg-muted/30 p-6 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-3 font-black uppercase tracking-widest text-muted-foreground">
                    <span>PROGRESSO DO PLANO</span>
                    <span className="text-primary">
                      {Math.round(((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-full shadow-lg"
                    />
                  </div>
                </div>
                
                <Button size="lg" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all bg-gradient-to-r from-primary to-indigo-700 border-0" asChild data-testid="button-continue-reading">
                  <Link href="/bible">
                    <BookOpen className="mr-3 h-5 w-5" />
                    CONTINUAR LEITURA
                    <ChevronRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-1 bg-primary rounded-full" />
             <h2 className="font-black text-xl text-foreground tracking-tight uppercase">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="cursor-pointer border-none premium-card hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 rounded-[1.75rem] overflow-visible group ring-2 ring-primary/10 hover:ring-primary/30" data-testid={`card-quick-action-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-2xl ${action.shadow} transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-black text-xs text-foreground uppercase tracking-widest">{action.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="premium-card border-none rounded-[2.5rem] overflow-hidden ring-2 ring-indigo-500/20 hover:ring-indigo-500/40 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20" />
            <CardHeader className="p-8 pb-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 shadow-2xl shadow-indigo-500/50 animate-pulse">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-primary to-purple-500 bg-clip-text text-transparent tracking-tighter">Atividade Recente</CardTitle>
                    <p className="text-xs text-primary font-black uppercase tracking-[0.3em] mt-1">Sua Trilha de Evolução Exclusiva</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-2 relative">
              <div className="space-y-5">
                {isLoadingActivity ? (
                  <div className="flex justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Sincronizando Suas Glórias...</p>
                    </div>
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 100 }}
                      className="flex items-center gap-6 p-6 rounded-[2rem] bg-gradient-to-r from-white/5 to-transparent hover:from-primary/20 hover:to-primary/5 transition-all duration-500 group cursor-pointer border border-white/5 hover:border-primary/30 shadow-lg hover:shadow-2xl"
                    >
                      <div className={`p-5 rounded-2xl bg-gradient-to-br ${
                        item.type === 'read' ? 'from-blue-600 to-indigo-900 shadow-blue-600/50' :
                        item.type === 'prayer' ? 'from-rose-600 to-pink-800 shadow-rose-600/50' :
                        item.type === 'post' ? 'from-amber-500 to-orange-800 shadow-amber-500/50' :
                        'from-slate-600 to-slate-900 shadow-slate-600/50'
                      } shadow-2xl ring-4 ring-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                        {item.type === 'read' ? <BookOpen className="h-6 w-6 text-white" /> :
                         item.type === 'prayer' ? <MessageSquare className="h-6 w-6 text-white" /> :
                         item.type === 'post' ? <Users className="h-6 w-6 text-white" /> :
                         <Sparkles className="h-6 w-6 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base text-foreground truncate group-hover:text-primary transition-colors tracking-tight">{item.text}</p>
                        <p className="text-xs font-black text-muted-foreground mt-1.5 uppercase tracking-widest opacity-80 group-hover:opacity-100">{item.time}</p>
                      </div>
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all shadow-xl">
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center p-20 rounded-[3rem] bg-gradient-to-br from-primary/5 to-transparent border-4 border-dashed border-primary/20 shadow-inner"
                  >
                    <div className="text-center">
                      <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-indigo-600/20 flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
                        <Sparkles className="h-16 w-16 text-primary/40" />
                      </div>
                      <p className="text-2xl font-black text-foreground mb-3 tracking-tighter">O Livro está em Branco</p>
                      <p className="text-base text-muted-foreground max-w-[280px] font-bold mx-auto opacity-70">Sua jornada épica começa no momento em que você abre as Escrituras pela primeira vez.</p>
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
