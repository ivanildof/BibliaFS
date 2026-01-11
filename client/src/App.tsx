import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OfflineProvider } from "@/contexts/OfflineContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserProfile } from "@/components/UserProfile";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

// Pages - Static imports (lazy loading incompatible with wouter)
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Bible from "@/pages/bible";
import BibleReader from "@/pages/bible-reader";
import Favorites from "@/pages/favorites";
import ReadingPlans from "@/pages/reading-plans";
import Progress from "@/pages/progress";
import Prayers from "@/pages/prayers";
import Podcasts from "@/pages/podcasts";
import Teacher from "@/pages/teacher";
import Community from "@/pages/community";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Offline from "@/pages/offline";
import Donate from "@/pages/donate";
import Pricing from "@/pages/pricing";
import Help from "@/pages/help";
import About from "@/pages/about";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Security from "@/pages/security";
import Contact from "@/pages/contact";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import Groups from "@/pages/groups";
import VersionCompare from "@/pages/version-compare";
import Achievements from "@/pages/achievements";

import { NPSDialog } from "@/components/NPSDialog";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/planos" component={Pricing} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/security" component={Security} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/groups" component={Groups} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/bible" component={BibleReader} />
          <Route path="/bible-reader" component={BibleReader} />
          <Route path="/compare" component={VersionCompare} />
          <Route path="/comparar" component={VersionCompare} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/plans" component={ReadingPlans} />
          <Route path="/progress" component={Progress} />
          <Route path="/prayers" component={Prayers} />
          <Route path="/podcasts" component={Podcasts} />
          <Route path="/teacher" component={Teacher} />
          <Route path="/groups" component={Groups} />
          <Route path="/community" component={Community} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/conquistas" component={Achievements} />
          <Route path="/configurações" component={Settings} />
          <Route path="/settings" component={Settings} />
          <Route path="/perfil" component={Profile} />
          <Route path="/offline" component={Offline} />
          <Route path="/donate" component={Donate} />
          <Route path="/doar" component={Donate} />
          <Route path="/planos" component={Pricing} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/help" component={Help} />
          <Route path="/about" component={About} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/security" component={Security} />
          <Route path="/contact" component={Contact} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

// Helper function to convert HEX to HSL
function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();
  
  // Apply user's saved theme from backend
  useEffect(() => {
    if (user?.selectedTheme) {
      const root = document.documentElement;
      
      if (user.selectedTheme === "custom" && user.customTheme) {
        const hsl = hexToHSL(user.customTheme.primaryColor);
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--sidebar-primary", hsl);
        root.style.setProperty("--sidebar-accent-foreground", hsl);
      } else {
        // Predefined themes - MUST match settings.tsx!
        const predefinedThemes: Record<string, string> = {
          classico: "#5711D9",
          noite_sagrada: "#9D44C0",
          luz_do_dia: "#00A0E3",
          terra_santa: "#8B4513",
        };
        
        const themeColor = predefinedThemes[user.selectedTheme] || predefinedThemes.classico;
        const hsl = hexToHSL(themeColor);
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--sidebar-primary", hsl);
        root.style.setProperty("--sidebar-accent-foreground", hsl);
      }
    }
  }, [user?.selectedTheme, user?.customTheme]);
  
  // Sidebar style configuration
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between gap-2 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shrink-0">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <LanguageSelector />
                <ThemeToggle />
                <UserProfile />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0 transition-opacity duration-200 ease-in-out">
              <Router />
            </main>
            <BottomNav />
            <NPSDialog />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <OfflineProvider>
            <TooltipProvider>
              <AppContent />
              <Toaster />
            </TooltipProvider>
          </OfflineProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
