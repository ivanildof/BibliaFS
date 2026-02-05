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
    case 'leitura': return 'from-blue-600 to-indigo-800';
    case 'streak': return 'from-orange-500 to-red-700';
    case 'planos': return 'from-emerald-500 to-teal-700';
    case 'oração': return 'from-purple-500 to-pink-700';
    case 'comunidade': return 'from-amber-500 to-orange-700';
    case 'destaques': return 'from-cyan-500 to-blue-700';
    case 'exploração': return 'from-violet-500 to-purple-800';
    default: return 'from-muted-foreground to-foreground';
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
          <p className="text-sm text-muted-foreground font-bold italic">{t.progress.loadingProgress}</p>
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
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-muted/50 dark:bg-muted/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 mb-10"
        >
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-500 drop-shadow-sm" data-testid="text-page-title">
            {t.progress.title}
          </h1>
          <p className="text-sm text-muted-foreground font-bold italic uppercase tracking-wider">
            {t.progress.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { title: t.progress.level, val: currentLevel, sub: levelInfo.title, icon: Crown, bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", iconBg: "bg-blue-600" },
            { title: t.progress.experiencePoints, val: stats?.experiencePoints || 0, sub: t.progress.totalXpAccumulated, icon: Star, bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300", iconBg: "bg-orange-500" },
            { title: t.progress.readingStreak, val: stats?.readingStreak || 0, sub: t.progress.consecutiveDays, icon: Flame, bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300", iconBg: "bg-rose-600" },
            { title: t.progress.achievements, val: unlockedAchievements.length, sub: `${unlockedAchievements.length}/${totalAchievements}`, icon: Trophy, bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300", iconBg: "bg-purple-600" }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`rounded-[2rem] border-none ${item.bg} shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-1 relative p-6">
                  <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.title}</CardTitle>
                  <div className={`p-1.5 rounded-lg ${item.iconBg}`}>
                    <item.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0">
                  <div className={`text-4xl font-semibold ${item.text}`}>
                    {item.val}
                  </div>
                  <p className="text-[10px] font-semibold mt-1 text-muted-foreground uppercase tracking-wider">
                    {item.sub}
                  </p>
                  {item.title === t.progress.level && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[8px] mb-1 font-semibold text-muted-foreground uppercase tracking-widest">
                        <span>{xpProgressInfo.current} XP</span>
                        <span>{xpProgressInfo.needed} XP</span>
                      </div>
                      <ProgressBar value={xpProgressInfo.percent} className="h-1.5 rounded-full bg-card/50" />
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
          <Card className="mb-12 rounded-[2.5rem] border-none bg-gradient-to-r from-indigo-50 to-orange-50 dark:from-indigo-950 dark:to-orange-950 shadow-sm overflow-hidden relative">
            <CardHeader className="relative p-8 z-10 flex flex-row items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">{t.progress.nextLevel}</CardTitle>
                <CardDescription className="text-sm font-bold text-muted-foreground">
                  {t.progress.continueReadingToLevel.replace('{level}', ((stats?.level || 1) + 1).toString())}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="relative p-8 pt-0 z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-semibold uppercase tracking-[0.2em] text-[10px]">Progresso da Jornada</span>
                    <span className="text-4xl font-semibold text-indigo-700 dark:text-indigo-300">{Math.round(xpProgressInfo.percent)}%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                    {t.progress.xpNeededForLevel.replace('{xp}', (xpProgressInfo.needed - xpProgressInfo.current).toString()).replace('{level}', (currentLevel + 1).toString())}
                  </span>
                </div>
                <ProgressBar value={xpProgressInfo.percent} className="h-3 rounded-full subtle-card shadow-inner" />
                {currentLevel < 50 && (
                  <div className="mt-4 px-4 py-2 rounded-xl bg-orange-100 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 w-fit">
                    <span className="text-xs font-semibold text-orange-700 dark:text-orange-300 tracking-tight uppercase">
                      <Zap className="h-3 w-3 inline mr-2 text-orange-500 fill-orange-500" />
                      Próximo Título: {getLevelInfo(currentLevel + 1).title}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2.5 rounded-xl bg-orange-600 shadow-md">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-orange-700 dark:text-orange-500 tracking-tight uppercase">
                {t.progress.achievements}
              </h2>
              <p className="text-xs text-muted-foreground font-bold italic">Domine as escrituras e desbloqueie tesouros</p>
            </div>
          </div>
          
          {Object.entries(categoryGroups).map(([category, categoryAchievements], catIdx) => {
            const CategoryIcon = getCategoryIcon(category);
            const unlockedInCategory = categoryAchievements.filter(a => isAchievementUnlocked(a.id)).length;
            
            return (
              <div key={category} className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <CategoryIcon className="h-5 w-5 text-foreground" />
                  <h3 className="font-semibold text-xl capitalize text-foreground">{category}</h3>
                  <Badge variant="secondary" className="rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-none px-3 font-semibold text-[10px]">
                    {unlockedInCategory} / {categoryAchievements.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {categoryAchievements.map((achievement, achIdx) => {
                    const unlocked = isAchievementUnlocked(achievement.id);
                    
                    return (
                      <Card 
                        key={achievement.id}
                        className={`rounded-2xl border-none shadow-sm overflow-hidden group transition-all duration-300 relative bg-card ${
                          !unlocked && 'opacity-70'
                        }`}
                      >
                        <CardHeader className="p-5 pb-3">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl border ${
                              unlocked ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-100 dark:border-indigo-800' : 'bg-muted border-border'
                            }`}>
                              <Lock className={`h-4 w-4 ${unlocked ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className={`text-sm font-semibold tracking-tight ${
                                unlocked ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {achievement.name}
                              </CardTitle>
                              <CardDescription className="text-[11px] mt-0.5 font-bold text-muted-foreground">
                                {achievement.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 flex items-center justify-between">
                          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                            {unlocked ? 'CONQUISTADO' : 'BLOQUEADO'}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100">
                            <Star className="h-2.5 w-2.5 text-orange-500 fill-orange-500" />
                            <span className="font-semibold text-[10px] text-orange-700">+{achievement.xpReward} XP</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
