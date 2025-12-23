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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
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
  Globe,
  LogIn,
  Book
} from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/Biblia_FS_1766520633441.png";
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
    name: "Pastora de São Paulo",
    role: "Uso em sua comunidade",
    content: "Os planos de leitura customizáveis e o modo offline transformaram como nossa comunidade estuda juntos.",
    avatar: "📖"
  },
  {
    name: "Professor Universitário",
    role: "Estudo de Teologia",
    content: "O assistente IA oferece perspectivas teológicas equilibradas para minhas aulas. Sempre lembro aos alunos de validar com as fontes originais.",
    avatar: "🎓"
  },
  {
    name: "Estudo em Grupo",
    role: "Leitura Diária",
    content: "Adoramos usar a comunidade para compartilhar notas. O app permite que cada um tenha sua própria interpretação das Escrituras.",
    avatar: "👥"
  },
];

const faqs = [
  {
    question: "BíbliaFS é realmente gratuito?",
    answer: "Sim! O plano básico é 100% gratuito para sempre, incluindo leitura offline, planos de leitura e comunidade. Oferecemos recursos premium opcionais (podcasts avançados, temas exclusivos, modo professor completo) para quem deseja expandir sua experiência."
  },
  {
    question: "O que funciona offline?",
    answer: "Leitura da Bíblia, planos de leitura, notas e destaques funcionam completamente offline. O assistente IA, podcasts e recursos de comunidade requerem conexão com a internet para funcionarem."
  },
  {
    question: "Como o assistente IA funciona?",
    answer: "Nossa IA foi treinada com base em tradições teológicas cristãs diversas (reformada, católica, pentecostal) para fornecer respostas equilibradas. Ela analisa o contexto bíblico para respostas mais precisas. Como qualquer IA, pode ocasionalmente gerar interpretações imprecisas—use sempre sua própria leitura das Escrituras como referência final. O assistente é uma ferramenta de estudo, não um substituto para sua interpretação pessoal ou orientação pastoral."
  },
  {
    question: "Meus dados são privados?",
    answer: "Sim! Seus dados pessoais, anotações e histórico de leitura são protegidos conforme nossa Política de Privacidade (link no rodapé). Nunca vendemos dados de usuários. Veja nossos Termos de Uso para mais detalhes."
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
            <img src={logoImage} alt="BíbliaFS Logo" className="h-10 w-10 object-cover rounded" />
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
              {t.landing.nav_resources}
            </a>
            <a 
              href="#temas" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-themes"
            >
              {t.landing.nav_themes}
            </a>
            <a 
              href="#testemunhos" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-testimonials"
            >
              {t.landing.nav_testimonials}
            </a>
            <a 
              href="#faq" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-faq"
            >
              {t.landing.nav_faq}
            </a>
          </nav>

          {/* Desktop Login Button */}
          <div className="hidden sm:block">
            <Button 
              size="sm"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-header"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
            >
              <LogIn className="h-4 w-4 mr-1" />
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
                    {t.landing.nav_resources}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#temas" className="cursor-pointer flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t.landing.nav_themes}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#testemunhos" className="cursor-pointer flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    {t.landing.nav_testimonials}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#faq" className="cursor-pointer flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t.landing.nav_faq}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/api/login" 
                    className="cursor-pointer flex items-center text-primary font-medium"
                    data-testid="link-login-mobile"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
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
            backgroundImage: `linear-gradient(135deg, rgba(107,33,240,0.85) 0%, rgba(67,56,202,0.75) 50%, rgba(255,190,11,0.4) 100%), url(${logoImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-amber-400/90 text-purple-900 border-amber-300 backdrop-blur-md px-6 py-2 font-semibold shadow-lg" data-testid="badge-version">
            A Revolução do Estudo Bíblico
          </Badge>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg" data-testid="text-hero-title">
            Estude a Bíblia com <span className="text-amber-300">Inteligência Artificial</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
            Descubra novos insights teológicos, estude offline e tenha um assistente IA que responde suas dúvidas sobre as escrituras sagradas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="text-lg px-10 py-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-900 border-0 shadow-xl font-bold glow-gold"
              onClick={() => window.location.href = "/api/register"}
              data-testid="button-start-free"
            >
              Começar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 rounded-full bg-white/15 backdrop-blur-lg border-2 border-white/60 text-white hover:bg-white/25 hover:border-white/80 shadow-lg"
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
      <section className="py-24 px-6 bg-gradient-to-b from-purple-50 via-background to-amber-50/30 dark:from-purple-950/30 dark:via-background dark:to-amber-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Por que Escolher <span className="gradient-text">BíbliaFS</span>?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A plataforma mais completa e inteligente para estudo bíblico
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Assistente IA", desc: "Respostas teológicas (requer internet)", color: "from-purple-500 to-purple-600" },
              { icon: Sparkles, title: "Temas Premium", desc: "4 temas exclusivos + personalizáveis", color: "from-amber-400 to-amber-500" },
              { icon: Globe, title: "Offline Total", desc: "Leia a Bíblia + planos sem internet", color: "from-indigo-500 to-purple-500" },
              { icon: Shield, title: "Plano Básico Gratuito", desc: "Recursos essenciais para sempre", color: "from-orange-400 to-amber-500" },
            ].map((benefit, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/80 dark:bg-card/80 border border-purple-200/50 dark:border-purple-800/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.color} mb-4 shadow-lg`}>
                  <benefit.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-24 px-6 bg-gradient-to-b from-background via-purple-50/20 to-background dark:from-background dark:via-purple-950/20 dark:to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Recursos <span className="gradient-text">Poderosos</span> Para Seu Estudo
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para uma experiência de estudo bíblico transformadora
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="premium-card border-purple-200/50 dark:border-purple-800/30 bg-white/90 dark:bg-card/90" data-testid={`card-feature-${index}`}>
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                      <feature.icon className="h-7 w-7 text-white" />
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
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg border-border/50 px-4" data-testid={`faq-item-${index}`}>
                <AccordionTrigger className="font-bold text-lg hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Comece Seu Estudo Bíblico <span className="text-amber-300">Hoje</span>
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Totalmente gratuito. Sem cartão de crédito. Sem compromisso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="text-lg px-10 py-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-purple-900 hover:from-amber-300 hover:to-amber-400 shadow-xl font-bold glow-gold"
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
      <footer className="py-12 px-6 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/50 dark:to-background border-t border-purple-200/50 dark:border-purple-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                  <Book className="h-6 w-6 text-white" />
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
