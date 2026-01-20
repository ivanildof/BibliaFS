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
    { title: t.nav.home, url: "/", icon: Home, color: "text-blue-500" },
    { title: t.nav.bible, url: "/bible-reader", icon: BookOpen, color: "text-emerald-500" },
    { title: t.favorites.title, url: "/favorites", icon: Bookmark, color: "text-rose-500" },
    { title: t.nav.plans, url: "/plans", icon: Book, color: "text-amber-500" },
    { title: t.nav.progress, url: "/progress", icon: Trophy, color: "text-yellow-500" },
    { title: t.nav.prayers, url: "/prayers", icon: MessageSquare, color: "text-violet-500" },
  ];

  const studyItems = [
    { title: t.nav.compareVersions, url: "/compare", icon: Columns, color: "text-indigo-500" },
    { title: "Conquistas", url: "/achievements", icon: Trophy, color: "text-yellow-500" },
    { title: t.nav.discover, url: "/community", icon: Users, color: "text-cyan-500" },
    { title: t.nav.studyGroups, url: "/groups", icon: UsersRound, color: "text-orange-500" },
    { title: t.nav.podcasts, url: "/podcasts", icon: Headphones, color: "text-pink-500" },
  ];

  const teacherItems = [
    { title: t.nav.teacherMode, url: "/teacher", icon: GraduationCap, color: "text-primary" },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-4">
          <img src={logoImage} alt="BíbliaFS Logo" className="h-12 w-12 object-cover rounded-2xl shadow-lg" />
          <div>
            <h2 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100">{t.common.appName}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.sections.premiumStudy}</p>
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
                      <item.icon className={cn("h-4 w-4", item.color)} />
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
                      <item.icon className={cn("h-4 w-4", item.color)} />
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
                      <item.icon className={cn("h-4 w-4", item.color)} />
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
                    <Settings className="h-4 w-4 text-primary" />
                    <span>{t.nav.settings}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/about"} data-testid="link-sidebar-about">
                  <Link href="/about">
                    <Info className="h-4 w-4 text-emerald-500" />
                    <span>{t.sections.about}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/contact"} data-testid="link-sidebar-feedback">
                  <Link href="/contact">
                    <MessageSquare className="h-4 w-4 text-pink-500" />
                    <span>Feedback</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          © 2026 - BíbliaFS. Todos os direitos reservados. Desenvolvido por |{" "}
          <a 
            href="https://fabrisite.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 hover:underline transition-colors"
            data-testid="link-fabrisite-sidebar"
          >
            FabriSite
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
