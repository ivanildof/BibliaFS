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
          <Loader2 className="h-8 w-8 animate-spin text-[#FFA500] mx-auto" />
          <p className="text-sm text-[#666666] font-bold uppercase tracking-widest animate-pulse">Iniciando Experiência Premium...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: GraduationCap, label: "Modo Professor", href: "/teacher", bgColor: "bg-card-level" },
    { icon: MessageSquare, label: "Nova Oração", href: "/prayers", bgColor: "bg-card-reading" },
    { icon: Headphones, label: "Ouvir Podcast", href: "/podcasts", bgColor: "bg-card-points" },
    { icon: Users, label: "Comunidade", href: "/community", bgColor: "bg-card-achievements" },
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #F8F8FF 0%, #FFFFFF 100%)' }}>
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E6E6FA]/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFDAB9]/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#FFA500] to-transparent" />
            <Crown className="h-8 w-8 text-[#FFA500] fill-[#FFA500]/30 animate-pulse" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent via-[#FFA500] to-transparent" />
          </div>
          <p className="text-[12px] font-black text-[#666666] uppercase tracking-[0.5em]">RECONHECIMENTO DE USUÁRIO</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-[#333333]" data-testid="text-welcome">
            Olá, {user?.firstName || "Estudante"}
          </h1>
          <p className="text-base text-[#666666] font-medium">
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
            <Card className="relative border-none overflow-hidden rounded-[2rem] group bg-card-reading shadow-lg transition-all duration-500">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#800080]" />
              <CardHeader className="pb-4 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#FFA500] shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight text-[#333333]">Leitura de Hoje</CardTitle>
                      <CardDescription className="text-sm font-bold text-[#666666] mt-0.5 uppercase tracking-wider">{currentPlan.title}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-[#FFA500] text-white border-none font-black px-6 py-2 rounded-full text-xs shadow-lg transform hover:scale-105 transition-transform">
                    DIA {currentPlan.currentDay}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-2 relative">
                <div className="bg-white/60 p-6 rounded-2xl">
                  <div className="flex items-center justify-between text-xs mb-3 font-black uppercase tracking-widest text-[#666666]">
                    <span>PROGRESSO DO PLANO</span>
                    <span className="text-[#800080]">
                      {Math.round(((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-white/80 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentPlan.currentDay || 1) / (currentPlan.schedule?.length || 1)) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-[#800080] rounded-full shadow-lg"
                    />
                  </div>
                </div>
                
                <Button size="lg" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all bg-[#FFA500] border-0" asChild data-testid="button-continue-reading">
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
             <div className="h-8 w-1 bg-[#FFA500] rounded-full" />
             <h2 className="font-black text-xl text-[#333333] tracking-tight uppercase">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className={`cursor-pointer border-none ${action.bgColor} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-[1.75rem] overflow-visible group shadow-md`} data-testid={`card-quick-action-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-4 rounded-2xl bg-[#FFA500] shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="font-black text-xs text-[#333333] uppercase tracking-widest">{action.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none rounded-[2.5rem] overflow-hidden bg-card-achievements shadow-lg transition-all">
            <CardHeader className="p-8 pb-4 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-[#800080] shadow-lg animate-pulse">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black text-[#333333] tracking-tighter">Atividade Recente</CardTitle>
                    <p className="text-xs text-[#666666] font-black uppercase tracking-[0.3em] mt-1">Sua Trilha de Evolução Exclusiva</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-2 relative">
              <div className="space-y-5">
                {isLoadingActivity ? (
                  <div className="flex justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-[#800080]" />
                      <p className="text-sm font-black uppercase tracking-widest text-[#666666] animate-pulse">Sincronizando Suas Glórias...</p>
                    </div>
                  </div>
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 100 }}
                      className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/60 hover:bg-white transition-all duration-500 group cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <div className={`p-5 rounded-2xl ${
                        item.type === 'read' ? 'bg-card-level' :
                        item.type === 'prayer' ? 'bg-card-reading' :
                        item.type === 'post' ? 'bg-card-points' :
                        'bg-card-achievements'
                      } shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                        {item.type === 'read' ? <BookOpen className="h-6 w-6 text-[#333333]" /> :
                         item.type === 'prayer' ? <MessageSquare className="h-6 w-6 text-[#333333]" /> :
                         item.type === 'post' ? <Users className="h-6 w-6 text-[#333333]" /> :
                         <Sparkles className="h-6 w-6 text-[#333333]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base text-[#333333] truncate group-hover:text-[#FFA500] transition-colors tracking-tight">{item.text}</p>
                        <p className="text-xs font-black text-[#666666] mt-1.5 uppercase tracking-widest">{item.time}</p>
                      </div>
                      <div className="p-3 rounded-full bg-[#FFA500]/10 group-hover:bg-[#FFA500] group-hover:text-white transition-all shadow-md">
                        <ChevronRight className="h-5 w-5 text-[#333333] group-hover:text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center p-20 rounded-[3rem] bg-white/40 border-4 border-dashed border-[#E6E6FA] shadow-inner"
                  >
                    <div className="text-center">
                      <div className="h-32 w-32 rounded-[2.5rem] bg-card-achievements flex items-center justify-center mx-auto mb-8 shadow-lg animate-pulse">
                        <Sparkles className="h-16 w-16 text-[#800080]" />
                      </div>
                      <p className="text-2xl font-black text-[#333333] mb-3 tracking-tighter">O Livro está em Branco</p>
                      <p className="text-base text-[#666666] max-w-[280px] font-bold mx-auto">Sua jornada épica começa no momento em que você abre as Escrituras pela primeira vez.</p>
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
