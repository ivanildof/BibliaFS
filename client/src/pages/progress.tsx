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

const getCategoryColor = (category: string) => {
  switch(category.toLowerCase()) {
    case 'leitura': return 'bg-card-level';
    case 'streak': return 'bg-card-reading';
    case 'planos': return 'bg-card-points';
    case 'oração': return 'bg-card-achievements';
    case 'comunidade': return 'bg-card-points';
    case 'destaques': return 'bg-card-level';
    case 'exploração': return 'bg-card-achievements';
    default: return 'bg-card-level';
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
          <Loader2 className="h-8 w-8 animate-spin text-[#FFA500] mx-auto" />
          <p className="text-sm text-[#666666] font-bold italic">{t.progress.loadingProgress}</p>
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #F8F8FF 0%, #FFFFFF 100%)' }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#E6E6FA]/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#FFDAB9]/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#FFA500] to-transparent" />
            <Crown className="h-8 w-8 text-[#FFA500] fill-[#FFA500]/30 animate-pulse" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent via-[#FFA500] to-transparent" />
          </div>
          <p className="text-[12px] font-black text-[#666666] uppercase tracking-[0.5em]">RECONHECIMENTO DE USUÁRIO</p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#333333]" data-testid="text-page-title">
            {t.progress.title}
          </h1>
          <p className="text-base text-[#666666] font-bold">
            {t.progress.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: t.progress.level, val: currentLevel, sub: levelInfo.title, icon: Crown, bgColor: "bg-card-level", textColor: "text-[#333333]" },
            { title: t.progress.experiencePoints, val: stats?.experiencePoints || 0, sub: t.progress.totalXpAccumulated, icon: Star, bgColor: "bg-card-points", textColor: "text-[#333333]" },
            { title: t.progress.readingStreak, val: stats?.readingStreak || 0, sub: t.progress.consecutiveDays, icon: Flame, bgColor: "bg-card-reading", textColor: "text-[#333333]" },
            { title: t.progress.achievements, val: unlockedAchievements.length, sub: `${unlockedAchievements.length}/${totalAchievements}`, icon: Trophy, bgColor: "bg-card-achievements", textColor: "text-[#333333]" }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`rounded-[2rem] border-none ${item.bgColor} shadow-lg overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-xl`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#666666]">{item.title}</CardTitle>
                  <div className="p-2.5 rounded-xl bg-[#FFA500] shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className={`text-4xl font-black ${item.textColor}`} data-testid={`text-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                    {item.val}
                  </div>
                  <p className="text-[11px] font-black mt-1 text-[#666666] uppercase tracking-wider truncate">
                    {item.sub}
                  </p>
                  {item.title === t.progress.level && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[9px] mb-1.5 font-black text-[#666666] uppercase tracking-widest">
                        <span>{xpProgressInfo.current} XP</span>
                        <span>{xpProgressInfo.needed} XP</span>
                      </div>
                      <ProgressBar value={xpProgressInfo.percent} className="h-2 rounded-full bg-white/50 shadow-inner overflow-hidden" />
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
          <Card className="mb-12 rounded-[2.5rem] border-none bg-card-points shadow-lg overflow-hidden relative">
            <CardHeader className="relative p-8 z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-[#FFA500] shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black tracking-tighter text-[#333333]">{t.progress.nextLevel}</CardTitle>
                  <CardDescription className="text-base font-bold text-[#666666] mt-1">
                    {t.progress.continueReadingToLevel.replace('{level}', ((stats?.level || 1) + 1).toString())}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-8 pt-0 z-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end text-sm mb-1">
                  <div className="space-y-1">
                    <span className="text-[#666666] block font-black uppercase tracking-[0.2em] text-[10px]">Progresso da Jornada</span>
                    <span className="text-5xl font-black text-[#800080]">{Math.round(xpProgressInfo.percent)}%</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#666666] font-black uppercase tracking-widest bg-white/60 px-4 py-2 rounded-full inline-block border border-white">
                      {t.progress.xpNeededForLevel.replace('{xp}', (xpProgressInfo.needed - xpProgressInfo.current).toString()).replace('{level}', (currentLevel + 1).toString())}
                    </p>
                  </div>
                </div>
                <ProgressBar value={xpProgressInfo.percent} className="h-4 rounded-full shadow-inner bg-white/50" />
                {currentLevel < 50 && (
                  <div className="flex items-center gap-3 mt-6 px-6 py-4 rounded-2xl bg-[#FFA500]/20 border border-[#FFA500]/30 w-fit shadow-sm">
                    <Zap className="h-5 w-5 text-[#FFA500] fill-[#FFA500] animate-pulse" />
                    <span className="text-base font-black text-[#333333] tracking-tight">Próximo Título: {getLevelInfo(currentLevel + 1).title}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <section>
          <div className="flex items-center gap-6 mb-12">
            <div className="p-4 rounded-2xl bg-[#FFA500] shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="font-display text-4xl font-black text-[#333333]">
                {t.progress.achievements}
              </h2>
              <p className="text-base text-[#666666] font-bold">Domine as escrituras e desbloqueie tesouros</p>
            </div>
          </div>
          
          {Object.entries(categoryGroups).map(([category, categoryAchievements], catIdx) => {
            const CategoryIcon = getCategoryIcon(category);
            const categoryColor = getCategoryColor(category);
            const unlockedInCategory = categoryAchievements.filter(a => isAchievementUnlocked(a.id)).length;
            
            return (
              <motion.div 
                key={category} 
                className="mb-14"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + catIdx * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-2xl bg-[#FFA500] shadow-lg">
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-black text-2xl capitalize tracking-tighter text-[#333333]">{category}</h3>
                  <Badge className="rounded-full px-6 py-1.5 font-black text-xs bg-[#800080] text-white border-none shadow-lg transform hover:scale-105 transition-transform">
                    {unlockedInCategory} / {categoryAchievements.length}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                          className={`rounded-[2.5rem] border-none h-full overflow-hidden group transition-all duration-500 relative bg-white shadow-lg ${
                            unlocked 
                              ? 'hover:shadow-xl hover:-translate-y-2' 
                              : 'opacity-95 hover:opacity-100'
                          }`}
                          data-testid={`card-achievement-${achievement.id}`}
                        >
                          {/* Subtle gradient background like in the image */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-20 z-0`} />
                          
                          <CardHeader className="p-8 pb-4 relative z-10">
                            <div className="flex items-start gap-5">
                              <div className={`p-4 rounded-2xl transition-all duration-500 shadow-md flex items-center justify-center ${
                                unlocked 
                                  ? 'bg-white group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-[#E6E6FA]'
                                  : 'bg-white opacity-40 group-hover:opacity-100 border border-[#E6E6FA]'
                              }`}>
                                {unlocked ? (
                                  <Trophy className="h-6 w-6 text-[#FFA500]" />
                                ) : (
                                  <Lock className="h-6 w-6 text-[#666666]/30" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className={`text-xl font-black flex items-center gap-2 tracking-tighter transition-colors uppercase italic ${
                                  unlocked ? 'text-[#333333]' : 'text-[#666666]/60'
                                }`}>
                                  {achievement.name}
                                </CardTitle>
                                <CardDescription className={`text-sm mt-1 line-clamp-2 font-bold transition-opacity italic leading-tight ${
                                  unlocked ? 'text-[#666666]' : 'text-[#666666]/40'
                                }`}>
                                  {achievement.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-8 pt-0 relative z-10">
                            <div className="flex items-center justify-between mt-4">
                              {unlocked ? (
                                <Badge className="rounded-full px-5 py-2 bg-gradient-to-r from-[#800080] to-[#9B30FF] text-white border-none font-black text-[9px] uppercase tracking-[0.2em] shadow-lg">
                                  <Check className="h-3 w-3 mr-1.5" />
                                  CONQUISTADO
                                </Badge>
                              ) : (
                                <span className="text-[10px] font-black text-[#666666]/40 uppercase tracking-[0.2em] italic">
                                  BLOQUEADO
                                </span>
                              )}
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-[#FFDAB9]">
                                <Star className="h-3.5 w-3.5 text-[#FFA500] fill-[#FFA500]" />
                                <span className="font-black text-xs text-[#FFA500] tracking-tighter">+{achievement.xpReward} XP</span>
                              </div>
                            </div>
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
