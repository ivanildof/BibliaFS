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
    default: return 'from-slate-500 to-slate-800';
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
          <p className="text-sm text-slate-400 font-bold italic">{t.progress.loadingProgress}</p>
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
    <div className="min-h-screen bg-[#fcfaff] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100/50 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
            <Crown className="h-8 w-8 text-amber-500 fill-amber-500/30 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)] animate-pulse" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.4)]" />
          </div>
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] drop-shadow-sm">RECONHECIMENTO DE USUÁRIO</p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent drop-shadow-sm" data-testid="text-page-title">
            {t.progress.title}
          </h1>
          <p className="text-base text-slate-400 font-bold italic">
            {t.progress.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: t.progress.level, val: currentLevel, sub: levelInfo.title, icon: Crown, gradient: "from-blue-600 to-indigo-800", shadow: "shadow-blue-500/40" },
            { title: t.progress.experiencePoints, val: stats?.experiencePoints || 0, sub: t.progress.totalXpAccumulated, icon: Star, gradient: "from-amber-500 to-orange-700", shadow: "shadow-amber-500/40" },
            { title: t.progress.readingStreak, val: stats?.readingStreak || 0, sub: t.progress.consecutiveDays, icon: Flame, gradient: "from-orange-600 to-red-800", shadow: "shadow-orange-500/40" },
            { title: t.progress.achievements, val: unlockedAchievements.length, sub: `${unlockedAchievements.length}/${totalAchievements}`, icon: Trophy, gradient: "from-purple-600 to-pink-800", shadow: "shadow-purple-500/40" }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="rounded-[2rem] border-none bg-white shadow-xl overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-[0.2] group-hover:opacity-[0.3] transition-opacity`} />
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 relative">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.title}</CardTitle>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.gradient} shadow-2xl ${item.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all ring-2 ring-white/20`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className={`text-4xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent filter drop-shadow-sm`} data-testid={`text-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                    {item.val}
                  </div>
                  <p className="text-[11px] font-black mt-1 text-slate-400 uppercase tracking-wider truncate">
                    {item.sub}
                  </p>
                  {item.title === t.progress.level && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[9px] mb-1.5 font-black text-slate-300 uppercase tracking-widest">
                        <span>{xpProgressInfo.current} XP</span>
                        <span>{xpProgressInfo.needed} XP</span>
                      </div>
                      <ProgressBar value={xpProgressInfo.percent} className="h-2 rounded-full bg-muted/30 shadow-inner overflow-hidden" />
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
          <Card className="mb-12 rounded-[2.5rem] border-none bg-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full z-0" />
            <CardHeader className="relative p-8 z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-blue-700 shadow-xl shadow-primary/20 animate-pulse">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black tracking-tighter text-slate-800">{t.progress.nextLevel}</CardTitle>
                  <CardDescription className="text-base font-bold text-slate-400 mt-1">
                    {t.progress.continueReadingToLevel.replace('{level}', ((stats?.level || 1) + 1).toString())}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-8 pt-0 z-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end text-sm mb-1">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-black uppercase tracking-[0.2em] text-[10px]">Progresso da Jornada</span>
                    <span className="text-5xl font-black bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">{Math.round(xpProgressInfo.percent)}%</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full inline-block border border-slate-100">
                      {t.progress.xpNeededForLevel.replace('{xp}', (xpProgressInfo.needed - xpProgressInfo.current).toString()).replace('{level}', (currentLevel + 1).toString())}
                    </p>
                  </div>
                </div>
                <ProgressBar value={xpProgressInfo.percent} className="h-4 rounded-full shadow-inner bg-slate-100" />
                {currentLevel < 50 && (
                  <div className="flex items-center gap-3 mt-6 px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-200/50 w-fit shadow-sm">
                    <Zap className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />
                    <span className="text-base font-black text-amber-600 tracking-tight">Próximo Título: {getLevelInfo(currentLevel + 1).title}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <section>
          <div className="flex items-center gap-6 mb-12">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 shadow-2xl shadow-amber-500/40">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="font-display text-4xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                {t.progress.achievements}
              </h2>
              <p className="text-base text-slate-400 font-bold italic">Domine as escrituras e desbloqueie tesouros</p>
            </div>
          </div>
          
          {Object.entries(categoryGroups).map(([category, categoryAchievements], catIdx) => {
            const CategoryIcon = getCategoryIcon(category);
            const categoryGradient = getCategoryGradient(category);
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
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${categoryGradient} shadow-2xl ring-4 ring-background`}>
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-black text-2xl capitalize tracking-tighter">{category}</h3>
                  <Badge className={`rounded-full px-6 py-1.5 font-black text-xs bg-gradient-to-r ${categoryGradient} text-white border-none shadow-xl transform hover:scale-105 transition-transform`}>
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
                          className={`rounded-[2rem] border-none h-full overflow-hidden group transition-all duration-500 relative bg-white shadow-lg ${
                            unlocked 
                              ? 'hover:shadow-2xl hover:-translate-y-2' 
                              : 'opacity-95 hover:opacity-100'
                          }`}
                          data-testid={`card-achievement-${achievement.id}`}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full z-0" />
                          
                          <CardHeader className="p-6 pb-4 relative z-10">
                            <div className="flex items-start gap-5">
                              <div className={`p-4 rounded-2xl transition-all duration-500 shadow-md ${
                                unlocked 
                                  ? `bg-gradient-to-br ${categoryGradient} group-hover:scale-110 group-hover:rotate-6 border border-white/50`
                                  : 'bg-slate-50 grayscale opacity-40 group-hover:opacity-100 border border-slate-100'
                              }`}>
                                {unlocked ? (
                                  <Trophy className="h-6 w-6 text-white drop-shadow-sm" />
                                ) : (
                                  <Lock className="h-6 w-6 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className={`text-lg font-black flex items-center gap-2 tracking-tighter transition-colors ${
                                  unlocked ? 'text-slate-800' : 'text-slate-300'
                                }`}>
                                  {achievement.name}
                                  {unlocked && (
                                    <Sparkles className="h-4 w-4 text-amber-400 animate-pulse flex-shrink-0" />
                                  )}
                                </CardTitle>
                                <CardDescription className={`text-xs mt-1 line-clamp-2 font-bold transition-opacity ${
                                  unlocked ? 'text-slate-500' : 'text-slate-200'
                                }`}>
                                  {achievement.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-6 pt-0 relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              {unlocked ? (
                                <Badge className="rounded-full px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100">
                                  <Check className="h-3 w-3 mr-1.5" />
                                  CONQUISTADO
                                </Badge>
                              ) : (
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                  BLOQUEADO
                                </span>
                              )}
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-100 shadow-sm">
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                <span className="font-black text-[11px] text-amber-600 tracking-tighter">+{achievement.xpReward} XP</span>
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
