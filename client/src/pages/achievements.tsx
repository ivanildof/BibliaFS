import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trophy, Star, Sparkles, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
}

export default function Achievements() {
  const { t } = useLanguage();
  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements/user"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando conquistas...</p>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements?.filter((a) => a.unlockedAt).length || 0;
  const totalCount = achievements?.length || 0;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 mb-10"
        >
          <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">GAMIFICAÇÃO</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Conquistas
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso e desbloqueie recompensas
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-bold">Progresso Geral</span>
                </div>
                <Badge variant="outline" className="rounded-full px-4 py-2 bg-background/50 border-primary/20 font-bold text-primary">
                  {unlockedCount} de {totalCount} concluídas
                </Badge>
              </div>
              <Progress value={progressPercent} className="h-3 rounded-full" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {progressPercent.toFixed(0)}% das conquistas desbloqueadas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {achievements?.map((achievement, idx) => {
              const isUnlocked = !!achievement.unlockedAt;
              const progress = (achievement.currentValue / achievement.requirementValue) * 100;

              return (
                <motion.div
                  key={achievement.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className={`rounded-2xl border-none backdrop-blur-xl shadow-lg h-full transition-all ${
                      isUnlocked 
                        ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5" 
                        : "bg-card/60 opacity-80"
                    }`}
                  >
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                      <div className={`p-3 rounded-xl ${
                        isUnlocked 
                          ? "bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20" 
                          : "bg-muted"
                      }`}>
                        {isUnlocked ? (
                          <Trophy className="h-6 w-6 text-white" />
                        ) : (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <CardTitle className={`text-lg ${isUnlocked ? "text-amber-600" : ""}`}>
                          {achievement.name}
                        </CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">
                            {achievement.currentValue} / {achievement.requirementValue}
                          </span>
                          {isUnlocked ? (
                            <Badge className="rounded-full px-3 py-1 bg-green-500/10 text-green-600 border-none font-bold text-[10px] uppercase tracking-widest">
                              Desbloqueado
                            </Badge>
                          ) : (
                            <span className="font-bold text-primary">{Math.round(progress)}%</span>
                          )}
                        </div>
                        {!isUnlocked && (
                          <Progress value={progress} className="h-2 rounded-full" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {(!achievements || achievements.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-2xl border-dashed border-none bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-muted/50 mb-6">
                  <Star className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2">Nenhuma conquista ainda</h3>
                <p className="text-muted-foreground max-w-md">
                  Continue lendo a Bíblia para desbloquear conquistas e ganhar recompensas!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
