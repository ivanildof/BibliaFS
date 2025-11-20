import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { 
  Settings as SettingsIcon, 
  Palette,
  Bell,
  Shield,
  User,
  LogOut,
  Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState(user?.selectedTheme || "classico");
  const [customColor, setCustomColor] = useState("#5711D9");
  const [fontSize, setFontSize] = useState(16);
  const [notifications, setNotifications] = useState({
    readingReminders: true,
    prayerReminders: true,
    communityActivity: false,
    teacherMode: true,
  });

  const handleSaveTheme = () => {
    toast({
      title: "Tema salvo",
      description: "Suas preferências foram atualizadas.",
    });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gray-500 to-gray-700">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            Configurações
          </h1>
          <p className="text-lg text-muted-foreground">
            Personalize sua experiência
          </p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance" data-testid="tab-appearance">
              <Palette className="h-4 w-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="account" data-testid="tab-account">
              <User className="h-4 w-4 mr-2" />
              Conta
            </TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            {/* Theme Selection */}
            <Card>
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
                <Button onClick={handleSaveTheme} data-testid="button-save-theme">
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Tema
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
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Escolha o que você deseja ser notificado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reading-reminders">Lembretes de Leitura</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes diários para sua leitura bíblica
                    </p>
                  </div>
                  <Switch
                    id="reading-reminders"
                    checked={notifications.readingReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, readingReminders: checked })
                    }
                    data-testid="switch-reading-reminders"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="prayer-reminders">Lembretes de Oração</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes para suas orações ativas
                    </p>
                  </div>
                  <Switch
                    id="prayer-reminders"
                    checked={notifications.prayerReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, prayerReminders: checked })
                    }
                    data-testid="switch-prayer-reminders"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="community-activity">Atividade da Comunidade</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificações de curtidas e comentários
                    </p>
                  </div>
                  <Switch
                    id="community-activity"
                    checked={notifications.communityActivity}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, communityActivity: checked })
                    }
                    data-testid="switch-community-activity"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="teacher-mode">Modo Professor</Label>
                    <p className="text-sm text-muted-foreground">
                      Atualizações sobre aulas e progresso dos alunos
                    </p>
                  </div>
                  <Switch
                    id="teacher-mode"
                    checked={notifications.teacherMode}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, teacherMode: checked })
                    }
                    data-testid="switch-teacher-mode"
                  />
                </div>
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
                <Button variant="outline">Exportar Meus Dados</Button>
                <Button variant="outline" className="text-destructive">
                  Excluir Minha Conta
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
