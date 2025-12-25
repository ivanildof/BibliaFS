import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  Trophy, 
  Star, 
  Target,
  ChevronRight,
  Zap
} from "lucide-react";
import { Link } from "wouter";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
}

interface UserAchievement {
  id: string;
  achievementId: string;
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: string;
  achievement: Achievement;
}

export function GamificationBanner() {
  const { user } = useAuth();

  const { data: userAchievements } = useQuery<UserAchievement[]>({
    queryKey: ["/api/achievements/user"],
    enabled: !!user,
  });

  if (!user) return null;

  const streak = user.readingStreak || 0;
  const xp = user.experiencePoints || 0;
  const level = user.level || "iniciante";

  const levelConfig: Record<string, { name: string; minXP: number; maxXP: number; color: string }> = {
    iniciante: { name: "Iniciante", minXP: 0, maxXP: 100, color: "from-gray-400 to-gray-500" },
    crescendo: { name: "Crescendo", minXP: 100, maxXP: 500, color: "from-green-400 to-green-600" },
    discipulo: { name: "Discípulo", minXP: 500, maxXP: 2000, color: "from-blue-400 to-blue-600" },
    professor: { name: "Professor", minXP: 2000, maxXP: 10000, color: "from-purple-400 to-purple-600" },
  };

  const currentLevel = levelConfig[level] || levelConfig.iniciante;
  const progressToNextLevel = Math.min(100, ((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100);

  const unlockedCount = userAchievements?.filter(a => a.isUnlocked).length || 0;
  const totalAchievements = userAchievements?.length || 0;

  const recentAchievements = userAchievements
    ?.filter(a => a.isUnlocked)
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 3);

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20 overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${streak > 0 ? "from-orange-400 to-red-500" : "from-gray-400 to-gray-500"} shadow-lg`}>
                <Flame className="h-6 w-6 text-white" />
              </div>
              {streak >= 7 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-yellow-500 text-yellow-900">
                  <Zap className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-streak-value">{streak}</p>
              <p className="text-xs text-muted-foreground">Dias seguidos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${currentLevel.color} shadow-lg`}>
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold" data-testid="text-level-name">{currentLevel.name}</p>
                <span className="text-xs text-muted-foreground">{xp} XP</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2 mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-achievements-count">{unlockedCount}/{totalAchievements}</p>
              <p className="text-xs text-muted-foreground">Conquistas</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {recentAchievements?.slice(0, 3).map((ua, idx) => (
                <div
                  key={ua.id}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-md"
                  title={ua.achievement.name}
                >
                  {ua.achievement.icon || "🏆"}
                </div>
              ))}
              {(!recentAchievements || recentAchievements.length === 0) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Continue lendo!</span>
                </div>
              )}
            </div>
            <Link href="/achievements">
              <Button variant="ghost" size="sm" className="text-primary" data-testid="button-view-achievements">
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
