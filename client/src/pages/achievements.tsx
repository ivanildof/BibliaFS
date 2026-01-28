import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trophy, Star, Sparkles, Lock, Crown, Flame, BookOpen, Users, Target, Zap, Award, Medal, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirementValue: number;
  currentValue: number;
  category?: string;
}

const getAchievementIcon = (icon: string, isUnlocked: boolean) => {
  const iconClass = isUnlocked ? "h-6 w-6 text-white" : "h-6 w-6 text-muted-foreground";
  switch (icon) {
    case "flame": return <Flame className={iconClass} />;
    case "book": return <BookOpen className={iconClass} />;
    case "users": return <Users className={iconClass} />;
    case "star": return <Star className={iconClass} />;
    case "crown": return <Crown className={iconClass} />;
    case "zap": return <Zap className={iconClass} />;
    case "award": return <Award className={iconClass} />;
    case "medal": return <Medal className={iconClass} />;
    case "gift": return <Gift className={iconClass} />;
    case "target": return <Target className={iconClass} />;
    default: return isUnlocked ? <Trophy className={iconClass} /> : <Lock className={iconClass} />;
  }
};

const getAchievementGradient = (index: number, isUnlocked: boolean) => {
  if (!isUnlocked) return "from-slate-400/80 to-slate-500/80";
  const gradients = [
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-rose-400 to-red-500",
    "from-cyan-400 to-blue-500",
  ];
  return gradients[index % gradients.length];
};

export default function Achievements() {
  const { t } = useLanguage();
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/user"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando conquistas...</p>
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements?.filter((a) => a.unlockedAt) || [];
  const lockedAchievements = achievements?.filter((a) => !a.unlockedAt) || [];
  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements?.length || 0;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-amber-500/5 to-orange-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-500/50" />
            <Trophy className="h-5 w-5 text-amber-500" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
          <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">GAMIFICAÇÃO</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            Conquistas
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso e desbloqueie recompensas
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-3xl border-none glass shadow-xl mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-foreground">Progresso Geral</span>
                    <p className="text-xs text-muted-foreground">Continue desbloqueando!</p>
                  </div>
                </div>
                <Badge className="rounded-full px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none font-bold text-sm shadow-lg shadow-amber-500/20">
                  {unlockedCount} de {totalCount} conquistadas
                </Badge>
              </div>
              <div className="relative">
                <Progress value={progressPercent} className="h-4 rounded-full bg-muted/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-foreground/80">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Desbloqueadas</h2>
              <Badge variant="secondary" className="rounded-full text-xs bg-amber-500/10 text-amber-600 border-amber-200">
                {unlockedCount}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {unlockedAchievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="rounded-2xl border-none glass shadow-lg h-full overflow-hidden group hover:shadow-xl transition-all duration-300">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getAchievementGradient(idx, true)} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity`} />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
                      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3 relative">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${getAchievementGradient(idx, true)} shadow-lg ring-2 ring-white/20`}>
                          {getAchievementIcon(achievement.icon, true)}
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                            {achievement.name}
                          </CardTitle>
                          <CardDescription className="text-xs">{achievement.description}</CardDescription>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                        </div>
                      </CardHeader>
                      <CardContent className="relative">
                        <Badge className="rounded-full px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none font-bold text-[10px] uppercase tracking-widest shadow-md">
                          <Zap className="h-3 w-3 mr-1" />
                          Conquistado!
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {lockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold text-muted-foreground">Em Progresso</h2>
              <Badge variant="secondary" className="rounded-full text-xs">
                {lockedAchievements.length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {lockedAchievements.map((achievement, idx) => {
                  const progress = (achievement.currentValue / achievement.requirementValue) * 100;

                  return (
                    <motion.div
                      key={achievement.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="rounded-2xl border-none bg-card/60 backdrop-blur-sm shadow-md h-full opacity-90 hover:opacity-100 transition-opacity">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                          <div className="p-3 rounded-xl bg-muted">
                            {getAchievementIcon(achievement.icon, false)}
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <CardTitle className="text-base text-muted-foreground">
                              {achievement.name}
                            </CardTitle>
                            <CardDescription className="text-xs">{achievement.description}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground font-medium text-xs">
                                {achievement.currentValue} / {achievement.requirementValue}
                              </span>
                              <span className="font-bold text-primary text-sm">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2 rounded-full" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {(!achievements || achievements.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-3xl border-dashed border-2 border-muted-foreground/20 bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-amber-400/20 to-orange-500/20 mb-6">
                  <Trophy className="h-12 w-12 text-amber-500/50" />
                </div>
                <h3 className="font-bold text-xl mb-2">Nenhuma conquista ainda</h3>
                <p className="text-muted-foreground max-w-md text-sm">
                  Continue lendo a Bíblia para desbloquear conquistas e ganhar recompensas!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
