import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
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
  Share2,
  HandHeart,
  Menu,
  HelpCircle,
  Info,
  FileText as FileTextIcon,
  Shield,
  Mail,
  LogOut,
  Edit,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useLanguage } from '@/contexts/LanguageContext';
import { APP_VERSION, APP_NAME } from "@/lib/config";
import type { ReadingPlan, Highlight, Note, Bookmark, Prayer, Achievement as AchievementType } from "@shared/schema";

import { getLevelByXp, getXpProgressInLevel, GAMIFICATION_LEVELS } from "@/lib/gamification-levels";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plans");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName || "");
  const [editLastName, setEditLastName] = useState(user?.lastName || "");
  
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

  const updateNameMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/user/profile", {
        firstName: editFirstName,
        lastName: editLastName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setEditDialogOpen(false);
      toast({ title: "Sucesso!", description: "Nome atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível atualizar o nome", variant: "destructive" });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/subscriptions/cancel", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/status"] });
      toast({ title: "Sucesso!", description: "Assinatura cancelada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível cancelar a assinatura", variant: "destructive" });
    },
  });

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">{t.common?.loading || "Carregando..."}</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-slate-50/5 to-amber-50/5 dark:from-background dark:via-slate-950/10 dark:to-amber-950/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl border-none premium-card ring-2 ring-primary/15">
          <CardHeader className="text-center pt-8">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black">{t.profile?.title || "Meu Perfil"}</CardTitle>
            <CardDescription className="text-base px-6">
              Faça login para acessar suas conquistas, planos de leitura e configurações personalizadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-12 px-8">
            <Link href="/login" className="w-full">
              <Button size="lg" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                Entrar agora
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Double check if user is still null even if isLoading is false (unexpected but possible)
  if (!user) return null;

  const xp = user.experiencePoints || 0;
  const currentLevel = getLevelByXp(xp);
  const xpProgressInfo = getXpProgressInLevel(xp, currentLevel.level);
  const isMaxLevel = currentLevel.level >= 50;
  const nextLevel = isMaxLevel ? currentLevel : GAMIFICATION_LEVELS[currentLevel.level];

  const activePlans = readingPlans.filter(p => !p.isCompleted);
  const completedPlans = readingPlans.filter(p => p.isCompleted);

  return (
    <div className="min-h-screen bg-[#fcfaff] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200/40 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-100/50 rounded-full blur-[150px]" />
      
      {/* Mobile Header with Action Buttons */}
      <div className="md:hidden sticky top-0 z-20 bg-background/80 backdrop-blur-2xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-share-profile-mobile">
            <Share2 className="h-5 w-5" />
          </Button>
          <Link href="/configurações">
            <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-settings-mobile">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-menu-mobile">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Acesse informações e recursos adicionais
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                <Link href="/donate">
                  <Button variant="ghost" className="w-full justify-start" data-testid="menu-donate">
                    <Heart className="h-4 w-4 mr-3 fill-current text-pink-600" />
                    Doar
                  </Button>
                </Link>
                <Separator />
                <Link href="/help">
                  <Button variant="ghost" className="w-full justify-start" data-testid="menu-help">
                    <HelpCircle className="h-4 w-4 mr-3 text-blue-500" />
                    Ajuda e Suporte
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="ghost" className="w-full justify-start" data-testid="menu-about">
                    <Info className="h-4 w-4 mr-3 text-emerald-500" />
                    Sobre o BíbliaFS
                  </Button>
                </Link>
                <Link href="/terms">
                  <Button variant="ghost" className="w-full justify-start" data-testid="menu-terms">
                    <FileTextIcon className="h-4 w-4 mr-3 text-amber-500" />
                    Termos de Uso
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button variant="ghost" className="w-full justify-start" data-testid="menu-privacy">
                    <Shield className="h-4 w-4 mr-3 text-slate-600" />
                    Política de Privacidade
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" className="w-full justify-start" data-testid="menu-contact">
                    <Mail className="h-4 w-4 mr-3 text-pink-500" />
                    Fale Conosco
                  </Button>
                </Link>
                <Separator />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive" 
                  onClick={async () => {
                    const { supabase } = await import("@/lib/supabase");
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  data-testid="menu-logout"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  {t.profile.logout}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        <Card className="rounded-[2.5rem] border-none bg-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full z-0" />
          <CardContent className="pt-10 pb-10 px-10 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <ProfileImageUpload 
                currentImage={user.profileImageUrl} 
                userName={`${user.firstName} ${user.lastName}`}
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter text-slate-800 uppercase" data-testid="text-profile-name">
                    {user.firstName} {user.lastName}
                  </h1>
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" data-testid="button-edit-name">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Nome</DialogTitle>
                        <DialogDescription>Altere seu primeiro e último nome</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">Primeiro Nome</Label>
                          <Input 
                            id="first-name"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            data-testid="input-first-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Último Nome</Label>
                          <Input 
                            id="last-name"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                        <Button 
                          onClick={() => updateNameMutation.mutate()}
                          disabled={updateNameMutation.isPending}
                          data-testid="button-save-name"
                        >
                          {updateNameMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {user.isTeacher && (
                    <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
                      Professor
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Nível {currentLevel.level} - {currentLevel.title}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white border-none shadow-[0_0_15px_rgba(var(--primary),0.4)] font-black italic tracking-tighter">
                    v{APP_VERSION}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                {user.subscriptionPlan && user.subscriptionPlan !== 'free' && (
                  <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm">
                      Plano: <span className="font-semibold">{user.subscriptionPlan === 'monthly' ? 'Premium Mensal' : user.subscriptionPlan === 'yearly' ? 'Premium Anual' : 'Premium Plus'}</span>
                    </p>
                  </div>
                )}
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800 tracking-tight">{user.readingStreak || 0}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t.profile.reading_streak}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800 tracking-tight">{completedPlans.length}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t.plans.completedPlans}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800 tracking-tight">{achievements.length}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t.profile.achievements}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Desktop Action Buttons */}
              <div className="hidden md:flex flex-row gap-2">
                <Button variant="outline" data-testid="button-share-profile">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                {user.subscriptionPlan && user.subscriptionPlan !== 'free' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" data-testid="button-cancel-subscription">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancelar Plano
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancelar Assinatura?</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja cancelar sua assinatura? Você perderá todos os benefícios premium.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" data-testid="button-cancel-dialog">
                          Voltar
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => cancelSubscriptionMutation.mutate()}
                          disabled={cancelSubscriptionMutation.isPending}
                          data-testid="button-confirm-cancel"
                        >
                          {cancelSubscriptionMutation.isPending ? "Cancelando..." : "Sim, Cancelar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Link href="/configurações">
                  <Button variant="outline" data-testid="button-settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" data-testid="button-menu">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                      <SheetDescription>
                        Acesse informações e recursos adicionais
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-2">
                      <Link href="/donate">
                        <Button variant="ghost" className="w-full justify-start" data-testid="menu-donate">
                          <Heart className="h-4 w-4 mr-3 fill-current text-pink-600" />
                          Doar
                        </Button>
                      </Link>
                      <Separator />
                      <Link href="/help">
                        <Button variant="ghost" className="w-full justify-start" data-testid="menu-help">
                          <HelpCircle className="h-4 w-4 mr-3 text-blue-500" />
                          Ajuda e Suporte
                        </Button>
                      </Link>
                      <Link href="/about">
                        <Button variant="ghost" className="w-full justify-start" data-testid="menu-about">
                          <Info className="h-4 w-4 mr-3 text-emerald-500" />
                          Sobre o BíbliaFS
                        </Button>
                      </Link>
                      <Link href="/terms">
                        <Button variant="ghost" className="w-full justify-start" data-testid="menu-terms">
                          <FileTextIcon className="h-4 w-4 mr-3 text-amber-500" />
                          Termos de Uso
                        </Button>
                      </Link>
                      <Link href="/privacy">
                        <Button variant="ghost" className="w-full justify-start" data-testid="menu-privacy">
                          <Shield className="h-4 w-4 mr-3 text-slate-600" />
                          Política de Privacidade
                        </Button>
                      </Link>
                      <Link href="/contact">
                        <Button variant="ghost" className="w-full justify-start" data-testid="menu-contact">
                          <Mail className="h-4 w-4 mr-3 text-pink-500" />
                          Fale Conosco
                        </Button>
                      </Link>
                      <Separator />
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive" 
                        onClick={async () => {
                          const { supabase } = await import("@/lib/supabase");
                          await supabase.auth.signOut();
                          window.location.href = "/";
                        }}
                        data-testid="menu-logout"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        {t.profile.logout}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {t.progress.level} {currentLevel.title}
                </span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {isMaxLevel ? `${xp} ${t.progress.xp} (Máximo)` : `${xpProgressInfo.current} / ${xpProgressInfo.needed} ${t.progress.xp}`}
                </span>
              </div>
              <Progress value={Math.min(xpProgressInfo.percent, 100)} className="h-2 bg-slate-100" />
              {!isMaxLevel && (
                <p className="text-[10px] font-bold text-slate-300 mt-2 italic">
                  Próximo nível: {nextLevel.title}
                </p>
              )}
              {isMaxLevel && (
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 italic">
                  Nível máximo alcançado!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto bg-white/50 backdrop-blur-xl rounded-2xl p-1.5 shadow-xl border border-slate-100" data-testid="tabs-profile">
            <TabsTrigger value="plans" className="flex-col gap-1.5 py-4 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:shadow-sm transition-all text-slate-400 data-[state=active]:text-primary" data-testid="tab-plans">
              <BookOpen className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.profile.my_plans}</span>
            </TabsTrigger>
            <TabsTrigger value="prayers" className="flex-col gap-1.5 py-4 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:shadow-sm transition-all text-slate-400 data-[state=active]:text-primary" data-testid="tab-prayers">
              <HandHeart className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.nav.prayers}</span>
            </TabsTrigger>
            <TabsTrigger value="donate" className="flex-col gap-1.5 py-4 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:shadow-sm transition-all text-slate-400 data-[state=active]:text-primary" data-testid="tab-donate">
              <Heart className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Doar</span>
            </TabsTrigger>
          </TabsList>

          {/* Donate Tab */}
          <TabsContent value="donate" className="space-y-6 mt-10">
            <Card className="rounded-[2.5rem] border-none bg-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/5 via-transparent to-transparent rounded-bl-full z-0" />
              <CardHeader className="p-8 sm:p-10 relative z-10">
                <CardTitle className="flex items-start gap-4 text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-tight">
                  <Heart className="h-6 w-6 text-pink-600 fill-pink-600 mt-1 shrink-0 animate-pulse" />
                  <span>Sua doação mantém o BíbliaFS 100% gratuito e ajuda a levar a Palavra a mais pessoas, em mais idiomas.</span>
                </CardTitle>
                <CardDescription className="mt-4 text-base font-bold text-slate-400 italic leading-relaxed">
                  Mas não é só isso: cada contribuição sustenta os desenvolvedores que trabalham incansavelmente — dia e noite — para aprimorar a experiência, corrigir bugs, adicionar recursos e tornar o app mais leve, rápido e acessível para todos.
                  <br /><br />
                  Você não está só doando. Você está sendo parte da história de quem busca a Palavra, onde quer que esteja.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 sm:p-10 pt-0 relative z-10">
                <Link href="/donate">
                  <Button className="w-full h-16 rounded-2xl text-xl font-black italic uppercase tracking-widest shadow-xl shadow-primary/20" size="lg" data-testid="button-go-donate">
                    <Heart className="h-5 w-5 mr-3 fill-current" />
                    Fazer uma Doação
                  </Button>
                </Link>
                <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 italic">Suas doações ajudam em:</p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="p-1 rounded-full bg-green-500/10 shadow-inner">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-bold text-slate-600">Manter o aplicativo gratuito para todos</span>
                    </li>
                    <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="p-1 rounded-full bg-green-500/10 shadow-inner">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-bold text-slate-600">Traduzir a Bíblia para mais idiomas</span>
                    </li>
                    <li className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="p-1 rounded-full bg-green-500/10 shadow-inner">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-bold text-slate-600">Desenvolver novos recursos e melhorias</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Old Activity Tab - Removed */}
          <TabsContent value="activity" className="space-y-6 mt-6 hidden">
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
                          <p className="font-medium">{highlight.book} {highlight.chapter}:{highlight.verse}</p>
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
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
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
                          <p className="font-medium">{note.book} {note.chapter}{note.verse ? `:${note.verse}` : ''}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {note.content}
                          </p>
                        </div>
                      ))}
                      {notes.length > 5 && (
                        <Link href="/favorites">
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
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
                          <p className="font-medium">{bookmark.book} {bookmark.chapter}:{bookmark.verse}</p>
                          {bookmark.note && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {bookmark.note}
                            </p>
                          )}
                        </div>
                      ))}
                      {bookmarks.length > 5 && (
                        <Link href="/favorites">
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-primary">
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
                    {t.plans.activePlans}
                  </CardTitle>
                  <CardDescription>
                    {activePlans.length} plano{activePlans.length !== 1 ? 's' : ''} em andamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activePlans.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">{t.plans.noActivePlans}</p>
                      <Link href="/plans">
                        <Button>Explorar Planos</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activePlans.map((plan) => {
                        const planProgress = Math.round(((plan.currentDay || 1) / plan.totalDays) * 100);
                        return (
                          <div key={plan.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold">{plan.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {t.plans.day} {plan.currentDay || 1} de {plan.totalDays}
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
                    {t.plans.completedPlans}
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
                                {plan.totalDays} {t.plans.days}
                              </p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          </div>
                          {plan.completedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {t.plans.completedOn} {new Date(plan.completedAt).toLocaleDateString()}
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

          {/* Old Achievements Tab - Removed */}
          <TabsContent value="achievements" className="space-y-6 mt-6 hidden">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {t.profile.achievements}
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
                          <p className="text-xs text-muted-foreground mt-2">
                            +{achievement.xpReward} XP
                          </p>
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
                  <HandHeart className="h-5 w-5 text-pink-600" />
                  Diário de Orações
                </CardTitle>
                <CardDescription>
                  {prayers.length} oração{prayers.length !== 1 ? 'ões' : ''} registrada{prayers.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {prayers.length === 0 ? (
                  <div className="text-center py-8">
                    <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
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
                            {prayer.isAnswered && (
                              <div className="mt-2">
                                <Badge className="bg-green-500/10 text-green-700 border-green-200 text-xs">
                                  Respondida
                                </Badge>
                              </div>
                            )}
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

          {/* Old Stats Tab - Removed */}
          <TabsContent value="stats" className="space-y-6 mt-6 hidden">
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
        </motion.div>
        
        {/* Version Footer */}
        <div className="text-center py-8 mt-8 border-t border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <p className="text-base font-medium text-primary">
            {APP_NAME} v{APP_VERSION}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Desenvolvido por FabriSite</p>
        </div>
      </div>
    </div>
  );
}
