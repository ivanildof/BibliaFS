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
  const iconClass = isUnlocked ? "h-7 w-7 text-white" : "h-7 w-7 text-slate-300";
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

const getAchievementGradient = (index: number, isUnlocked: boolean) => {
  if (!isUnlocked) return "from-slate-600 to-slate-800";
  const gradients = [
    "from-amber-500 to-orange-700",
    "from-emerald-500 to-teal-700",
    "from-blue-600 to-indigo-800",
    "from-purple-600 to-pink-800",
    "from-rose-600 to-red-800",
    "from-cyan-600 to-blue-800",
  ];
  return gradients[index % gradients.length];
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
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Resgatando Suas Glórias...</p>
        </div>
      </div>
    );
  }

  const unlockedAchievements = achievements?.filter((a) => a.unlockedAt) || [];
  const lockedAchievements = achievements?.filter((a) => !a.unlockedAt) || [];
  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements?.length || 0;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#fcfaff] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-10 px-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-slate-200" />
            <Trophy className="h-7 w-7 text-amber-500 animate-bounce drop-shadow-sm" />
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-slate-200" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">SALÃO DE CONQUISTAS</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Seus Troféus
          </h1>
          <p className="text-base text-slate-400 font-bold italic">
            Cada marco é uma prova da sua dedicação à Palavra.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
            <Card className="rounded-[2.5rem] border-none bg-white shadow-xl mb-12 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 opacity-70 group-hover:opacity-100 transition-opacity z-0" />
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-200 transform group-hover:rotate-6 transition-transform border border-white/50">
                      <Sparkles className="h-8 w-8 text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="text-3xl font-black text-slate-800 tracking-tighter">Progresso Lendário</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Nível de Domínio das Escrituras</p>
                    </div>
                  </div>
                  <Badge className="rounded-full px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none font-black text-xs shadow-xl shadow-amber-200 transform hover:scale-105 transition-transform tracking-widest uppercase">
                    {unlockedCount} DE {totalCount} CONQUISTADAS
                  </Badge>
                </div>
                <div className="relative">
                  <ProgressBar value={progressPercent} className="h-6 rounded-full bg-slate-100 shadow-inner" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      {progressPercent.toFixed(0)}% CONCLUÍDO
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
        </motion.div>

        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-14"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-white shadow-lg border border-slate-50">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Desbloqueadas</h2>
              <Badge className="rounded-full text-xs font-black bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1">
                {unlockedCount}
              </Badge>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {unlockedAchievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="rounded-[2rem] border-none h-full overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white shadow-xl relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${getAchievementGradient(idx, true)} opacity-[0.05] group-hover:opacity-[0.1] transition-opacity z-0`} />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full z-0" />
                      <CardHeader className="flex flex-row items-center gap-5 space-y-0 p-6 relative z-10">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${getAchievementGradient(idx, true)} shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all border border-white/50`}>
                          {getAchievementIcon(achievement.icon, true)}
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                          <CardTitle className="text-xl font-black tracking-tighter text-slate-800">
                            {achievement.name}
                          </CardTitle>
                          <CardDescription className="text-sm font-bold text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors">{achievement.description}</CardDescription>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 relative z-10 flex justify-between items-center">
                        <Badge className="rounded-full px-5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-200">
                          <Check className="h-3 w-3 mr-2" />
                          CONQUISTADO
                        </Badge>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-100 shadow-sm">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="font-black text-amber-600 text-[11px] tracking-tighter">+{achievement.xpReward || 50} XP</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {lockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-white shadow-lg border border-slate-50">
                <Lock className="h-5 w-5 text-slate-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-400 tracking-tighter uppercase">Em Progresso</h2>
              <Badge className="rounded-full text-xs font-black bg-slate-100 text-slate-400 border border-slate-200 px-3 py-1">
                {lockedAchievements.length}
              </Badge>
            </div>
          <div className="grid gap-6 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {lockedAchievements.map((achievement, idx) => {
                  const currentVal = achievement.currentValue ?? 0;
                  const requiredVal = achievement.requirementValue ?? 1;
                  const progress = requiredVal > 0 ? (currentVal / requiredVal) * 100 : 0;

                  return (
                    <motion.div
                      key={achievement.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="rounded-[2rem] border-none h-full overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-white shadow-lg relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent rounded-bl-full z-0" />
                        
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-6 pb-2 relative z-10">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm transition-all group-hover:scale-105">
                            {getAchievementIcon(achievement.icon, false)}
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1">
                            <CardTitle className="text-lg font-black text-slate-700 tracking-tighter leading-tight">
                              {achievement.name}
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400 leading-tight">
                              {achievement.description}
                            </CardDescription>
                          </div>
                        </CardHeader>

                        <CardContent className="px-6 pb-6 pt-2 relative z-10">
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                              BLOQUEADO
                            </span>
                            
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-100 shadow-sm">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="font-black text-amber-600 text-[11px] tracking-tight">+{achievement.xpReward || 50} XP</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {(!achievements || achievements.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-slate-50 mb-8 shadow-inner border border-slate-100">
                  <Trophy className="h-14 w-14 text-slate-200" />
                </div>
                <h3 className="font-black text-3xl mb-3 tracking-tighter text-slate-800 uppercase italic">O Palácio está Silencioso</h3>
                <p className="text-slate-400 max-w-md text-base font-bold italic">
                  Suas glórias ainda não foram escritas. Abra as Escrituras e comece sua jornada para a eternidade.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
