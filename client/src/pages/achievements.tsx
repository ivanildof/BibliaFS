import { useQuery } from "@tanstack/react-query";
import { Loader2, Trophy, Star, Target, Calendar } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const unlockedCount = achievements?.filter((a) => a.unlockedAt).length || 0;
  const totalCount = achievements?.length || 0;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Conquistas</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e desbloqueie recompensas espirituais.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-sm text-muted-foreground">
                  {unlockedCount} de {totalCount} concluídas
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {achievements?.map((achievement) => {
            const isUnlocked = !!achievement.unlockedAt;
            const progress = (achievement.currentValue / achievement.requirementValue) * 100;

            return (
              <Card key={achievement.id} className={!isUnlocked ? "opacity-75" : "border-primary/50 bg-primary/5"}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className={`p-2 rounded-full ${isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {achievement.currentValue} / {achievement.requirementValue}
                      </span>
                      {isUnlocked ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Desbloqueado</Badge>
                      ) : (
                        <span className="text-muted-foreground">{Math.round(progress)}%</span>
                      )}
                    </div>
                    {!isUnlocked && <Progress value={progress} className="h-1" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
