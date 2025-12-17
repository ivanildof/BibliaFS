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

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { setOpenMobile, isMobile } = useSidebar();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location, isMobile, setOpenMobile]);

  const menuItems = [
    { title: t.nav.home, url: "/", icon: Home },
    { title: t.nav.bible, url: "/bible-reader", icon: BookOpen },
    { title: t.favorites.title, url: "/favorites", icon: Bookmark },
    { title: t.nav.plans, url: "/plans", icon: Book },
    { title: t.nav.progress, url: "/progress", icon: Trophy },
    { title: t.nav.prayers, url: "/prayers", icon: MessageSquare },
  ];

  const studyItems = [
    { title: t.nav.compareVersions, url: "/compare", icon: Columns },
    { title: t.nav.discover, url: "/community", icon: Users },
    { title: t.nav.studyGroups, url: "/groups", icon: UsersRound },
    { title: t.nav.podcasts, url: "/podcasts", icon: Headphones },
  ];

  const teacherItems = [
    { title: t.nav.teacherMode, url: "/teacher", icon: GraduationCap },
  ];

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6 border-b border-sidebar-border/30">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg glow-gold">
            <Book className="h-7 w-7 text-purple-900" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-sidebar-foreground">{t.common.appName}</h2>
            <p className="text-xs text-sidebar-foreground/70">{t.sections.premiumStudy}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t.sections.mainMenu}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-sidebar-${item.url.slice(1) || 'home'}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t.sections.study}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-sidebar-${item.url.slice(1)}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t.sections.teaching}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {teacherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url} data-testid={`link-sidebar-${item.url.slice(1)}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
                    <Settings className="h-4 w-4" />
                    <span>{t.nav.settings}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/about"} data-testid="link-sidebar-about">
                  <Link href="/about">
                    <Info className="h-4 w-4" />
                    <span>{t.sections.about}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/30">
        <div className="text-center text-xs text-sidebar-foreground/60">
          © 2026 - BíbliaFS. Todos os direitos reservados. Desenvolvido por |{" "}
          <a 
            href="https://fabrisite.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 hover:underline transition-colors"
            data-testid="link-fabrisite-sidebar"
          >
            FabriSite
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
