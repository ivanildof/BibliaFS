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
      color: "text-slate-600",
      bgColor: "bg-slate-600/10"
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
    <div className="min-h-screen bg-[#fcfaff] relative overflow-hidden selection:bg-primary/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100/50 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-12 space-y-16">
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-2xl gap-2 text-white/50 hover:text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px]"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar ao Início
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -40 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary to-purple-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-2xl border border-white/20">
                <BookOpen className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
              Sobre o <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]">BíbliaFS</span>
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full" />
          </div>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-medium uppercase tracking-tight leading-tight">
            Transformando o estudo bíblico com tecnologia de ponta, inteligência artificial e uma comunidade global apaixonada pela palavra.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Versão 2.0.9</span>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Nova Geração</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card data-testid="card-mission" className="premium-card relative overflow-hidden ring-1 ring-white/20 rounded-3xl border-none bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] group hover:ring-white/40 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10 opacity-50" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-4 text-2xl font-black tracking-tight text-white">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)] group-hover:scale-110 transition-transform duration-500">
                  <Heart className="h-7 w-7 text-white fill-white/20" />
                </div>
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6 text-white/80">
              <p className="leading-relaxed text-xl font-medium text-white/90">
                O BíbliaFS nasceu com o propósito de tornar o estudo da Palavra de Deus mais acessível, 
                personalizado e envolvente para pessoas ao redor do mundo.
              </p>
              <p className="leading-relaxed text-base">
                Acreditamos que a tecnologia pode ser uma ferramenta poderosa para aproximar as pessoas 
                das Escrituras Sagradas, oferecendo recursos modernos como inteligência artificial, 
                gamificação e comunidade, sem perder a essência e reverência que a Palavra merece.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Card data-testid="card-features" className="premium-card relative overflow-hidden ring-1 ring-white/10 rounded-3xl border-none bg-slate-900/40 backdrop-blur-xl shadow-2xl h-full group hover:ring-white/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-4 text-xl font-bold text-white">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  Recursos Principais
                </CardTitle>
                <CardDescription className="text-white/60 text-base">
                  Tudo que você precisa para um estudo bíblico completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3">
                  {appFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-white/70 group/item">
                      <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card data-testid="card-languages" className="premium-card relative overflow-hidden ring-1 ring-white/10 rounded-3xl border-none bg-slate-900/40 backdrop-blur-xl shadow-2xl group hover:ring-white/30 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-xl font-bold text-white">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    Multilíngue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60 mb-6 text-sm">
                    Disponível em múltiplos idiomas:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { flag: "🇧🇷", name: "Português", code: "BR" },
                      { flag: "🇺🇸", name: "English", code: "US" },
                      { flag: "🇳🇱", name: "Nederlands", code: "NL" },
                      { flag: "🇪🇸", name: "Español", code: "ES" }
                    ].map((lang, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/lang">
                        <span className="text-2xl drop-shadow-md">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/40 font-bold">{lang.code}</span>
                          <span className="text-sm font-bold text-white/90">{lang.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <Card data-testid="card-platforms" className="premium-card relative overflow-hidden ring-1 ring-white/10 rounded-3xl border-none bg-slate-900/40 backdrop-blur-xl shadow-2xl group hover:ring-white/30 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-xl font-bold text-white">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    Plataformas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((platform, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                        data-testid={`platform-${platform.name.toLowerCase()}`}
                      >
                        <div className="flex items-center gap-2">
                          <platform.icon className="h-4 w-4 text-primary" />
                          <span className="text-xs font-black text-white/90 uppercase tracking-wider">{platform.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/30"
                            data-testid={`status-platform-${platform.name.toLowerCase()}`}
                          >
                            {platform.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card data-testid="card-team" className="premium-card relative overflow-hidden ring-1 ring-white/10 rounded-3xl border-none bg-gradient-to-br from-emerald-600/20 to-teal-600/5 backdrop-blur-xl shadow-2xl group hover:ring-white/30 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-4 text-xl font-bold text-white">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Users className="h-6 w-6 text-white" />
                </div>
                100% Gratuito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-white/70 relative z-10">
              <p className="leading-relaxed text-lg font-medium text-white/90">
                O BíbliaFS é mantido por doações de usuários como você. Nosso compromisso é manter 
                o aplicativo 100% gratuito e acessível para todos que desejam se aproximar da Palavra de Deus.
              </p>
              <p className="leading-relaxed text-sm">
                Desenvolvido com dedicação pela equipe FabriSite, trabalhamos continuamente para 
                melhorar sua experiência e adicionar novos recursos.
              </p>
              <div className="pt-4">
                <Link href="/donate" data-testid="link-donate-about">
                  <Button className="rounded-2xl h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all" data-testid="button-donate-about">
                    <Heart className="h-4 w-4 fill-white/20" />
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
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Informações Legais e Ajuda</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-4" />
            <p className="text-white/50 font-medium">
              Acesse nossas políticas, termos e suporte técnico
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalPages.map((page, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Link href={page.href}>
                  <Card 
                    className="premium-card relative overflow-hidden ring-1 ring-white/10 rounded-3xl border-none bg-slate-900/40 backdrop-blur-xl shadow-xl cursor-pointer h-full transition-all hover:shadow-2xl hover:ring-white/30 group active:scale-95"
                    data-testid={`card-link-${page.href.slice(1)}`}
                  >
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className={`h-16 w-16 rounded-2xl ${page.bgColor} flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        <page.icon className={`h-8 w-8 ${page.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-white tracking-tight group-hover:text-primary transition-colors uppercase text-sm">{page.title}</h3>
                        <p className="text-xs text-white/40 font-medium line-clamp-2 mt-1 uppercase tracking-tighter">{page.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/20 flex-shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card data-testid="card-fabrisite" className="premium-card relative overflow-hidden ring-1 ring-white/10 rounded-[2rem] border-none bg-gradient-to-br from-slate-900 to-indigo-900/40 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ExternalLink className="h-32 w-32 text-white" />
            </div>
            <CardContent className="p-10 text-center space-y-6 relative z-10">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl">
                  <ExternalLink className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-3xl text-white tracking-tighter uppercase" data-testid="text-fabrisite-title">Desenvolvido por FabriSite</h3>
                <p className="text-white/50 text-sm font-bold uppercase tracking-[0.2em]">
                  Soluções tecnológicas para transformar ideias em realidade
                </p>
              </div>
              <a 
                href="https://fabrisite.com.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4"
                data-testid="link-fabrisite"
              >
                <Button variant="outline" className="rounded-2xl h-14 px-10 border-white/20 bg-white/5 text-white font-black uppercase tracking-widest text-xs gap-3 hover:bg-white/10 hover:border-white/40 transition-all shadow-xl" data-testid="button-fabrisite">
                  Visitar Website Oficial
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>

        <footer className="text-center text-xs text-white/30 py-12 border-t border-white/5 uppercase tracking-[0.2em] font-bold">
          <p>© 2026 - BíbliaFS. Todos os direitos reservados.</p>
          <p className="mt-2">
            Tecnologia de elite por{" "}
            <a 
              href="https://fabrisite.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-white transition-colors underline-offset-4 hover:underline"
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
