import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Users, 
  Globe, 
  Sparkles,
  Shield,
  FileText,
  Lock,
  HelpCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Smartphone,
  Monitor,
  Tablet,
  ArrowLeft,
  ChevronUp
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const legalPages = [
    {
      title: "Política de Privacidade",
      description: "Como coletamos, usamos e protegemos seus dados",
      icon: Shield,
      href: "/privacy",
      color: "text-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Termos de Uso",
      description: "Regras e condições de uso do aplicativo",
      icon: FileText,
      href: "/terms",
      color: "text-purple-600",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Política de Segurança",
      description: "Medidas de segurança e proteção de dados",
      icon: Lock,
      href: "/security",
      color: "text-green-600",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Perguntas Frequentes",
      description: "Dúvidas comuns e como usar o app",
      icon: HelpCircle,
      href: "/help",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Fale Conosco",
      description: "Entre em contato com nossa equipe",
      icon: Mail,
      href: "/contact",
      color: "text-pink-600",
      bgColor: "bg-pink-500/10"
    }
  ];

  const appFeatures = [
    "Leitura offline para estudar em qualquer lugar",
    "4 traduções bíblicas (NVI, ACF, ARC, RA)",
    "Planos de leitura personalizados",
    "Destaques e anotações coloridas (6 cores)",
    "Diário de orações com gravação de áudio",
    "Gamificação com 50 níveis e conquistas",
    "Assistente teológico com IA (GPT-4o)",
    "Comunidade para compartilhar insights",
    "Podcasts integrados",
    "Modo Professor para criar aulas"
  ];

  const platforms = [
    { name: "Web", icon: Monitor, status: "Disponível" },
    { name: "Desktop", icon: Monitor, status: "Disponível" },
    { name: "Android", icon: Smartphone, status: "Disponível" },
    { name: "iOS", icon: Tablet, status: "Disponível" }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 space-y-10">
        <div className="flex justify-start mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-xl gap-2 hover:bg-primary/10 transition-colors"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Sobre o BíbliaFS
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transformando o estudo bíblico com tecnologia, inteligência artificial e uma comunidade apaixonada pela Palavra de Deus.
          </p>
          <p className="text-sm text-muted-foreground">
            Versão 2.0 - Nova Geração
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card data-testid="card-mission" className="rounded-2xl border-none bg-gradient-to-br from-pink-500/10 to-pink-500/5 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed text-lg">
                O BíbliaFS nasceu com o propósito de tornar o estudo da Palavra de Deus mais acessível, 
                personalizado e envolvente para pessoas ao redor do mundo.
              </p>
              <p className="leading-relaxed">
                Acreditamos que a tecnologia pode ser uma ferramenta poderosa para aproximar as pessoas 
                das Escrituras Sagradas, oferecendo recursos modernos como inteligência artificial, 
                gamificação e comunidade, sem perder a essência e reverência que a Palavra merece.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Card data-testid="card-features" className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-amber-600" />
                  </div>
                  Recursos Principais
                </CardTitle>
                <CardDescription className="text-base">
                  Tudo que você precisa para um estudo bíblico completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {appFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card data-testid="card-languages" className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    Multilíngue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Disponível em múltiplos idiomas:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { flag: "🇧🇷", name: "Português" },
                      { flag: "🇺🇸", name: "English" },
                      { flag: "🇳🇱", name: "Nederlands" },
                      { flag: "🇪🇸", name: "Español" }
                    ].map((lang, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <Card data-testid="card-platforms" className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-green-600" />
                    </div>
                    Plataformas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                        data-testid={`platform-${platform.name.toLowerCase()}`}
                      >
                        <div className="flex items-center gap-2">
                          <platform.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{platform.name}</span>
                        </div>
                        <span 
                          className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-bold"
                          data-testid={`status-platform-${platform.name.toLowerCase()}`}
                        >
                          {platform.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card data-testid="card-team" className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                100% Gratuito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed text-lg">
                O BíbliaFS é mantido por doações de usuários como você. Nosso compromisso é manter 
                o aplicativo 100% gratuito e acessível para todos que desejam se aproximar da Palavra de Deus.
              </p>
              <p className="leading-relaxed">
                Desenvolvido com dedicação pela equipe FabriSite, trabalhamos continuamente para 
                melhorar sua experiência e adicionar novos recursos.
              </p>
              <div className="pt-2">
                <Link href="/donate" data-testid="link-donate-about">
                  <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20" data-testid="button-donate-about">
                    <Heart className="h-4 w-4" />
                    Apoiar o Projeto
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Informações Legais e Ajuda</h2>
            <p className="text-muted-foreground">
              Acesse nossas políticas, termos e suporte
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalPages.map((page, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Link href={page.href}>
                  <Card 
                    className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg cursor-pointer h-full transition-all hover:shadow-xl group"
                    data-testid={`card-link-${page.href.slice(1)}`}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`h-14 w-14 rounded-xl ${page.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <page.icon className={`h-7 w-7 ${page.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold group-hover:text-primary transition-colors">{page.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{page.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card data-testid="card-fabrisite" className="rounded-2xl border-none bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl shadow-lg">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <ExternalLink className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl" data-testid="text-fabrisite-title">Desenvolvido por FabriSite</h3>
                <p className="text-muted-foreground">
                  Soluções tecnológicas para transformar ideias em realidade
                </p>
              </div>
              <a 
                href="https://fabrisite.com.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
                data-testid="link-fabrisite"
              >
                <Button variant="outline" className="rounded-xl gap-2" data-testid="button-fabrisite">
                  Visitar FabriSite
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>

        <footer className="text-center text-sm text-muted-foreground py-8 border-t border-border/50">
          <p>© 2026 - BíbliaFS. Todos os direitos reservados.</p>
          <p className="mt-1">
            Desenvolvido por{" "}
            <a 
              href="https://fabrisite.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              FabriSite
            </a>
          </p>
        </footer>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="h-12 w-12 rounded-full shadow-2xl shadow-primary/40 hover-elevate active-elevate-2"
              onClick={scrollToTop}
            >
              <ChevronUp className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
