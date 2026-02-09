import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trophy, Star, Sparkles, Lock, Crown, Flame, BookOpen, Users, Target, Zap, Award, Medal, Gift, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
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
  xpReward?: number;
}

const getAchievementIcon = (icon: string, isUnlocked: boolean) => {
  const iconClass = isUnlocked ? "h-7 w-7 text-white" : "h-7 w-7 text-muted-foreground";
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

const cardAccents = [
  { gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20", accent: "card-accent-amber" },
  { gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", accent: "card-accent-emerald" },
  { gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20", accent: "card-accent-blue" },
  { gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/20", accent: "card-accent-purple" },
  { gradient: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/20", accent: "card-accent-rose" },
  { gradient: "from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/20", accent: "card-accent-blue" },
];

const categoryNames: Record<string, string> = {
  community: "Comunidade",
  study: "Destaques",
  exploration: "Exploração",
  reading: "Leitura",
  prayer: "Oração",
  general: "Geral",
};

const categoryIcons: Record<string, typeof Users> = {
  community: Users,
  study: Star,
  exploration: Trophy,
  reading: BookOpen,
  prayer: Sparkles,
  general: Award,
};

export default function Achievements() {
  const { t } = useLanguage();
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/user"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground animate-pulse" data-testid="text-loading">Carregando conquistas...</p>
        </div>
      </div>
    );
  }

  const allAchievements = achievements || [];
  const unlockedCount = allAchievements.filter((a) => a.unlockedAt).length;
  const totalCount = allAchievements.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const categories = allAchievements.reduce<Record<string, Achievement[]>>((acc, a) => {
    const cat = a.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-screen relative overflow-hidden mesh-primary">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/30" data-testid="icon-trophy-header">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground" data-testid="text-page-title">
              CONQUISTAS
            </h1>
            <p className="text-muted-foreground font-medium mt-1">Domine as escrituras e desbloqueie tesouros</p>
          </div>
        </motion.div>

        {/* Progress Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-premium hover-premium rounded-2xl border-none overflow-hidden" data-testid="card-progress-overview">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight" data-testid="text-progress-title">Progresso Geral</h2>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Nível de domínio das escrituras</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none font-bold text-xs px-4 py-1.5 shadow-lg shadow-amber-500/20" data-testid="badge-progress-count">
                  {unlockedCount} / {totalCount}
                </Badge>
              </div>
              <div className="relative">
                <ProgressBar value={progressPercent} className="h-4 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">
                    {progressPercent.toFixed(0)}% concluído
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Sections */}
        {Object.entries(categories).map(([category, categoryAchievements], catIndex) => {
          const CatIcon = categoryIcons[category] || Award;
          const unlockedInCat = categoryAchievements.filter(a => a.unlockedAt).length;

          return (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + catIndex * 0.08 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <CatIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground tracking-tight" data-testid={`text-category-${category}`}>
                  {categoryNames[category] || category}
                </h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-xs" data-testid={`badge-category-count-${category}`}>
                  {unlockedInCat} / {categoryAchievements.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {categoryAchievements.map((achievement, idx) => {
                    const isUnlocked = !!achievement.unlockedAt;
                    const style = cardAccents[(catIndex * 3 + idx) % cardAccents.length];

                    return (
                      <motion.div
                        key={achievement.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <Card
                          className={`rounded-2xl border-none overflow-hidden hover-premium transition-all duration-300 ${
                            isUnlocked ? style.accent : 'glass-premium opacity-70'
                          }`}
                          data-testid={`card-achievement-${achievement.id}`}
                        >
                          <CardContent className="p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3.5 rounded-xl shrink-0 ${
                                isUnlocked 
                                  ? `bg-gradient-to-br ${style.gradient} shadow-lg ${style.shadow}` 
                                  : 'bg-muted/80 border border-border'
                              }`}>
                                {getAchievementIcon(achievement.icon, isUnlocked)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-base font-bold tracking-tight leading-tight ${
                                  isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                                }`} data-testid={`text-achievement-name-${achievement.id}`}>
                                  {achievement.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed" data-testid={`text-achievement-desc-${achievement.id}`}>
                                  {achievement.description}
                                </p>
                                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                                  {isUnlocked ? (
                                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px] uppercase tracking-wider" data-testid={`badge-unlocked-${achievement.id}`}>
                                      <Check className="h-3 w-3 mr-1.5" />
                                      Conquistado
                                    </Badge>
                                  ) : (
                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest" data-testid={`text-locked-${achievement.id}`}>
                                      Bloqueado
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/15" data-testid={`badge-xp-${achievement.id}`}>
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">+{achievement.xpReward || 50} XP</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.section>
          );
        })}

        {totalCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-premium rounded-2xl border-none" data-testid="card-empty-achievements">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-2xl bg-muted/80 flex items-center justify-center mb-6 border border-border">
                  <Trophy className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-foreground">Nenhuma conquista ainda</h3>
                <p className="text-muted-foreground max-w-sm text-sm">
                  Abra as Escrituras e comece sua jornada para desbloquear conquistas.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
