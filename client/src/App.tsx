import { Switch, Route, useLocation } from "wouter";
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
import { useEffect, useCallback } from "react";
import { isNative } from "@/lib/config";
import { useDeepLinks } from "@/hooks/useDeepLinks";
import { Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
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
import AuthCallback from "@/pages/auth-callback";
import NotFound from "@/pages/not-found";
import Groups from "@/pages/groups";
import VersionCompare from "@/pages/version-compare";
import Achievements from "@/pages/achievements";

import { NPSDialog } from "@/components/NPSDialog";
import { InstallPrompt } from "@/components/install-prompt/InstallPrompt";
import { UpdatePopup } from "@/components/UpdatePopup";

function SupportButton() {
  useEffect(() => {
    // Remove any existing script or widget elements
    const existingScript = document.getElementById("helpflow-script");
    if (existingScript) existingScript.remove();
    
    // Create and append the new script exactly as provided
    const script = document.createElement("script");
    script.id = "helpflow-script";
    script.src = "https://3e0dfee4-aa06-4172-bc03-18c40281e88b-00-2tn2hamxjchu4.spock.replit.dev/api/widget/embed.js";
    script.setAttribute("data-helpflow", "true");
    script.setAttribute("data-api", "https://3e0dfee4-aa06-4172-bc03-18c40281e88b-00-2tn2hamxjchu4.spock.replit.dev");
    script.setAttribute("data-key", "wk_7076d8dcf5e813e8f206a342a7cb472b9bfc52fae88cba0c");
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById("helpflow-script");
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, []);

  const openHelpFlow = useCallback(() => {
    // The widget usually handles its own trigger if embedded correctly,
    // but we keep a manual check for common global objects as fallback.
    const hf = (window as any).HelpFlow || (window as any).helpFlow || (window as any).HF;
    if (hf?.open) {
      hf.open();
    } else {
      window.open("https://helpflow.pro", "_blank");
    }
  }, []);

  return (
    <Button
      data-testid="button-support"
      onClick={openHelpFlow}
      className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 animate-pulse"
    >
      <Headphones className="w-4 h-4 mr-1.5" />
      Suporte
    </Button>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isProfileRoute = location === "/perfil" || location === "/profile" || location === "/configurações" || location === "/settings";
    if (!isLoading && !isAuthenticated && isNative && (location === "/" || isProfileRoute)) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          setLocation("/login", { replace: true });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, location, setLocation]);

  useEffect(() => {
    if (isAuthenticated && location === "/login") {
      setLocation("/", { replace: true });
    }
  }, [isAuthenticated, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background z-[100] fixed inset-0">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground font-medium">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={isNative ? Login : Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/planos" component={Pricing} />
        <Route path="/progress" component={Progress} />
        <Route path="/progresso" component={Progress} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/security" component={Security} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/groups" component={Groups} />
        <Route path="/grupos" component={Groups} />
        <Route path="/help" component={Help} />
        <Route path="/bible" component={BibleReader} />
        <Route path="/biblia" component={BibleReader} />
        <Route path="/podcasts" component={Podcasts} />
        <Route path="/plans" component={ReadingPlans} />
        <Route path="/reading-plans" component={ReadingPlans} />
        <Route path="/donate" component={Donate} />
        <Route path="/doar" component={Donate} />
        <Route path="/perfil" component={Profile} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/bible" component={BibleReader} />
      <Route path="/biblia" component={BibleReader} />
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
      <Route path="/grupos" component={Groups} />
      <Route path="/community" component={Community} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/conquistas" component={Achievements} />
      <Route path="/configurações" component={Settings} />
      <Route path="/settings" component={Settings} />
      <Route path="/perfil" component={Profile} />
      <Route path="/profile" component={Profile} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

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
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useLanguage();
  
  const handleAuthCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    window.location.href = '/';
  }, []);
  
  useDeepLinks(handleAuthCallback);
  
  useEffect(() => {
    if (user?.selectedTheme) {
      const root = document.documentElement;
      if (user.selectedTheme === "custom" && user.customTheme) {
        const hsl = hexToHSL(user.customTheme.primaryColor);
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--sidebar-primary", hsl);
        root.style.setProperty("--sidebar-accent-foreground", hsl);
        root.style.setProperty("--primary-foreground", "0 0% 100%");
      } else {
        const predefinedThemes: Record<string, {primary: string, foreground: string}> = {
          classico: { primary: "#5711D9", foreground: "0 0% 100%" },
          noite_sagrada: { primary: "#9D44C0", foreground: "0 0% 100%" },
          luz_do_dia: { primary: "#00A0E3", foreground: "0 0% 100%" },
          terra_santa: { primary: "#8B4513", foreground: "0 0% 100%" },
        };
        const theme = predefinedThemes[user.selectedTheme] || predefinedThemes.classico;
        const hsl = hexToHSL(theme.primary);
        root.style.setProperty("--primary", hsl);
        root.style.setProperty("--sidebar-primary", hsl);
        root.style.setProperty("--sidebar-accent-foreground", hsl);
        root.style.setProperty("--primary-foreground", theme.foreground);
      }
    }
  }, [user?.selectedTheme, user?.customTheme]);
  
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
            <header className="flex items-center justify-between gap-2 p-4 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm shrink-0 sticky top-0 z-50">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-3">
                <SupportButton />
                <LanguageSelector />
                <ThemeToggle />
                <UserProfile />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0 transition-opacity duration-200 ease-in-out">
              <Router />
            </main>
            <BottomNav />
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
              <InstallPrompt />
              <NPSDialog />
              <UpdatePopup />
              <Toaster />
            </TooltipProvider>
          </OfflineProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
