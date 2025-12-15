import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Star,
  Zap,
  Shield,
  Globe
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

const premiumFeatures = [
  "Assistente IA Teológico Avançado",
  "Temas Totalmente Personalizáveis",
  "Modo Professor Completo",
  "Podcasts Integrados",
  "Gravação de Orações em Áudio",
  "Sistema de Gamificação",
  "Exportação de Aulas em PDF",
  "Sincronização na Nuvem",
  "Acesso Offline Completo",
  "Comentários Teológicos Premium",
  "Comunidade Exclusiva",
  "Suporte Prioritário",
];

const testimonials = [
  {
    name: "Maria Silva",
    role: "Pastora",
    content: "BíbliaFS transformou minha forma de estudar e ensinar a Bíblia. O assistente IA é incrível!",
    avatar: "M"
  },
  {
    name: "João Santos",
    role: "Professor de Teologia",
    content: "Nunca vi um app tão bem pensado para estudo bíblico. Recomendo para todos os meus alunos.",
    avatar: "J"
  },
  {
    name: "Ana Costa",
    role: "Líder de Grupo",
    content: "Os planos de leitura e a comunidade tornaram nossos estudos muito mais engajadores.",
    avatar: "A"
  },
];

const faqs = [
  {
    question: "BíbliaFS é realmente gratuito?",
    answer: "Sim! Você pode começar totalmente grátis. Oferecemos um plano premium com recursos adicionais, mas o plano básico é completo e sem limitações de uso."
  },
  {
    question: "Preciso de internet para usar?",
    answer: "Não! BíbliaFS funciona completamente offline. Baixe a Bíblia uma vez e estude em qualquer lugar, mesmo sem conexão."
  },
  {
    question: "Como o assistente IA funciona?",
    answer: "Nossa IA foi treinada em teologia cristã para fornecer respostas equilibradas e respeitosas. Ela ajuda você a entender melhor os versículos e oferece perspectivas teológicas."
  },
  {
    question: "Posso compartilhar estudos com meu grupo?",
    answer: "Sim! A plataforma de comunidade permite compartilhar versículos, notas e planos de leitura com seu grupo de estudo."
  },
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
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
              href="#recursos" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-features"
            >
              Recursos
            </a>
            <a 
              href="#temas" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-themes"
            >
              Temas
            </a>
            <a 
              href="#testemunhos" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-testimonials"
            >
              Testemunhos
            </a>
            <a 
              href="#faq" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-faq"
            >
              Perguntas
            </a>
          </nav>

          {/* Desktop Login Button */}
          <div className="hidden sm:block">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-header"
            >
              Entrar
            </Button>
          </div>

          {/* Mobile Menu with Navigation Links */}
          <div className="sm:hidden">
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
                <DropdownMenuItem asChild>
                  <a href="#recursos" className="cursor-pointer flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Recursos
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#temas" className="cursor-pointer flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Temas
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#testemunhos" className="cursor-pointer flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Testemunhos
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#faq" className="cursor-pointer flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Perguntas
                  </a>
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
            🚀 A Revolução do Estudo Bíblico
          </Badge>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6" data-testid="text-hero-title">
            Estude a Bíblia com Inteligência Artificial
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Descubra novos insights teológicos, estude offline e tenha um assistente IA que responde suas dúvidas sobre as escrituras sagradas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0 shadow-lg"
              onClick={() => window.location.href = "/api/register"}
              data-testid="button-start-free"
            >
              Começar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white/20"
              onClick={() => {
                document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="button-see-features"
            >
              Veja os Recursos
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Por que Escolher BíbliaFS?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A plataforma mais completa e inteligente para estudo bíblico
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Assistente IA", desc: "Respostas teológicas em tempo real" },
              { icon: Sparkles, title: "Temas Premium", desc: "4 temas exclusivos + personalizáveis" },
              { icon: Globe, title: "Offline Total", desc: "Leia a Bíblia sem internet" },
              { icon: Shield, title: "100% Gratuito", desc: "Use grátis para sempre" },
            ].map((benefit, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-background/50 border border-border/50 hover-elevate">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Recursos Poderosos Para Seu Estudo
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para uma experiência de estudo bíblico transformadora
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate border-border/50" data-testid={`card-feature-${index}`}>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
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
      <section id="temas" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Temas Incríveis
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Personalize sua experiência com 4 temas premium ou crie o seu próprio
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {themes.map((theme, index) => (
              <Card key={index} className="overflow-hidden hover-elevate" data-testid={`card-theme-${index}`}>
                <div className="h-32 flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                  <Book className="h-16 w-16" style={{ color: theme.secondary }} />
                </div>
                <CardHeader>
                  <h3 className="text-center font-bold text-lg">{theme.name}</h3>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Recursos Premium
            </h2>
            <p className="text-xl text-muted-foreground">
              Tudo está incluso - use grátis e desbloqueie mais quando quiser
            </p>
          </div>
          
          <Card className="border-2 border-primary/50">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <h3 className="font-display text-2xl font-bold">Funcionalidades Exclusivas</h3>
              <p className="text-muted-foreground mt-2">Transforme sua forma de estudar a Bíblia</p>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid md:grid-cols-2 gap-6">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3" data-testid={`feature-item-${index}`}>
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base font-medium leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testemunhos" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              O Que Dizem Nossos Usuários
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Milhares de pessoas transformaram seu estudo bíblico com BíbliaFS
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate border-border/50" data-testid={`testimonial-${index}`}>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="italic text-muted-foreground">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-muted-foreground">
              Encontre respostas para as dúvidas mais comuns
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-border/50 hover-elevate" data-testid={`faq-item-${index}`}>
                <CardHeader>
                  <h3 className="font-bold text-lg">{faq.question}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Comece Seu Estudo Bíblico Hoje
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Totalmente gratuito. Sem cartão de crédito. Sem compromisso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-6 rounded-full bg-white text-primary hover:bg-white/90 shadow-lg font-bold"
              onClick={() => window.location.href = "/api/register"}
              data-testid="button-cta-start"
            >
              Cadastre-se Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted/50 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Book className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold">BíbliaFS</h3>
                  <p className="text-xs text-muted-foreground">Estudo Bíblico Premium</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#recursos" className="text-muted-foreground hover:text-foreground">Recursos</a></li>
                <li><a href="#temas" className="text-muted-foreground hover:text-foreground">Temas</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-foreground">Perguntas</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-muted-foreground hover:text-foreground">Sobre</a></li>
                <li><a href="/contact" className="text-muted-foreground hover:text-foreground">Contato</a></li>
                <li><a href="/help" className="text-muted-foreground hover:text-foreground">Suporte</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="text-muted-foreground hover:text-foreground">Privacidade</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-foreground">Termos</a></li>
                <li><a href="/security" className="text-muted-foreground hover:text-foreground">Segurança</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2026 - BíbliaFS. Todos os direitos reservados. Desenvolvido por{" "}
            <a 
              href="https://fabrisite.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
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
