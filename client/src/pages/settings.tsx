import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { 
  Settings as SettingsIcon, 
  Palette,
  Bell,
  Shield,
  User,
  LogOut,
  Check,
  BellRing,
  Clock,
  Send,
  Loader2,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTheme, readingThemes } from "@/contexts/ThemeContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const predefinedThemes = [
  { 
    id: "classico", 
    name: "Clássico", 
    primary: "#5711D9", 
    accent: "#FFD700",
    description: "Roxo premium + dourado" 
  },
  { 
    id: "noite_sagrada", 
    name: "Noite Sagrada", 
    primary: "#9D44C0", 
    accent: "#E0E0E0",
    description: "Roxo neon + cinza claro" 
  },
  { 
    id: "luz_do_dia", 
    name: "Luz do Dia", 
    primary: "#00A0E3", 
    accent: "#2C2C2C",
    description: "Azul celeste + cinza escuro" 
  },
  { 
    id: "terra_santa", 
    name: "Terra Santa", 
    primary: "#8B4513", 
    accent: "#D4AF37",
    description: "Marrom suave + dourado antigo" 
  },
];

// Helper to convert hex to HSL
function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 50%";
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
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

interface NotificationPreferences {
  readingReminders: boolean;
  readingReminderTime: string;
  prayerReminders: boolean;
  prayerReminderTime: string;
  dailyVerseNotification: boolean;
  dailyVerseTime: string;
  communityActivity: boolean;
  teacherModeUpdates: boolean;
  weekendOnly: boolean;
  timezone: string;
}

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  
  const languages = [
    { id: "pt" as Language, name: "Português (Brasil)", flag: "🇧🇷" },
    { id: "en" as Language, name: "English", flag: "🇺🇸" },
    { id: "es" as Language, name: "Español", flag: "🇪🇸" },
    { id: "nl" as Language, name: "Nederlands", flag: "🇳🇱" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Idioma do Aplicativo
        </CardTitle>
        <CardDescription>
          Escolha o idioma de sua preferência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={language} 
          onValueChange={(value) => setLanguage(value as Language)}
          className="grid grid-cols-2 gap-3"
        >
          {languages.map((lang) => (
            <Label
              key={lang.id}
              htmlFor={`lang-${lang.id}`}
              className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer hover-elevate transition-colors [&:has([data-state=checked])]:border-primary`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium text-sm">{lang.name}</span>
              <RadioGroupItem value={lang.id} id={`lang-${lang.id}`} className="sr-only" />
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function ReadingThemeCard() {
  const { readingTheme, setReadingTheme } = useTheme();
  
  const themes = [
    { id: "default" as const, name: "Padrão", bg: "bg-background", text: "text-foreground", description: "Tema do sistema" },
    { id: "sepia" as const, name: "Sépia", bg: "bg-[#f4ecd8]", text: "text-[#5c4b37]", description: "Tom quente e acolhedor" },
    { id: "paper" as const, name: "Papel", bg: "bg-[#faf9f6]", text: "text-[#333333]", description: "Branco suave como papel" },
    { id: "night" as const, name: "Noturno", bg: "bg-[#1a1a2e]", text: "text-[#e8e8e8]", description: "Ideal para leitura à noite" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Tema de Leitura
        </CardTitle>
        <CardDescription>
          Escolha um tema de fundo para leitura da Bíblia mais confortável
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={readingTheme} 
          onValueChange={(value) => setReadingTheme(value as typeof readingTheme)}
          className="grid grid-cols-2 gap-4"
        >
          {themes.map((theme) => (
            <Label
              key={theme.id}
              htmlFor={`reading-${theme.id}`}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer hover-elevate transition-colors [&:has([data-state=checked])]:border-primary`}
            >
              <div className={`w-full h-20 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center font-serif text-sm border`}>
                "Porque Deus amou..."
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{theme.name}</p>
                <p className="text-xs text-muted-foreground">{theme.description}</p>
              </div>
              <RadioGroupItem value={theme.id} id={`reading-${theme.id}`} className="sr-only" />
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState(user?.selectedTheme || "classico");
  const [customColor, setCustomColor] = useState(user?.customTheme?.primaryColor || "#5711D9");
  const [fontSize, setFontSize] = useState(16);
  
  const headerClass = "font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-2";
  
  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    permission: pushPermission,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
    sendTestNotification,
  } = usePushNotifications();

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    readingReminders: true,
    readingReminderTime: "08:00",
    prayerReminders: true,
    prayerReminderTime: "07:00",
    dailyVerseNotification: true,
    dailyVerseTime: "06:00",
    communityActivity: false,
    teacherModeUpdates: true,
    weekendOnly: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const { data: savedPrefs, isLoading: prefsLoading } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notifications/preferences"],
    enabled: !!user,
  });

  useEffect(() => {
    if (savedPrefs) {
      setNotificationPrefs(savedPrefs);
    }
  }, [savedPrefs]);

  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      const response = await apiRequest("PATCH", "/api/notifications/preferences", prefs);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
      toast({
        title: "Preferências salvas",
        description: "Suas configurações de notificação foram atualizadas.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
    },
  });

  const handlePrefChange = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
    immediate = true
  ) => {
    const newPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(newPrefs);
    if (immediate) {
      savePreferencesMutation.mutate({ [key]: value });
    }
  };

  const handleTimeBlur = (key: keyof NotificationPreferences) => {
    const value = notificationPrefs[key];
    if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) {
      savePreferencesMutation.mutate({ [key]: value });
    }
  };

  const [testingSending, setTestingSending] = useState(false);
  const handleTestNotification = async () => {
    setTestingSending(true);
    await sendTestNotification();
    setTestingSending(false);
  };

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    if (selectedTheme === "custom") {
      const hsl = hexToHSL(customColor);
      root.style.setProperty("--primary", hsl);
      root.style.setProperty("--sidebar-primary", hsl);
      root.style.setProperty("--sidebar-accent-foreground", hsl);
    } else {
      const theme = predefinedThemes.find(t => t.id === selectedTheme);
      if (theme) {
        const primaryHSL = hexToHSL(theme.primary);
        root.style.setProperty("--primary", primaryHSL);
        root.style.setProperty("--sidebar-primary", primaryHSL);
        root.style.setProperty("--sidebar-accent-foreground", primaryHSL);
      }
    }
  }, [selectedTheme, customColor]);

  // Mutation to save theme
  const saveThemeMutation = useMutation({
    mutationFn: async (data: { selectedTheme: string; customTheme?: any }) => {
      const response = await apiRequest("PATCH", "/api/settings/theme", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Tema salvo",
        description: "Suas preferências foram atualizadas.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar tema",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSaveTheme = () => {
    if (!selectedTheme) {
      toast({
        title: "Erro",
        description: "Selecione um tema primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    const themeData: any = {
      selectedTheme: selectedTheme || "classico",
    };
    
    if (selectedTheme === "custom") {
      themeData.customTheme = {
        name: "Personalizado",
        primaryColor: customColor,
        accentColor: "#FFFFFF",
        backgroundColor: "#FFFFFF",
      };
    }
    
    saveThemeMutation.mutate(themeData);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/5 to-amber-50/5 dark:from-background dark:via-purple-950/10 dark:to-amber-950/10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-3 flex items-center gap-4 tracking-tight" data-testid="text-page-title">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/30">
              <SettingsIcon className="h-7 w-7 text-white" />
            </div>
            Configurações
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Personalize sua experiência
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
        <Tabs defaultValue="appearance" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border-none h-auto">
            <TabsTrigger value="appearance" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all" data-testid="tab-appearance">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all" data-testid="tab-notifications">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all" data-testid="tab-account">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all" data-testid="tab-privacy">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Privacidade</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:shadow-md transition-all" data-testid="tab-feedback">
              <Send className="h-4 w-4" />
              <span className="font-medium">Feedback</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            {/* Theme Selection */}
            <Card className="rounded-3xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle>Tema de Cores</CardTitle>
                <CardDescription>
                  Escolha um tema predefinido ou crie seu próprio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
                  <div className="grid md:grid-cols-2 gap-4">
                    {predefinedThemes.map((theme) => (
                      <div key={theme.id}>
                        <Label
                          htmlFor={theme.id}
                          className="flex flex-col items-start gap-3 rounded-lg border-2 p-4 cursor-pointer hover-elevate active-elevate-2 transition-colors [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-2">
                                <div 
                                  className="h-8 w-8 rounded-full border-2 border-border"
                                  style={{ backgroundColor: theme.primary }}
                                />
                                <div 
                                  className="h-8 w-8 rounded-full border-2 border-border"
                                  style={{ backgroundColor: theme.accent }}
                                />
                              </div>
                              <div>
                                <p className="font-medium">{theme.name}</p>
                                <p className="text-xs text-muted-foreground">{theme.description}</p>
                              </div>
                            </div>
                            <RadioGroupItem value={theme.id} id={theme.id} />
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Custom Theme */}
                  <div className="pt-4 border-t">
                    <Label
                      htmlFor="custom"
                      className="flex flex-col gap-3 rounded-lg border-2 p-4 cursor-pointer hover-elevate [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={customColor}
                              onChange={(e) => setCustomColor(e.target.value)}
                              className="h-8 w-8 rounded-full cursor-pointer"
                              data-testid="input-custom-color"
                            />
                            <div className="h-8 w-8 rounded-full border-2 border-border bg-white" />
                          </div>
                          <div>
                            <p className="font-medium">Personalizado</p>
                            <p className="text-xs text-muted-foreground">Escolha sua própria cor</p>
                          </div>
                        </div>
                        <RadioGroupItem value="custom" id="custom" />
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveTheme} 
                  disabled={saveThemeMutation.isPending}
                  data-testid="button-save-theme"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {saveThemeMutation.isPending ? "Salvando..." : "Salvar Tema"}
                </Button>
              </CardFooter>
            </Card>

            {/* Font Size */}
            <Card>
              <CardHeader>
                <CardTitle>Tamanho da Fonte</CardTitle>
                <CardDescription>
                  Ajuste o tamanho do texto para leitura da Bíblia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                    min={14}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Pequeno</span>
                    <span className="font-medium text-foreground">{fontSize}px</span>
                    <span>Grande</span>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-serif" style={{ fontSize: `${fontSize}px` }}>
                      Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reading Theme */}
            <ReadingThemeCard />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  Notificações Push
                </CardTitle>
                <CardDescription>
                  Receba lembretes diretamente no seu dispositivo para leitura e oração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!pushSupported ? (
                  <div className="p-4 bg-muted rounded-lg text-muted-foreground">
                    Seu navegador não suporta notificações push.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/30 hover:bg-accent/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Status do Serviço</p>
                          <p className="text-sm text-muted-foreground">
                            {pushSubscribed
                              ? "Você está inscrito para receber notificações"
                              : "Receba lembretes de leitura e avisos"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pushSubscribed ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={unsubscribePush} 
                            disabled={pushLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            Desativar
                          </Button>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={subscribePush} 
                            disabled={pushLoading}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Ativar Agora
                          </Button>
                        )}
                        {pushSubscribed && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleTestNotification}
                            disabled={testingSending}
                          >
                            {testingSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Testar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure quando e quais lembretes deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {prefsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Reading Reminders */}
                    <div className="space-y-3 pb-4 border-b">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="reading-reminders">Lembretes de Leitura</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba lembretes diários para sua leitura bíblica
                          </p>
                        </div>
                        <Switch
                          id="reading-reminders"
                          checked={notificationPrefs.readingReminders}
                          onCheckedChange={(checked) => handlePrefChange("readingReminders", checked)}
                          data-testid="switch-reading-reminders"
                        />
                      </div>
                      {notificationPrefs.readingReminders && (
                        <div className="flex items-center gap-2 pl-4">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="reading-time" className="text-sm">Horário:</Label>
                          <Input
                            id="reading-time"
                            type="time"
                            value={notificationPrefs.readingReminderTime}
                            onChange={(e) => handlePrefChange("readingReminderTime", e.target.value, false)}
                            onBlur={() => handleTimeBlur("readingReminderTime")}
                            className="w-32"
                            data-testid="input-reading-time"
                          />
                        </div>
                      )}
                    </div>

                    {/* Prayer Reminders */}
                    <div className="space-y-3 pb-4 border-b">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="prayer-reminders">Lembretes de Oração</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba lembretes para suas orações ativas
                          </p>
                        </div>
                        <Switch
                          id="prayer-reminders"
                          checked={notificationPrefs.prayerReminders}
                          onCheckedChange={(checked) => handlePrefChange("prayerReminders", checked)}
                          data-testid="switch-prayer-reminders"
                        />
                      </div>
                      {notificationPrefs.prayerReminders && (
                        <div className="flex items-center gap-2 pl-4">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="prayer-time" className="text-sm">Horário:</Label>
                          <Input
                            id="prayer-time"
                            type="time"
                            value={notificationPrefs.prayerReminderTime}
                            onChange={(e) => handlePrefChange("prayerReminderTime", e.target.value, false)}
                            onBlur={() => handleTimeBlur("prayerReminderTime")}
                            className="w-32"
                            data-testid="input-prayer-time"
                          />
                        </div>
                      )}
                    </div>

                    {/* Daily Verse */}
                    <div className="space-y-3 pb-4 border-b">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="daily-verse">Versículo do Dia</Label>
                          <p className="text-sm text-muted-foreground">
                            Receba um versículo inspirador todas as manhãs
                          </p>
                        </div>
                        <Switch
                          id="daily-verse"
                          checked={notificationPrefs.dailyVerseNotification}
                          onCheckedChange={(checked) => handlePrefChange("dailyVerseNotification", checked)}
                          data-testid="switch-daily-verse"
                        />
                      </div>
                      {notificationPrefs.dailyVerseNotification && (
                        <div className="flex items-center gap-2 pl-4">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="verse-time" className="text-sm">Horário:</Label>
                          <Input
                            id="verse-time"
                            type="time"
                            value={notificationPrefs.dailyVerseTime}
                            onChange={(e) => handlePrefChange("dailyVerseTime", e.target.value, false)}
                            onBlur={() => handleTimeBlur("dailyVerseTime")}
                            className="w-32"
                            data-testid="input-verse-time"
                          />
                        </div>
                      )}
                    </div>

                    {/* Community Activity */}
                    <div className="flex items-center justify-between gap-4 pb-4 border-b">
                      <div className="space-y-0.5">
                        <Label htmlFor="community-activity">Atividade da Comunidade</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificações de curtidas e comentários
                        </p>
                      </div>
                      <Switch
                        id="community-activity"
                        checked={notificationPrefs.communityActivity}
                        onCheckedChange={(checked) => handlePrefChange("communityActivity", checked)}
                        data-testid="switch-community-activity"
                      />
                    </div>

                    {/* Teacher Mode */}
                    <div className="flex items-center justify-between gap-4 pb-4 border-b">
                      <div className="space-y-0.5">
                        <Label htmlFor="teacher-mode">Modo Professor</Label>
                        <p className="text-sm text-muted-foreground">
                          Atualizações sobre aulas e progresso dos alunos
                        </p>
                      </div>
                      <Switch
                        id="teacher-mode"
                        checked={notificationPrefs.teacherModeUpdates}
                        onCheckedChange={(checked) => handlePrefChange("teacherModeUpdates", checked)}
                        data-testid="switch-teacher-mode"
                      />
                    </div>

                    {/* Weekend Only */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekend-only">Apenas Fins de Semana</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber lembretes apenas aos sábados e domingos
                        </p>
                      </div>
                      <Switch
                        id="weekend-only"
                        checked={notificationPrefs.weekendOnly}
                        onCheckedChange={(checked) => handlePrefChange("weekendOnly", checked)}
                        data-testid="switch-weekend-only"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
                <CardDescription>
                  Gerencie seus dados pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <Label>Nível</Label>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {user?.level}
                  </p>
                </div>
              </CardContent>
            </Card>

            <LanguageSelector />

            <Card>
              <CardHeader>
                <CardTitle>Plano de Assinatura</CardTitle>
                <CardDescription>
                  Visualize seu plano atual e faça upgrade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Plano Atual</Label>
                  <p className="text-sm text-muted-foreground mt-1 capitalize font-semibold">
                    {user?.subscriptionPlan === 'free' ? 'Gratuito' : 
                     user?.subscriptionPlan === 'monthly' ? 'Mensal' : 
                     user?.subscriptionPlan === 'yearly' ? 'Anual' : 
                     user?.subscriptionPlan === 'premium_plus' ? 'Premium Plus' :
                     user?.subscriptionPlan || 'Gratuito'}
                  </p>
                </div>
                {user?.subscriptionExpiresAt && (
                  <div>
                    <Label>Válido Até</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(user.subscriptionExpiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => window.location.href = '/planos'}
                  data-testid="button-upgrade-plan"
                >
                  {user?.subscriptionPlan === 'free' ? 'Fazer Upgrade' : 'Ver Planos'}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modo Professor</CardTitle>
                <CardDescription>
                  Ative recursos de ensino
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Habilitar Modo Professor</Label>
                    <p className="text-sm text-muted-foreground">
                      Acesso a criação de aulas e gerenciamento de alunos
                    </p>
                  </div>
                  <Switch
                    checked={user?.isTeacher || false}
                    data-testid="switch-teacher-mode-enable"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>
                  Ações irreversíveis
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="destructive" onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacidade e Dados</CardTitle>
                <CardDescription>
                  Controle seus dados e privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Perfil Público</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que outros vejam seu perfil e atividade
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-public-profile" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compartilhar Estatísticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Compartilhe seu progresso de leitura com a comunidade
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-share-stats" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <Button variant="outline" data-testid="button-export-data">
                  Exportar Meus Dados
                </Button>
                <Button variant="outline" className="text-destructive" data-testid="button-delete-account">
                  Excluir Minha Conta
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links Úteis</CardTitle>
                <CardDescription>
                  Acesse informações importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-primary underline-offset-4 hover:underline"
                  onClick={() => window.open('/terms', '_blank')}
                  data-testid="link-terms"
                >
                  Termos de Uso
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-primary underline-offset-4 hover:underline"
                  onClick={() => window.open('/privacy', '_blank')}
                  data-testid="link-privacy"
                >
                  Política de Privacidade
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-primary underline-offset-4 hover:underline"
                  onClick={() => window.open('/help', '_blank')}
                  data-testid="link-help"
                >
                  Central de Ajuda
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-primary underline-offset-4 hover:underline"
                  onClick={() => window.open('/contact', '_blank')}
                  data-testid="link-contact"
                >
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card className="rounded-3xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Feedback
                </CardTitle>
                <CardDescription>
                  Sua opinião é muito importante para nós. Conte-nos como está sendo sua experiência.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <h3 className="text-lg font-semibold mb-2">Como está sua experiência?</h3>
                  <p className="text-muted-foreground mb-6">
                    Em uma escala de 0 a 10, o quanto você recomendaria o BíbliaFS para um amigo?
                  </p>
                  
                  <div className="flex justify-between gap-1 flex-wrap mb-8">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          const event = new CustomEvent('open-nps-score', { detail: { score: num } });
                          window.dispatchEvent(event);
                        }}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold bg-muted hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-110 shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Sua participação é voluntária e nos ajuda a crescer. 🙏
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl py-6"
                      onClick={() => {
                        const event = new CustomEvent('open-nps-dialog');
                        window.dispatchEvent(event);
                      }}
                    >
                      Enviar feedback detalhado
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
