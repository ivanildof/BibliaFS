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
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Achievement, UserAchievement } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';

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

  const xpForNextLevel = ((stats?.level || 1) * 100);
  const xpProgress = ((stats?.experiencePoints || 0) % 100);
  const xpProgressPercent = (xpProgress / 100) * 100;

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2" data-testid="text-page-title">
            {t.progress.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t.progress.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.progress.level}</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary" data-testid="text-level">
                {stats?.level || 1}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {xpProgress} / {xpForNextLevel} {t.progress.xp}
              </p>
              <ProgressBar value={xpProgressPercent} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.progress.experiencePoints}</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-xp">
                {stats?.experiencePoints || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.progress.totalXpAccumulated}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.progress.readingStreak}</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-streak">
                {stats?.readingStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.progress.consecutiveDays}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.progress.achievements}</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-achievements">
                {unlockedAchievements.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.progress.ofTotalUnlocked.replace('{total}', totalAchievements.toString())}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t.progress.nextLevel}
            </CardTitle>
            <CardDescription>
              {t.progress.continueReadingToLevel.replace('{level}', ((stats?.level || 1) + 1).toString())}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.progress.progressToNextLevel}</span>
                <span className="font-medium">{Math.round(xpProgressPercent)}%</span>
              </div>
              <ProgressBar value={xpProgressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {t.progress.xpNeededForLevel.replace('{xp}', (xpForNextLevel - xpProgress).toString()).replace('{level}', ((stats?.level || 1) + 1).toString())}
              </p>
            </div>
          </CardContent>
        </Card>

        <section>
          <h2 className="font-display text-2xl font-bold mb-6">{t.progress.achievements}</h2>
          
          {Object.entries(categoryGroups).map(([category, categoryAchievements]) => (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-semibold text-lg capitalize">{category}</h3>
                <Badge variant="secondary">
                  {categoryAchievements.filter(a => isAchievementUnlocked(a.id)).length}/{categoryAchievements.length}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement) => {
                  const unlocked = isAchievementUnlocked(achievement.id);
                  const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);

                  return (
                    <Card 
                      key={achievement.id}
                      className={`${unlocked ? 'border-primary/50 bg-primary/5' : 'opacity-60'}`}
                      data-testid={`card-achievement-${achievement.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-base mb-1 flex items-center gap-2">
                              {achievement.name}
                              {unlocked && (
                                <Badge variant="default" className="text-xs">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {t.progress.unlocked}
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {achievement.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground text-xs">
                            {achievement.requirement}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {achievement.xpReward} XP
                          </Badge>
                        </div>
                        
                        {!unlocked && userAchievement && userAchievement.progress > 0 && (
                          <div className="mt-3">
                            <ProgressBar value={userAchievement.progress} className="h-1.5" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {userAchievement.progress}% {t.progress.complete}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
