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
      color: "text-[#333333]",
      bgColor: "bg-card-level"
    },
    {
      title: "Termos de Uso",
      description: "Regras e condições de uso do aplicativo",
      icon: FileText,
      href: "/terms",
      color: "text-[#333333]",
      bgColor: "bg-card-points"
    },
    {
      title: "Política de Segurança",
      description: "Medidas de segurança e proteção de dados",
      icon: Lock,
      href: "/security",
      color: "text-[#333333]",
      bgColor: "bg-card-reading"
    },
    {
      title: "Perguntas Frequentes",
      description: "Dúvidas comuns e como usar o app",
      icon: HelpCircle,
      href: "/help",
      color: "text-[#333333]",
      bgColor: "bg-card-achievements"
    },
    {
      title: "Fale Conosco",
      description: "Entre em contato com nossa equipe",
      icon: Mail,
      href: "/contact",
      color: "text-[#333333]",
      bgColor: "bg-card-level"
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
    <div className="min-h-screen relative overflow-hidden selection:bg-[#FFA500]/10" style={{ background: 'linear-gradient(160deg, #F8F8FF 0%, #FFFFFF 100%)' }}>
      {/* Dynamic Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-[#E6E6FA]/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-[#FFDAB9]/30 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-12 space-y-16">
        <div className="flex justify-start">
          <Button 
            size="sm" 
            className="rounded-2xl gap-2 bg-[#FFA500] hover:bg-[#FF8C00] text-white transition-all font-black uppercase tracking-widest text-[10px]"
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
              <div className="absolute -inset-4 bg-gradient-to-br from-[#FFA500]/20 to-[#800080]/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative h-24 w-24 rounded-3xl bg-white flex items-center justify-center shadow-lg border border-[#E6E6FA]">
                <BookOpen className="h-12 w-12 text-[#800080]" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#333333] uppercase italic">
              Sobre o <span className="text-[#FFA500]">BíbliaFS</span>
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-[#FFA500] to-transparent mx-auto rounded-full" />
          </div>
          <p className="text-[#666666] text-lg md:text-xl max-w-2xl mx-auto font-bold uppercase tracking-tight leading-tight italic">
            Transformando o estudo bíblico com tecnologia de ponta, inteligência artificial e uma comunidade global apaixonada pela palavra.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="px-4 py-1.5 rounded-full bg-white border border-[#E6E6FA] shadow-sm">
              <span className="text-[10px] font-black text-[#666666] uppercase tracking-[0.3em]">Versão 2.0.9</span>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-[#FFA500]/10 border border-[#FFA500]/20">
              <span className="text-[10px] font-black text-[#FFA500] uppercase tracking-[0.3em]">Nova Geração</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card data-testid="card-mission" className="rounded-[2.5rem] border-none bg-card-reading shadow-lg overflow-hidden group transition-all duration-500">
            <CardHeader className="relative z-10 p-8 sm:p-10">
              <CardTitle className="flex items-center gap-4 text-2xl font-black tracking-tight text-[#333333] italic uppercase">
                <div className="h-14 w-14 rounded-2xl bg-[#FFA500] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Heart className="h-7 w-7 text-white fill-white/20" />
                </div>
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-8 sm:p-10 pt-0 space-y-6">
              <p className="leading-relaxed text-xl font-bold text-[#333333] italic">
                O BíbliaFS nasceu com o propósito de tornar o estudo da Palavra de Deus mais acessível, 
                personalizado e envolvente para pessoas ao redor do mundo.
              </p>
              <p className="leading-relaxed text-base text-[#666666] font-medium italic">
                Acreditamos que a tecnologia pode ser uma ferramenta poderosa para aproximar as pessoas 
                das Escrituras Sagradas, oferecendo recursos modernos como inteligência artificial, 
                gamificação e comunidade, sem perder a essência e reverência que a Palavra merece.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <Card data-testid="card-features" className="rounded-[2rem] border-none bg-card-points shadow-lg h-full group transition-all overflow-hidden">
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-4 text-xl font-black text-[#333333] italic uppercase">
                  <div className="h-12 w-12 rounded-2xl bg-[#FFA500] flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  Recursos Principais
                </CardTitle>
                <CardDescription className="text-[#666666] text-base font-bold italic">
                  Tudo que você precisa para um estudo bíblico completo
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="grid gap-3">
                  {appFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-[#666666] group/item">
                      <div className="h-8 w-8 rounded-xl bg-white/60 flex items-center justify-center group-hover/item:bg-[#FFA500]/20 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-[#FFA500] shadow-sm" />
                      </div>
                      <span className="text-sm font-bold italic">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card data-testid="card-languages" className="rounded-[2rem] border-none bg-card-level shadow-lg group transition-all overflow-hidden">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-4 text-xl font-black text-[#333333] italic uppercase">
                    <div className="h-12 w-12 rounded-2xl bg-[#800080] flex items-center justify-center shadow-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    Multilíngue
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-[#666666] mb-6 text-sm font-bold italic">
                    Disponível em múltiplos idiomas:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { flag: "🇧🇷", name: "Português", code: "BR" },
                      { flag: "🇺🇸", name: "English", code: "US" },
                      { flag: "🇳🇱", name: "Nederlands", code: "NL" },
                      { flag: "🇪🇸", name: "Español", code: "ES" }
                    ].map((lang, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 border border-white hover:bg-white transition-colors group/lang">
                        <span className="text-2xl drop-shadow-sm">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#666666] font-black">{lang.code}</span>
                          <span className="text-sm font-black text-[#333333] italic">{lang.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
              <Card data-testid="card-platforms" className="rounded-[2rem] border-none bg-card-achievements shadow-lg group transition-all overflow-hidden">
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-4 text-xl font-black text-[#333333] italic uppercase">
                    <div className="h-12 w-12 rounded-2xl bg-[#FFA500] flex items-center justify-center shadow-lg">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    Plataformas
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((platform, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col gap-2 p-4 rounded-2xl bg-white/60 border border-white hover:bg-white transition-all"
                        data-testid={`platform-${platform.name.toLowerCase()}`}
                      >
                        <div className="flex items-center gap-2">
                          <platform.icon className="h-4 w-4 text-[#800080]" />
                          <span className="text-xs font-black text-[#333333] uppercase tracking-wider">{platform.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA500]/10 text-[#FFA500] font-black border border-[#FFA500]/20"
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
          <Card data-testid="card-team" className="rounded-[2.5rem] border-none bg-white shadow-lg overflow-hidden group transition-all">
            <CardHeader className="relative z-10 p-8">
              <CardTitle className="flex items-center gap-4 text-xl font-black text-[#333333] italic uppercase">
                <div className="h-12 w-12 rounded-2xl bg-[#800080] flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                100% Gratuito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10 p-8 pt-0">
              <p className="leading-relaxed text-lg font-bold text-[#333333] italic">
                O BíbliaFS é mantido por doações de usuários como você. Nosso compromisso é manter 
                o aplicativo 100% gratuito e acessível para todos que desejam se aproximar da Palavra de Deus.
              </p>
              <p className="leading-relaxed text-sm text-[#666666] font-bold italic">
                Desenvolvido com dedicação pela equipe FabriSite, trabalhamos continuamente para 
                melhorar sua experiência e adicionar novos recursos.
              </p>
              <div className="pt-4">
                <Link href="/donate" data-testid="link-donate-about">
                  <Button className="rounded-2xl h-12 px-8 shadow-lg font-black uppercase tracking-widest text-xs gap-3 hover:scale-105 active:scale-95 transition-all bg-[#FFA500] hover:bg-[#FF8C00]" data-testid="button-donate-about">
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
            <h2 className="text-3xl font-black text-[#333333] tracking-tight mb-2 uppercase italic">Informações Legais e Ajuda</h2>
            <div className="h-1 w-20 bg-[#FFA500] mx-auto rounded-full mb-4" />
            <p className="text-[#666666] font-bold italic">
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
                    className={`rounded-[2rem] border-none ${page.bgColor} shadow-lg cursor-pointer h-full transition-all hover:shadow-xl group active:scale-95 overflow-hidden relative`}
                    data-testid={`card-link-${page.href.slice(1)}`}
                  >
                    <CardContent className="p-6 flex items-center gap-5 relative z-10">
                      <div className="h-16 w-16 rounded-2xl bg-[#FFA500] flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-500">
                        <page.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[#333333] tracking-tight group-hover:text-[#FFA500] transition-colors uppercase italic text-sm">{page.title}</h3>
                        <p className="text-xs text-[#666666] font-bold italic line-clamp-2 mt-1 uppercase tracking-tighter">{page.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#666666] flex-shrink-0 group-hover:text-[#FFA500] group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card data-testid="card-fabrisite" className="rounded-[2.5rem] border-none bg-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ExternalLink className="h-32 w-32 text-[#333333]" />
            </div>
            <CardContent className="p-10 text-center space-y-6 relative z-10">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-2xl bg-card-level flex items-center justify-center shadow-lg">
                  <ExternalLink className="h-10 w-10 text-[#800080]" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-3xl text-[#333333] tracking-tighter uppercase italic" data-testid="text-fabrisite-title">Desenvolvido por FabriSite</h3>
                <p className="text-[#666666] text-sm font-bold uppercase tracking-[0.2em] italic">
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
                <Button className="rounded-2xl h-14 px-10 bg-[#FFA500] hover:bg-[#FF8C00] text-white font-black uppercase tracking-widest text-xs gap-3 transition-all shadow-lg" data-testid="button-fabrisite">
                  Visitar Website Oficial
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>

        <footer className="text-center text-xs text-[#666666] py-12 border-t border-[#E6E6FA] uppercase tracking-[0.2em] font-bold italic">
          <p>© 2026 - BíbliaFS. Todos os direitos reservados.</p>
          <p className="mt-2">
            Tecnologia de elite por{" "}
            <a 
              href="https://fabrisite.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#FFA500] hover:text-[#FF8C00] transition-colors underline-offset-4 hover:underline"
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
              className="h-12 w-12 rounded-full bg-[#FFA500] hover:bg-[#FF8C00] shadow-lg"
              onClick={scrollToTop}
            >
              <ChevronUp className="h-6 w-6 text-white" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
