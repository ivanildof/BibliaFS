import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { 
  Trophy, 
  Flame, 
  Star, 
  TrendingUp,
  Loader2,
  Award,
  Target,
  Zap,
  Crown,
  Check,
  Sparkles,
  BookOpen,
  Users,
  Lock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Achievement, UserAchievement } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';
import { getLevelInfo, getXpProgressInLevel } from '@/lib/gamification-levels';

interface GamificationStats {
  level: number;
  experiencePoints: number;
  readingStreak: number;
  achievementsUnlocked: number;
  lastReadDate: Date | null;
}

interface UserAchievementWithDetails extends UserAchievement {
  achievement: Achievement;
}

const getCategoryGradient = (category: string) => {
  switch(category.toLowerCase()) {
    case 'leitura': return 'from-blue-500 to-indigo-600';
    case 'streak': return 'from-orange-400 to-red-500';
    case 'planos': return 'from-emerald-400 to-teal-500';
    case 'oração': return 'from-purple-400 to-pink-500';
    case 'comunidade': return 'from-amber-400 to-orange-500';
    case 'destaques': return 'from-cyan-400 to-blue-500';
    case 'exploração': return 'from-violet-400 to-purple-500';
    default: return 'from-slate-400 to-slate-600';
  }
};

const getCategoryIcon = (category: string) => {
  switch(category.toLowerCase()) {
    case 'leitura': return BookOpen;
    case 'streak': return Flame;
    case 'planos': return Target;
    case 'oração': return Sparkles;
    case 'comunidade': return Users;
    case 'destaques': return Star;
    case 'exploração': return Trophy;
    default: return Award;
  }
};

