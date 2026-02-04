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
import { getLevelByXp, getXpProgressInLevel } from "@/lib/gamification-levels";

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

  // Use detailed 50-level system - imported at top of file
  const detailedLevel = getLevelByXp(xp);
  const xpProgress = getXpProgressInLevel(xp, detailedLevel.level);
  
  // Color gradients based on level tiers (soft navy blue palette)
  const getLevelIcon = (level: number) => {
    if (level <= 5) return Star;
    if (level <= 10) return Sparkles;
    if (level <= 20) return Crown;
    if (level <= 30) return Crown;
    if (level <= 40) return Trophy;
    return Trophy;
  };
  
  const progressToNextLevel = xpProgress.percent;
  const LevelIcon = getLevelIcon(detailedLevel.level);

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
      className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-[#E6E6FA]/50"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex items-center gap-3 bg-card-reading rounded-xl p-3">
          <div className="relative">
            <div className={`p-2.5 rounded-xl ${streak > 0 ? "bg-[#FFA500]" : "bg-[#666666]/30"} shadow-md`}>
              <Flame className="h-5 w-5 text-white" />
            </div>
            {streak >= 7 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FFA500] flex items-center justify-center shadow-sm">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-[#333333]" data-testid="text-streak-value">{streak}</p>
            <p className="text-[10px] text-[#666666] font-medium uppercase tracking-wide">Dias seguidos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-card-level rounded-xl p-3">
          <div className="p-2.5 rounded-xl bg-[#800080] shadow-md">
            <LevelIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-[#333333] truncate" data-testid="text-level-name">{detailedLevel.title}</p>
              <span className="text-[10px] text-[#666666] font-medium">{xp} XP</span>
            </div>
            <Progress value={progressToNextLevel} className="h-1.5 mt-1" />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-card-achievements rounded-xl p-3">
          <div className="p-2.5 rounded-xl bg-[#FFA500] shadow-md">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#333333]" data-testid="text-achievements-count">{unlockedCount}<span className="text-base text-[#666666] font-normal">/{totalAchievements}</span></p>
            <p className="text-[10px] text-[#666666] font-medium uppercase tracking-wide">Conquistas</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 bg-card-points rounded-xl p-3">
          <div className="flex gap-1.5">
            {recentAchievements?.slice(0, 3).map((ua) => (
              <div
                key={ua.id}
                className="h-8 w-8 rounded-full bg-[#FFA500] flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white"
                title={ua.achievement.name}
              >
                {ua.achievement.icon || <Trophy className="h-3.5 w-3.5" />}
              </div>
            ))}
            {(!recentAchievements || recentAchievements.length === 0) && (
              <div className="flex items-center gap-2 text-sm text-[#666666]">
                <Target className="h-4 w-4" />
                <span className="text-xs">Continue lendo!</span>
              </div>
            )}
          </div>
          <Link href="/achievements">
            <Button size="sm" className="bg-[#FFA500] hover:bg-[#FF8C00] text-white rounded-full px-3" data-testid="button-view-achievements">
              <span className="hidden sm:inline text-xs">Ver todas</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
