import {
  Book,
  Brain,
  Users,
  MessageSquare,
  Headphones,
  GraduationCap,
  Settings,
  Home,
  BookOpen,
  Trophy,
  Bookmark,
  Info,
  Columns,
  UsersRound,
  Search,
  Crown,
  Flame,
  Star,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import logoImage from "../assets/logo-new.png";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { setOpenMobile, isMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location, isMobile, setOpenMobile]);

  const xp = user?.experiencePoints || 0;
  const level = user?.level || "iniciante";
  const streak = user?.readingStreak || 0;

  const levelConfig: Record<string, { name: string; minXP: number; maxXP: number; color: string; icon: typeof Star }> = {
    iniciante: { name: "Iniciante", minXP: 0, maxXP: 100, color: "from-slate-400 to-slate-500", icon: Star },
    crescendo: { name: "Crescendo", minXP: 100, maxXP: 500, color: "from-emerald-400 to-emerald-600", icon: Sparkles },
    discipulo: { name: "Discípulo", minXP: 500, maxXP: 2000, color: "from-blue-400 to-blue-600", icon: Crown },
    professor: { name: "Professor", minXP: 2000, maxXP: 10000, color: "from-violet-400 to-violet-600", icon: GraduationCap },
  };

  const currentLevel = levelConfig[level] || levelConfig.iniciante;
  const progressToNextLevel = Math.min(100, ((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100);
  const LevelIcon = currentLevel.icon;

  const journeyItems = [
    { title: t.nav.home, url: "/", icon: Home, color: "text-violet-500" },
    { title: t.nav.bible, url: "/bible-reader", icon: BookOpen, color: "text-emerald-500" },
    { title: t.favorites.title, url: "/favorites", icon: Bookmark, color: "text-rose-400" },
    { title: t.nav.plans, url: "/plans", icon: Book, color: "text-amber-500" },
    { title: t.nav.prayers, url: "/prayers", icon: MessageSquare, color: "text-pink-400" },
  ];

  const studyItems = [
    { title: t.nav.compareVersions, url: "/compare", icon: Columns, color: "text-indigo-400" },
    { title: t.nav.teacherMode, url: "/teacher", icon: GraduationCap, color: "text-violet-500" },
    { title: t.nav.podcasts, url: "/podcasts", icon: Headphones, color: "text-teal-500" },
  ];

  const communityItems = [
    { title: t.nav.discover, url: "/community", icon: Users, color: "text-cyan-500" },
    { title: t.nav.studyGroups, url: "/groups", icon: UsersRound, color: "text-orange-400" },
    { title: "Conquistas", url: "/achievements", icon: Trophy, color: "text-amber-500" },
    { title: t.nav.progress, url: "/progress", icon: Trophy, color: "text-yellow-500" },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border/50">
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 mb-4">
          <img src={logoImage} alt="BíbliaFS Logo" className="h-10 w-10 object-cover rounded-xl shadow-md" />
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{t.common.appName}</h2>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">{t.sections.premiumStudy}</p>
          </div>
        </div>

        {user && (
          <div className="glass rounded-2xl p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div 
                className="user-avatar-ring" 
                style={{ '--xp-progress': `${progressToNextLevel}%` } as React.CSSProperties}
              >
                <Avatar className="h-11 w-11 border-2 border-background">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm">
                    {(user.firstName?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{user.firstName || "Estudante"}</p>
                <div className="flex items-center gap-1.5">
                  <div className={cn("p-0.5 rounded bg-gradient-to-br", currentLevel.color)}>
                    <LevelIcon className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{currentLevel.name}</span>
                </div>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{streak}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Próximo nível</span>
                <span className="font-semibold text-primary">{xp} XP</span>
              </div>
              <Progress value={progressToNextLevel} className="h-1.5" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">
            Minha Jornada
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {journeyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-sidebar-${item.url.slice(1) || 'home'}`}>
                    <Link href={item.url}>
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">
            Estudo Profundo
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-sidebar-${item.url.slice(1)}`}>
                    <Link href={item.url}>
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">
            Comunidade
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-sidebar-${item.url.slice(1)}`}>
                    <Link href={item.url}>
                      <item.icon className={cn("h-4 w-4", item.color)} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/configurações"} data-testid="link-sidebar-settings">
                  <Link href="/configurações">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t.nav.settings}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/about"} data-testid="link-sidebar-about">
                  <Link href="/about">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t.sections.about}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/contact"} data-testid="link-sidebar-feedback">
                  <Link href="/contact">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Feedback</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="text-center text-[10px] text-muted-foreground/70">
          © 2026 BíbliaFS • Desenvolvido por{" "}
          <a 
            href="https://fabrisite.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline transition-colors"
            data-testid="link-fabrisite-sidebar"
          >
            FabriSite
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
