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
  Check
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Achievement, UserAchievement } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';
import { getLevelInfo, getXpProgressInLevel, GAMIFICATION_LEVELS } from '@/lib/gamification-levels';

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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t.progress.loadingProgress}</p>
            </div>
          </div>
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

  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'leitura': return <Star className="h-4 w-4" />;
      case 'streak': return <Flame className="h-4 w-4" />;
      case 'planos': return <Target className="h-4 w-4" />;
      case 'oração': return <Trophy className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return unlockedAchievements.some(ua => ua.achievementId === achievementId);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent" data-testid="text-page-title">
            {t.progress.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
            {t.progress.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: t.progress.level, val: currentLevel, sub: levelInfo.title, icon: Crown, color: "text-primary", bg: "bg-primary/10" },
            { title: t.progress.experiencePoints, val: stats?.experiencePoints || 0, sub: t.progress.totalXpAccumulated, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
            { title: t.progress.readingStreak, val: stats?.readingStreak || 0, sub: t.progress.consecutiveDays, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
            { title: t.progress.achievements, val: unlockedAchievements.length, sub: `${unlockedAchievements.length}/${totalAchievements}`, icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-600/10" }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="rounded-3xl border-none bg-card/80 backdrop-blur-xl shadow-lg hover-elevate transition-all overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</CardTitle>
                  <div className={`p-2 rounded-2xl ${item.bg}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${item.color}`} data-testid={`text-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                    {item.val}
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">
                    {item.sub}
                  </p>
                  {item.title === t.progress.level && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] mb-1 font-bold text-muted-foreground">
                        <span>{xpProgressInfo.current} XP</span>
                        <span>{xpProgressInfo.needed} XP</span>
                      </div>
                      <ProgressBar value={xpProgressInfo.percent} className="h-1.5 rounded-full" />
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
          <Card className="mb-12 rounded-[2.5rem] border-none bg-primary/5 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2.5 rounded-2xl bg-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                {t.progress.nextLevel}
              </CardTitle>
              <CardDescription className="text-base">
                {t.progress.continueReadingToLevel.replace('{level}', ((stats?.level || 1) + 1).toString())}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end text-sm mb-1">
                  <div className="space-y-1">
                    <span className="text-muted-foreground block font-medium uppercase tracking-widest text-[10px]">Progresso Atual</span>
                    <span className="text-2xl font-bold text-primary">{Math.round(xpProgressInfo.percent)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium pb-1">
                    {t.progress.xpNeededForLevel.replace('{xp}', (xpProgressInfo.needed - xpProgressInfo.current).toString()).replace('{level}', (currentLevel + 1).toString())}
                  </p>
                </div>
                <ProgressBar value={xpProgressInfo.percent} className="h-4 rounded-full shadow-inner bg-primary/10" />
                {currentLevel < 50 && (
                  <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-2xl bg-background/50 border border-primary/10 w-fit">
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-primary">Próximo Título: {getLevelInfo(currentLevel + 1).title}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <section>
          <h2 className="font-display text-3xl font-bold mb-10 flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            {t.progress.achievements}
          </h2>
          
          {Object.entries(categoryGroups).map(([category, categoryAchievements], catIdx) => (
            <motion.div 
              key={category} 
              className="mb-12"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + catIdx * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card shadow-md text-primary">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-bold text-xl capitalize tracking-tight">{category}</h3>
                <Badge variant="secondary" className="rounded-full px-3 py-0.5 font-bold">
                  {categoryAchievements.filter(a => isAchievementUnlocked(a.id)).length}/{categoryAchievements.length}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryAchievements.map((achievement, achIdx) => {
                  const unlocked = isAchievementUnlocked(achievement.id);
                  const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + catIdx * 0.1 + achIdx * 0.05 }}
                    >
                      <Card 
                        className={`rounded-3xl border-none transition-all duration-300 shadow-lg ${
                          unlocked 
                            ? 'bg-gradient-to-br from-primary/10 to-card backdrop-blur-xl ring-1 ring-primary/20' 
                            : 'opacity-70 bg-card/40 grayscale hover:grayscale-0'
                        }`}
                        data-testid={`card-achievement-${achievement.id}`}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-bold mb-2 flex items-center gap-2">
                                {achievement.name}
                                {unlocked && (
                                  <div className="p-1 rounded-full bg-primary/20">
                                    <Check className="h-3 w-3 text-primary" />
                                  </div>
                                )}
                              </CardTitle>
                              <CardDescription className="text-sm font-medium line-clamp-2">
                                {achievement.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-6">
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                              {achievement.requirement ? `${achievement.requirement.type}: ${achievement.requirement.value}` : 'Especial'}
                            </span>
                            <Badge variant="outline" className="rounded-full bg-amber-500/5 text-amber-600 border-amber-200/50 font-bold">
                              <Star className="h-3 w-3 mr-1 fill-amber-500" />
                              {achievement.xpReward} XP
                            </Badge>
                          </div>
                          
                          {!unlocked && userAchievement && (userAchievement.progress ?? 0) > 0 && (
                            <div className="mt-6 p-3 rounded-2xl bg-muted/50 border border-border/30">
                              <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase text-muted-foreground">
                                <span>Progresso</span>
                                <span>{userAchievement.progress ?? 0}%</span>
                              </div>
                              <ProgressBar value={userAchievement.progress ?? 0} className="h-2 rounded-full" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}
