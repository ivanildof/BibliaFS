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
  CloudOff,
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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { title: t.nav.home, url: "/", icon: Home },
    { title: t.nav.bible, url: "/bible-reader", icon: BookOpen },
    { title: t.favorites.title, url: "/favorites", icon: Bookmark },
    { title: t.offline.title, url: "/offline", icon: CloudOff },
    { title: t.nav.plans, url: "/plans", icon: Book },
    { title: t.nav.progress, url: "/progress", icon: Trophy },
    { title: t.nav.prayers, url: "/prayers", icon: MessageSquare },
  ];

  const studyItems = [
    { title: t.nav.aiStudy, url: "/ai-study", icon: Brain },
    { title: t.nav.discover, url: "/community", icon: Users },
    { title: t.nav.podcasts, url: "/podcasts", icon: Headphones },
  ];

  const teacherItems = [
    { title: t.nav.teacherMode, url: "/teacher", icon: GraduationCap },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Book className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{t.common.appName}</h2>
            <p className="text-xs text-muted-foreground">{t.sections.premiumStudy}</p>
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

        {user?.isTeacher && (
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
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/settings"} data-testid="link-sidebar-settings">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>{t.nav.settings}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t">
        {user && (
          <Link href="/profile">
            <div className="flex items-center gap-3 rounded-2xl p-3 hover-elevate active-elevate-2 cursor-pointer shadow-md" data-testid="link-profile">
              <Avatar className="h-11 w-11 ring-2 ring-accent/50">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" data-testid="text-username">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </Link>
        )}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          © 2025 Bíblia+. Todos os direitos reservados.
          <br />
          Desenvolvido por |{" "}
          <a 
            href="https://fabrisite.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            data-testid="link-fabrisite-sidebar"
          >
            FabriSite
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
