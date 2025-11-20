import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User,
  BookOpen,
  MessageSquare,
  Award,
  TrendingUp,
  Calendar,
  Target,
  Settings,
  BookmarkIcon,
  Highlighter,
  FileText,
  CheckCircle2,
  Clock,
  Heart,
  Share2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { ReadingPlan, Highlight, Note, Bookmark, Prayer, Achievement as AchievementType } from "@shared/schema";

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
  const [activeTab, setActiveTab] = useState("activity");
  
  // Fetch user data
  const { data: readingPlans = [] } = useQuery<ReadingPlan[]>({
    queryKey: ["/api/reading-plans"],
    enabled: !!user,
  });

  const { data: highlights = [] } = useQuery<Highlight[]>({
    queryKey: ["/api/bible/highlights"],
    enabled: !!user,
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/bible/notes"],
    enabled: !!user,
  });

  const { data: bookmarks = [] } = useQuery<Bookmark[]>({
    queryKey: ["/api/bible/bookmarks"],
    enabled: !!user,
  });

  const { data: prayers = [] } = useQuery<Prayer[]>({
    queryKey: ["/api/prayers"],
    enabled: !!user,
  });

  const { data: achievements = [] } = useQuery<AchievementType[]>({
    queryKey: ["/api/achievements/user"],
    enabled: !!user,
  });

  if (!user) return null;

  const currentLevel = levelInfo[user.level as keyof typeof levelInfo] || levelInfo.iniciante;
  const xp = user.experiencePoints || 0;
  const xpProgress = ((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100;

  const activePlans = readingPlans.filter(p => !p.isCompleted);
  const completedPlans = readingPlans.filter(p => p.isCompleted);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-24 w-24" data-testid="avatar-profile">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="font-display text-3xl font-bold" data-testid="text-profile-name">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.isTeacher && (
                    <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
                      Professor
                    </Badge>
                  )}
                  <Badge variant="secondary" className={currentLevel.color}>
                    {currentLevel.name}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{user.readingStreak || 0}</p>
                      <p className="text-xs text-muted-foreground">Dias de sequência</p>
                    </div>
                  </div>
                  
                  <Separator orientation="vertical" className="h-14 hidden md:block" />
                  
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{completedPlans.length}</p>
                      <p className="text-xs text-muted-foreground">Planos completos</p>
                    </div>
                  </div>
                  
                  <Separator orientation="vertical" className="h-14 hidden md:block" />
                  
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{achievements.length}</p>
                      <p className="text-xs text-muted-foreground">Conquistas</p>
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

            {/* XP Progress Bar */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Nível {currentLevel.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {xp} / {currentLevel.maxXP} XP
                </span>
              </div>
              <Progress value={Math.min(xpProgress, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Próximo nível: {currentLevel.next}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto" data-testid="tabs-profile">
            <TabsTrigger value="activity" className="flex-col gap-1 py-3" data-testid="tab-activity">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Atividade</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex-col gap-1 py-3" data-testid="tab-plans">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Planos</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex-col gap-1 py-3" data-testid="tab-achievements">
              <Award className="h-4 w-4" />
              <span className="text-xs">Conquistas</span>
            </TabsTrigger>
            <TabsTrigger value="prayers" className="flex-col gap-1 py-3" data-testid="tab-prayers">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Orações</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-col gap-1 py-3" data-testid="tab-stats">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Estatísticas</span>
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Highlighter className="h-5 w-5 text-yellow-600" />
                    Destaques
                  </CardTitle>
                  <CardDescription>{highlights.length} versículos destacados</CardDescription>
                </CardHeader>
                <CardContent>
                  {highlights.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum destaque ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {highlights.slice(0, 5).map((highlight) => (
                        <div key={highlight.id} className="text-sm">
                          <p className="font-medium">{highlight.verseReference}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: highlight.color }}
                            />
                            <p className="text-xs text-muted-foreground">
                              {new Date(highlight.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {highlights.length > 5 && (
                        <Link href="/favorites">
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            Ver todos ({highlights.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Notas
                  </CardTitle>
                  <CardDescription>{notes.length} notas criadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma nota ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {notes.slice(0, 5).map((note) => (
                        <div key={note.id} className="text-sm">
                          <p className="font-medium">{note.verseReference}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {note.content}
                          </p>
                        </div>
                      ))}
                      {notes.length > 5 && (
                        <Link href="/favorites">
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            Ver todas ({notes.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bookmarks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookmarkIcon className="h-5 w-5 text-green-600" />
                    Favoritos
                  </CardTitle>
                  <CardDescription>{bookmarks.length} favoritos salvos</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookmarks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum favorito ainda</p>
                  ) : (
                    <div className="space-y-3">
                      {bookmarks.slice(0, 5).map((bookmark) => (
                        <div key={bookmark.id} className="text-sm">
                          <p className="font-medium">{bookmark.verseReference}</p>
                          {bookmark.note && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {bookmark.note}
                            </p>
                          )}
                        </div>
                      ))}
                      {bookmarks.length > 5 && (
                        <Link href="/favorites">
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            Ver todos ({bookmarks.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {/* Active Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Planos Ativos
                  </CardTitle>
                  <CardDescription>
                    {activePlans.length} plano{activePlans.length !== 1 ? 's' : ''} em andamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activePlans.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">Nenhum plano ativo</p>
                      <Link href="/plans">
                        <Button>Explorar Planos</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activePlans.map((plan) => {
                        const planProgress = Math.round((plan.currentDay / plan.totalDays) * 100);
                        return (
                          <div key={plan.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold">{plan.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Dia {plan.currentDay} de {plan.totalDays}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {planProgress}%
                              </Badge>
                            </div>
                            <Progress value={planProgress} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Planos Completados
                  </CardTitle>
                  <CardDescription>
                    {completedPlans.length} plano{completedPlans.length !== 1 ? 's' : ''} finalizado{completedPlans.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedPlans.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Complete seu primeiro plano para ver aqui!
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {completedPlans.map((plan) => (
                        <div key={plan.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{plan.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {plan.totalDays} dias
                              </p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          </div>
                          {plan.completedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Completo em {new Date(plan.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Suas Conquistas
                </CardTitle>
                <CardDescription>
                  {achievements.length} conquista{achievements.length !== 1 ? 's' : ''} desbloqueada{achievements.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Continue lendo a Bíblia para desbloquear conquistas!
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-start gap-3 p-4 rounded-lg border bg-primary/5 border-primary/20"
                        data-testid={`achievement-${achievement.id}`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 shrink-0">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold mb-1">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.unlockedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 pt-6 border-t">
                  <Link href="/progress">
                    <Button variant="outline" className="w-full">
                      Ver Todas as Conquistas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prayers Tab */}
          <TabsContent value="prayers" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Diário de Orações
                </CardTitle>
                <CardDescription>
                  {prayers.length} oração{prayers.length !== 1 ? 'ões' : ''} registrada{prayers.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {prayers.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      Nenhuma oração registrada ainda
                    </p>
                    <Link href="/prayers">
                      <Button>Criar Oração</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prayers.slice(0, 10).map((prayer) => (
                      <div key={prayer.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1">{prayer.title}</h3>
                            {prayer.content && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {prayer.content}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {prayer.category}
                              </Badge>
                              {prayer.isAnswered && (
                                <Badge className="bg-green-500/10 text-green-700 border-green-200 text-xs">
                                  Respondida
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          {new Date(prayer.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    <Link href="/prayers">
                      <Button variant="outline" className="w-full">
                        Ver Todas as Orações
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Membro desde</span>
                    <span className="font-medium">
                      {new Date(user.createdAt!).toLocaleDateString('pt-BR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tema Atual</span>
                    <Badge variant="secondary" className="capitalize">
                      {user.selectedTheme?.replace('_', ' ') || 'Clássico'}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total de XP</span>
                    <span className="font-bold text-primary">{xp}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Highlighter className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Destaques</span>
                    </div>
                    <span className="font-bold">{highlights.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Notas</span>
                    </div>
                    <span className="font-bold">{notes.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookmarkIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Favoritos</span>
                    </div>
                    <span className="font-bold">{bookmarks.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-600" />
                      <span className="text-sm">Orações</span>
                    </div>
                    <span className="font-bold">{prayers.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
