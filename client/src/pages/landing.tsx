import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Book, 
  Brain, 
  Headphones, 
  GraduationCap, 
  Users, 
  Sparkles,
  Check,
  ArrowRight,
  Menu,
  LogIn,
  UserPlus
} from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Open_Bible_with_warm_sunlight_407fbff0.png";
import { useLanguage } from '@/contexts/LanguageContext';


const themes = [
  { name: "Clássico", primary: "#5711D9", secondary: "#FFD700" },
  { name: "Noite Sagrada", primary: "#9D44C0", secondary: "#E0E0E0" },
  { name: "Luz do Dia", primary: "#00A0E3", secondary: "#2C2C2C" },
  { name: "Terra Santa", primary: "#8B4513", secondary: "#D4AF37" },
];

const comparisonFeatures = [
  "Assistente IA Teológico",
  "Temas Totalmente Personalizáveis",
  "Modo Professor Completo",
  "Podcasts Integrados",
  "Gravação de Orações",
  "Sistema de Gamificação",
  "Exportação de Aulas em PDF",
  "Sincronização na Nuvem",
];

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: t.landing.features.aiTitle,
      description: t.landing.features.aiDesc,
    },
    {
      icon: Book,
      title: t.landing.features.plansTitle,
      description: t.landing.features.plansDesc,
    },
    {
      icon: Headphones,
      title: t.landing.features.podcastsTitle,
      description: t.landing.features.podcastsDesc,
    },
    {
      icon: GraduationCap,
      title: t.landing.features.teacherTitle,
      description: t.landing.features.teacherDesc,
    },
    {
      icon: Users,
      title: t.landing.features.communityTitle,
      description: t.landing.features.communityDesc,
    },
    {
      icon: Sparkles,
      title: t.landing.features.themesTitle,
      description: t.landing.features.themesDesc,
    },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Book className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">BíbliaFS</h2>
              <p className="text-xs text-muted-foreground">Estudo Bíblico Premium</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-8">
            <a 
              href="#features" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-features"
            >
              Recursos
            </a>
            <a 
              href="#themes" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-themes"
            >
              Temas
            </a>
            <a 
              href="/planos" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-plans"
            >
              Planos
            </a>
          </nav>

          {/* Auth Buttons and Mobile Menu */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login-desktop"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
              <Button 
                size="sm"
                onClick={() => window.location.href = "/api/register"}
                data-testid="button-register-desktop"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastro
              </Button>
            </div>

            {/* Mobile Menu with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid="button-menu-mobile"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="sm:hidden">
                  <a href="#features" className="cursor-pointer flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Recursos
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="sm:hidden">
                  <a href="#themes" className="cursor-pointer flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Temas
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="sm:hidden">
                  <a href="/planos" className="cursor-pointer flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Planos
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="sm:hidden" />
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="menu-login-mobile"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Entrar</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/register"}
                  data-testid="menu-register-mobile"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Cadastro</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-primary/20 text-white border-white/30 backdrop-blur-md px-4 py-2" data-testid="badge-version">
            {t.landing.newGeneration}
          </Badge>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6" data-testid="text-hero-title">
            {t.landing.hero_title}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t.landing.hero_subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-start-free"
            >
              {t.landing.start_free}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white/20"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="button-see-features"
            >
              {t.landing.see_features}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t.landing.premium_features}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.landing.premium_subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate border-card-border" data-testid={`card-feature-${index}`}>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section id="themes" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t.landing.customize_experience}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.landing.customize_subtitle}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {themes.map((theme, index) => (
              <Card key={index} className="overflow-hidden hover-elevate" data-testid={`card-theme-${index}`}>
                <div className="h-32 flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                  <Book className="h-16 w-16" style={{ color: theme.secondary }} />
                </div>
                <CardHeader>
                  <CardTitle className="text-center">{theme.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t.landing.why_bible_plus}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t.landing.why_subtitle}
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Recursos Exclusivos</CardTitle>
              <CardDescription>Funcionalidades que você não encontra em outros apps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparisonFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3" data-testid={`feature-item-${index}`}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {t.landing.cta_title}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t.landing.cta_subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-white/90"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-cta-start"
            >
              {t.landing.start_free_cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Book className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">BíbliaFS</h3>
                <p className="text-sm text-muted-foreground">{t.landing.footer_description}</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <a href="/planos" className="text-sm text-muted-foreground hover:text-foreground">
                {t.landing.footer_plans}
              </a>
              <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                {t.landing.footer_contact}
              </a>
              <a href="/help" className="text-sm text-muted-foreground hover:text-foreground">
                {t.landing.footer_support}
              </a>
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacidade
              </a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2026 - BíbliaFS. Todos os direitos reservados. Desenvolvido por |{" "}
            <a 
              href="https://fabrisite.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              data-testid="link-fabrisite"
            >
              FabriSite
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
