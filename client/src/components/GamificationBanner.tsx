import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  Trophy, 
  Star, 
  Target,
  ChevronRight,
  Zap,
  Crown,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

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

  const levelConfig: Record<string, { name: string; minXP: number; maxXP: number; gradient: string; icon: typeof Star }> = {
    iniciante: { name: "Iniciante", minXP: 0, maxXP: 100, gradient: "from-slate-400 to-slate-500", icon: Star },
    crescendo: { name: "Crescendo", minXP: 100, maxXP: 500, gradient: "from-emerald-400 to-emerald-600", icon: Sparkles },
    discipulo: { name: "Discípulo", minXP: 500, maxXP: 2000, gradient: "from-blue-400 to-blue-600", icon: Crown },
    professor: { name: "Professor", minXP: 2000, maxXP: 10000, gradient: "from-blue-800 to-slate-800", icon: Trophy },
  };

  const currentLevel = levelConfig[level] || levelConfig.iniciante;
  const progressToNextLevel = Math.min(100, ((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100);
  const LevelIcon = currentLevel.icon;

  const unlockedCount = userAchievements?.filter(a => a.isUnlocked).length || 0;
  const totalAchievements = userAchievements?.length || 0;

  const recentAchievements = userAchievements
    ?.filter(a => a.isUnlocked)
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 sm:p-5"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${streak > 0 ? "from-orange-400 to-red-500" : "from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700"} shadow-md`}>
              <Flame className="h-5 w-5 text-white" />
            </div>
            {streak >= 7 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                <Zap className="h-2.5 w-2.5 text-amber-900" />
              </div>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground" data-testid="text-streak-value">{streak}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Dias seguidos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentLevel.gradient} shadow-md`}>
            <LevelIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-foreground truncate" data-testid="text-level-name">{currentLevel.name}</p>
              <span className="text-[10px] text-muted-foreground font-medium">{xp} XP</span>
            </div>
            <Progress value={progressToNextLevel} className="h-1.5 mt-1" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-md">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground" data-testid="text-achievements-count">{unlockedCount}<span className="text-base text-muted-foreground font-normal">/{totalAchievements}</span></p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Conquistas</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {recentAchievements?.slice(0, 3).map((ua) => (
              <div
                key={ua.id}
                className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-background"
                title={ua.achievement.name}
              >
                {ua.achievement.icon || <Trophy className="h-3.5 w-3.5" />}
              </div>
            ))}
            {(!recentAchievements || recentAchievements.length === 0) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-xs">Continue lendo!</span>
              </div>
            )}
          </div>
          <Link href="/achievements">
            <Button variant="ghost" size="sm" className="text-primary rounded-full px-3" data-testid="button-view-achievements">
              <span className="hidden sm:inline text-xs">Ver todas</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