export default function Progress() {
  const { t } = useLanguage();
  
  const { data: stats, isLoading: statsLoading } = useQuery<GamificationStats>({
    queryKey: ["/api/stats/gamification"],
    retry: 2,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    retry: 2,
  });

  const { data: userAchievements = [], isLoading: userAchievementsLoading } = useQuery<UserAchievementWithDetails[]>({
    queryKey: ["/api/my-achievements"],
    retry: 2,
  });

  const isLoading = statsLoading || achievementsLoading || userAchievementsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">{t.progress.loadingProgress}</p>
        </div>
      </div>
    );
  }

  const currentLevel = stats?.level || 1;
  const totalXp = stats?.experiencePoints || 0;
  const levelInfo = getLevelInfo(currentLevel);
  const xpProgressInfo = getXpProgressInLevel(totalXp, currentLevel);

  const unlockedAchievements = userAchievements.filter(ua => ua.isUnlocked);
  const totalAchievements = achievements.length;

  const categoryGroups = achievements.reduce((acc, achievement) => {
    const category = achievement.category || 'outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const isAchievementUnlocked = (achievementId: string) => {
    return unlockedAchievements.some(ua => ua.achievementId === achievementId);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/5 to-amber-500/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50" />
            <Crown className="h-5 w-5 text-primary" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">ESTATÍSTICAS</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent" data-testid="text-page-title">
            {t.progress.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.progress.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: t.progress.level, val: currentLevel, sub: levelInfo.title, icon: Crown, gradient: "from-primary to-blue-600", shadow: "shadow-primary/20" },
            { title: t.progress.experiencePoints, val: stats?.experiencePoints || 0, sub: t.progress.totalXpAccumulated, icon: Star, gradient: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
            { title: t.progress.readingStreak, val: stats?.readingStreak || 0, sub: t.progress.consecutiveDays, icon: Flame, gradient: "from-orange-400 to-red-500", shadow: "shadow-orange-500/20" },
            { title: t.progress.achievements, val: unlockedAchievements.length, sub: `${unlockedAchievements.length}/${totalAchievements}`, icon: Trophy, gradient: "from-amber-400 to-amber-600", shadow: "shadow-amber-500/20" }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="rounded-3xl border-none glass shadow-xl overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.title}</CardTitle>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg ${item.shadow}`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className={`text-4xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`} data-testid={`text-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                    {item.val}
                  </div>
                  <p className="text-sm font-medium mt-1 text-muted-foreground truncate">
                    {item.sub}
                  </p>
                  {item.title === t.progress.level && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] mb-1 font-bold text-muted-foreground">
                        <span>{xpProgressInfo.current} XP</span>
                        <span>{xpProgressInfo.needed} XP</span>
                      </div>
                      <ProgressBar value={xpProgressInfo.percent} className="h-2 rounded-full" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-12 rounded-3xl border-none glass shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-amber-500/5" />
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">{t.progress.nextLevel}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {t.progress.continueReadingToLevel.replace('{level}', ((stats?.level || 1) + 1).toString())}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <div className="flex justify-between items-end text-sm mb-1">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-medium uppercase tracking-widest text-[10px]">Progresso Atual</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{Math.round(xpProgressInfo.percent)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium pb-1">
                    {t.progress.xpNeededForLevel.replace('{xp}', (xpProgressInfo.needed - xpProgressInfo.current).toString()).replace('{level}', (currentLevel + 1).toString())}
                  </p>
                </div>
                <ProgressBar value={xpProgressInfo.percent} className="h-4 rounded-full" />
                {currentLevel < 50 && (
                  <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 w-fit">
                    <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-amber-600">Próximo Título: {getLevelInfo(currentLevel + 1).title}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                {t.progress.achievements}
              </h2>
              <p className="text-sm text-muted-foreground">Desbloqueie conquistas e ganhe XP</p>
            </div>
          </div>
          
          {Object.entries(categoryGroups).map(([category, categoryAchievements], catIdx) => {
            const CategoryIcon = getCategoryIcon(category);
            const categoryGradient = getCategoryGradient(category);
            const unlockedInCategory = categoryAchievements.filter(a => isAchievementUnlocked(a.id)).length;
            
            return (
              <motion.div 
                key={category} 
                className="mb-10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + catIdx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${categoryGradient} shadow-lg`}>
                    <CategoryIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl capitalize tracking-tight">{category}</h3>
                  <Badge className={`rounded-full px-4 py-1 font-bold text-xs bg-gradient-to-r ${categoryGradient} text-white border-none shadow-md`}>
                    {unlockedInCategory}/{categoryAchievements.length}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoryAchievements.map((achievement, achIdx) => {
                    const unlocked = isAchievementUnlocked(achievement.id);
                    const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
                    const progress = userAchievement?.progress ?? 0;

                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + catIdx * 0.1 + achIdx * 0.05 }}
                      >
                        <Card 
                          className={`rounded-2xl border-none shadow-lg h-full overflow-hidden group transition-all duration-300 ${
                            unlocked 
                              ? 'glass hover:shadow-xl' 
                              : 'bg-card/60 backdrop-blur-sm opacity-80 hover:opacity-100'
                          }`}
                          data-testid={`card-achievement-${achievement.id}`}
                        >
                          {unlocked && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient} opacity-[0.08]`} />
                          )}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                          
                          <CardHeader className="pb-3 relative">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${
                                unlocked 
                                  ? `bg-gradient-to-br ${categoryGradient} shadow-lg ring-2 ring-white/20`
                                  : 'bg-muted'
                              }`}>
                                {unlocked ? (
                                  <Trophy className="h-5 w-5 text-white" />
                                ) : (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className={`text-base font-bold flex items-center gap-2 ${
                                  unlocked ? `bg-gradient-to-r ${categoryGradient} bg-clip-text text-transparent` : 'text-muted-foreground'
                                }`}>
                                  {achievement.name}
                                  {unlocked && (
                                    <Sparkles className="h-4 w-4 text-amber-400 animate-pulse flex-shrink-0" />
                                  )}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1 line-clamp-2">
                                  {achievement.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pb-4 relative">
                            <div className="flex items-center justify-between">
                              {unlocked ? (
                                <Badge className="rounded-full px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none font-bold text-[10px] uppercase tracking-widest shadow-md">
                                  <Check className="h-3 w-3 mr-1" />
                                  Conquistado
                                </Badge>
                              ) : (
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                  {progress > 0 ? `${progress}% concluído` : 'Bloqueado'}
                                </span>
                              )}
                              <Badge variant="outline" className="rounded-full bg-amber-500/10 text-amber-600 border-amber-200/50 font-bold text-xs">
                                <Star className="h-3 w-3 mr-1 fill-amber-500" />
                                {achievement.xpReward} XP
                              </Badge>
                            </div>
                            
                            {!unlocked && progress > 0 && (
                              <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/20">
                                <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase text-muted-foreground">
                                  <span>Progresso</span>
                                  <span>{progress}%</span>
                                </div>
                                <ProgressBar value={progress} className="h-2 rounded-full" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
