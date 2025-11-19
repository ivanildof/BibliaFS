import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User,
  BookOpen,
  MessageSquare,
  Award,
  TrendingUp,
  Calendar,
  Target,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

const achievements = [
  { icon: BookOpen, title: "Leitor Dedicado", description: "100 dias de leitura", earned: true },
  { icon: MessageSquare, title: "Guerreiro de Oração", description: "50 orações registradas", earned: true },
  { icon: Award, title: "Mestre Estudante", description: "Completou 5 planos", earned: true },
  { icon: TrendingUp, title: "Influenciador", description: "100 curtidas na comunidade", earned: false },
];

const levelInfo = {
  iniciante: { 
    name: "Iniciante", 
    next: "Crescendo", 
    minXP: 0, 
    maxXP: 100,
    color: "text-gray-600"
  },
  crescendo: { 
    name: "Crescendo", 
    next: "Discípulo", 
    minXP: 100, 
    maxXP: 500,
    color: "text-blue-600"
  },
  discipulo: { 
    name: "Discípulo", 
    next: "Professor", 
    minXP: 500, 
    maxXP: 1000,
    color: "text-purple-600"
  },
  professor: { 
    name: "Professor", 
    next: "Máximo", 
    minXP: 1000, 
    maxXP: 1000,
    color: "text-gold-600"
  },
};

export default function Profile() {
  const { user } = useAuth();
  
  if (!user) return null;

  const currentLevel = levelInfo[user.level as keyof typeof levelInfo] || levelInfo.iniciante;
  const xp = user.experiencePoints || 0;
  const progress = ((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-3xl font-bold" data-testid="text-profile-name">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.isTeacher && (
                    <Badge className="bg-orange-500/10 text-orange-700">
                      Professor
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.readingStreak || 0} dias</p>
                      <p className="text-xs text-muted-foreground">Sequência</p>
                    </div>
                  </div>
                  
                  <Separator orientation="vertical" className="h-12" />
                  
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Award className={`h-4 w-4 ${currentLevel.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{currentLevel.name}</p>
                      <p className="text-xs text-muted-foreground">Nível</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link href="/settings">
                <Button variant="outline" data-testid="button-edit-profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Progresso Espiritual
                </CardTitle>
                <CardDescription>
                  Próximo nível: {currentLevel.next}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {xp} / {currentLevel.maxXP} XP
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center pt-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">12</div>
                      <p className="text-xs text-muted-foreground">Planos Completos</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">45</div>
                      <p className="text-xs text-muted-foreground">Orações</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">28</div>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Conquistas
                </CardTitle>
                <CardDescription>
                  {achievements.filter(a => a.earned).length} de {achievements.length} desbloqueadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        achievement.earned
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/30 border-border opacity-60'
                      }`}
                      data-testid={`achievement-${index}`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        achievement.earned ? 'bg-primary/20' : 'bg-muted'
                      } shrink-0`}>
                        <achievement.icon className={`h-5 w-5 ${
                          achievement.earned ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      {achievement.earned && (
                        <Award className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Membro desde</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(user.createdAt!).toLocaleDateString('pt-BR', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Tema Atual</span>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {user.selectedTheme?.replace('_', ' ') || 'Clássico'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Completou Salmos 23</p>
                    <p className="text-xs text-muted-foreground">Há 2 horas</p>
                  </div>
                </div>
                
                <div className="flex gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 shrink-0">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Nova oração</p>
                    <p className="text-xs text-muted-foreground">Ontem</p>
                  </div>
                </div>
                
                <div className="flex gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 shrink-0">
                    <Award className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Desbloqueou conquista</p>
                    <p className="text-xs text-muted-foreground">Há 3 dias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
