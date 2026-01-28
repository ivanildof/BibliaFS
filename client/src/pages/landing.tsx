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
  Book,
  ExternalLink,
  Flame,
  Trophy,
  Target,
  Crown,
  Heart
} from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "../assets/logo-new.png";
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';


const themes = [
  { name: "Clássico", primary: "#5711D9", secondary: "#FFD700", desc: "Tradição e profundidade" },
  { name: "Noite Sagrada", primary: "#1E1B4B", secondary: "#E0E0E0", desc: "Conforto para meditação noturna" },
  { name: "Luz do Dia", primary: "#0EA5E9", secondary: "#F8FAFC", desc: "Energia para sua devocional" },
  { name: "Terra Santa", primary: "#78350F", secondary: "#FEF3C7", desc: "Conexão com as raízes bíblicas" },
];

const premiumFeatures = [
  "Busca Inteligente com IA Teológica",
  "Temas de Leitura Personalizáveis (Sépia, Noturno)",
  "Modo Professor com Geração de Esboços",
  "Sistema de Gamificação (XP e Streaks)",
  "Acesso Offline Completo (Download de Livros)",
  "Podcasts Teológicos Integrados",
  "Gravação de Orações em Áudio",
  "Exportação de Aulas em PDF",
  "Sincronização em Tempo Real",
  "Comentários Teológicos Premium",
  "Comunidade e Grupos de Estudo",
  "Suporte Prioritário",
];

const testimonials = [
  {
    name: "Pastora de São Paulo",
    role: "Líder de Comunidade",
    content: "Os planos de leitura customizáveis e o modo offline transformaram como nossa comunidade estuda juntos. A profundidade aumentou muito.",
    initials: "PS",
    stars: 5
  },
  {
    name: "Professor Universitário",
    role: "Doutor em Teologia",
    content: "O assistente IA oferece perspectivas teológicas equilibradas para minhas aulas. É uma ferramenta de consulta indispensável hoje.",
    initials: "PU",
    stars: 5
  },
  {
    name: "Grupo Koinonia",
    role: "Célula de Jovens",
    content: "Adoramos usar a comunidade para compartilhar notas. O app permite que cada um tenha sua própria trilha de crescimento.",
    initials: "GK",
    stars: 5
  },
];

// Custom hook for scroll-triggered animations
function useScrollReveal() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

export default function Landing() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const features = [
    {
      icon: Brain,
      title: t.landing.features.aiTitle,
      description: t.landing.features.aiDesc,
      gradient: "from-blue-600 to-indigo-800"
    },
    {
      icon: Book,
      title: t.landing.features.plansTitle,
      description: t.landing.features.plansDesc,
      gradient: "from-emerald-600 to-teal-800"
    },
    {
      icon: Headphones,
      title: t.landing.features.podcastsTitle,
      description: t.landing.features.podcastsDesc,
      gradient: "from-purple-600 to-pink-800"
    },
    {
      icon: GraduationCap,
      title: t.landing.features.teacherTitle,
      description: t.landing.features.teacherDesc,
      gradient: "from-orange-600 to-red-800"
    },
    {
      icon: Users,
      title: t.landing.features.communityTitle,
      description: t.landing.features.communityDesc,
      gradient: "from-amber-500 to-orange-700"
    },
    {
      icon: Sparkles,
      title: t.landing.features.themesTitle,
      description: t.landing.features.themesDesc,
      gradient: "from-cyan-600 to-blue-800"
    },
  ];
  
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[60] origin-left" style={{ scaleX }} />

      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <img src={logoImage} alt="BíbliaFS Logo" className="h-11 w-11 object-cover rounded-xl shadow-2xl relative z-10" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-foreground leading-none">BíbliaFS</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Premium Edition</p>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-10">
            {['recursos', 'temas', 'testemunhos', 'faq'].map((item) => (
              <a 
                key={item}
                href={`#${item}`} 
                className="text-sm font-bold text-muted-foreground hover:text-primary transition-all hover:tracking-widest"
              >
                {t.landing[`nav_${item}` as keyof typeof t.landing] || item.toUpperCase()}
              </a>
            ))}
          </nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:block"
          >
            <Button 
              size="lg"
              onClick={() => setLocation("/login")}
              className="rounded-full px-8 bg-gradient-to-r from-primary to-indigo-700 hover:scale-105 transition-all shadow-2xl shadow-primary/20 font-black text-xs uppercase tracking-widest"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Entrar Agora
            </Button>
          </motion.div>

          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl bg-muted/50">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl glass-darker">
                {['recursos', 'temas', 'testemunhos', 'faq'].map((item) => (
                  <DropdownMenuItem key={item} asChild className="rounded-xl">
                    <a href={`#${item}`} className="cursor-pointer py-3 font-bold flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {t.landing[`nav_${item}` as keyof typeof t.landing] || item.toUpperCase()}
                    </a>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild className="rounded-xl bg-primary/10 mt-2">
                  <Link href="/login" className="cursor-pointer py-3 font-black text-primary flex items-center gap-3">
                    <LogIn className="h-4 w-4" />
                    ENTRAR
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-background to-amber-950/20 z-10" />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 blur-[120px] bg-gradient-to-tr from-primary via-purple-500 to-amber-500 rounded-full" 
          />
        </div>
        
        <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-8 bg-white/10 backdrop-blur-2xl text-primary border-primary/30 px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl border-2">
              A Nova Era do Estudo Bíblico
            </Badge>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-6xl md:text-9xl font-black text-foreground mb-8 tracking-tighter leading-none"
          >
            Sua Fé com <span className="bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">Poder Digital</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Explore as Escrituras com Inteligência Artificial, podcasts premium e planos de leitura gamificados. A experiência bíblica definitiva, agora no seu bolso.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Button 
              size="lg"
              className="h-16 px-12 rounded-full bg-gradient-to-r from-primary to-indigo-700 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] font-black text-base uppercase tracking-widest border-0"
              onClick={() => setLocation("/register")}
            >
              Começar Grátis
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="h-16 px-12 rounded-full bg-background/50 backdrop-blur-2xl border-2 border-white/10 text-foreground hover:bg-white/5 shadow-2xl font-black text-base uppercase tracking-widest"
              onClick={() => {
                document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Ver Recursos
            </Button>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute bottom-10 left-10 animate-bounce delay-100 hidden lg:block">
          <div className="p-4 rounded-3xl glass-darker shadow-2xl border-white/5">
            <Trophy className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse hidden lg:block">
          <div className="p-5 rounded-3xl glass-darker shadow-2xl border-white/5 rotate-12">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-12 border-y border-white/5 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Usuários Ativos", val: "50k+" },
              { label: "Capítulos Lidos", val: "2.5M" },
              { label: "Orações Feitas", val: "100k+" },
              { label: "XP Acumulado", val: "15M" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-primary">{stat.val}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">FUNCIONALIDADES</Badge>
            <h2 className="font-display text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Estudo Bíblico de <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Nova Geração</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Ferramentas profissionais desenhadas para elevar sua conexão com a Palavra.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const { ref, isVisible } = useScrollReveal();
              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="rounded-[2.5rem] border-none glass-darker shadow-2xl overflow-hidden h-full group hover:-translate-y-2 transition-all duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity`} />
                    <CardHeader className="p-8">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-2xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight mb-4">{feature.title}</CardTitle>
                      <CardDescription className="text-base font-medium leading-relaxed opacity-80">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Themes Showcase */}
      <section id="temas" className="py-32 px-6 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">CUSTOMIZAÇÃO</Badge>
              <h2 className="font-display text-5xl md:text-6xl font-black mb-8 tracking-tight leading-none">
                A Bíblia do <span className="text-amber-600">Seu Jeito</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-12 font-medium leading-relaxed">
                Escolha entre temas desenhados por especialistas para garantir o conforto visual em qualquer hora do dia ou da noite.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {themes.map((theme, i) => (
                  <div key={i} className="p-6 rounded-3xl glass-darker border-white/5 hover:border-amber-500/30 transition-all group cursor-pointer">
                    <div className="h-3 w-12 rounded-full mb-4" style={{ backgroundColor: theme.primary }} />
                    <h4 className="font-black text-sm mb-1">{theme.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{theme.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
               <motion.div 
                 initial={{ rotate: -5, scale: 0.9 }}
                 whileInView={{ rotate: 0, scale: 1 }}
                 className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-8 border-white/5"
               >
                 <div className="bg-slate-900 aspect-[9/16] p-8">
                    <div className="flex items-center justify-between mb-10">
                      <Menu className="h-6 w-6 text-white" />
                      <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-white/20" />
                        <div className="h-2 w-2 rounded-full bg-white/20" />
                        <div className="h-2 w-2 rounded-full bg-white/20" />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="h-8 w-2/3 bg-white/10 rounded-full" />
                      <div className="space-y-3">
                        <div className="h-4 w-full bg-white/5 rounded-full" />
                        <div className="h-4 w-full bg-white/5 rounded-full" />
                        <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                        <div className="h-4 w-full bg-white/5 rounded-full" />
                      </div>
                      <div className="h-60 rounded-3xl bg-gradient-to-br from-primary/20 to-indigo-600/20 flex items-center justify-center border-2 border-white/5">
                        <Sparkles className="h-20 w-20 text-primary/40 animate-pulse" />
                      </div>
                    </div>
                 </div>
               </motion.div>
               <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary blur-[120px] opacity-20 -z-10" />
               <div className="absolute -top-10 -left-10 w-64 h-64 bg-amber-500 blur-[120px] opacity-10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Teaser */}
      <section className="py-32 px-6 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden text-white">
         <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
         </div>
         <div className="max-w-5xl mx-auto text-center relative z-10">
            <Trophy className="h-20 w-20 mx-auto mb-8 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">Gamificação Que Transforma</h2>
            <p className="text-xl md:text-2xl opacity-80 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Ganhe XP, complete streaks diários e conquiste medalhas raras. Sua jornada espiritual nunca foi tão envolvente.
            </p>
            <div className="flex justify-center gap-4">
               {[Crown, Star, Flame, Zap].map((Icon, i) => (
                 <div key={i} className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:scale-110 transition-transform cursor-pointer">
                   <Icon className="h-6 w-6 text-amber-400" />
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section id="testemunhos" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">DEPOIMENTOS</Badge>
            <h2 className="font-display text-5xl md:text-6xl font-black mb-6 tracking-tight">Amado pela <span className="text-emerald-600">Comunidade</span></h2>
            <p className="text-xl text-muted-foreground font-medium">Histórias de transformação através do BíbliaFS.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="rounded-[2.5rem] border-none glass-darker p-8 h-full shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-150 transition-transform">
                    <Star className="h-20 w-20 fill-current" />
                  </div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-lg font-medium leading-relaxed mb-8 italic opacity-90">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-xl">
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="font-black text-base">{testimonial.name}</h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[3rem] bg-gradient-to-br from-primary via-indigo-700 to-purple-800 p-12 md:p-20 text-center text-white shadow-[0_50px_100px_rgba(79,70,229,0.4)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight relative z-10">Pronto Para Iniciar Sua Jornada?</h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
              Junte-se a milhares de estudantes da Bíblia e experimente o melhor do estudo digital cristão hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center relative z-10">
              <Button 
                size="lg"
                className="h-16 px-12 rounded-full bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all font-black text-base uppercase tracking-widest border-0"
                onClick={() => setLocation("/register")}
              >
                Criar Conta Grátis
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Link href="/pricing" className="text-white/80 hover:text-white font-black text-sm uppercase tracking-[0.2em] transition-colors underline underline-offset-8">
                Ver Planos Premium
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-muted/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src={logoImage} alt="Logo" className="h-10 w-10 rounded-xl" />
              <h2 className="font-display font-black text-2xl tracking-tight">BíbliaFS</h2>
            </div>
            <p className="text-muted-foreground max-w-md font-medium leading-relaxed">
              Elevando o estudo das Escrituras Sagradas através da tecnologia de ponta e teologia sólida.
            </p>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Explorar</h4>
            <ul className="space-y-4">
              <li><Link href="/bible" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Bíblia Online</Link></li>
              <li><Link href="/reading-plans" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Planos de Leitura</Link></li>
              <li><Link href="/podcasts" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Podcasts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6">Suporte</h4>
            <ul className="space-y-4">
              <li><Link href="/help" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Central de Ajuda</Link></li>
              <li><Link href="/contact" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Fale Conosco</Link></li>
              <li><Link href="/privacy" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">© 2026 BíbliaFS. Todos os direitos reservados.</p>
          <div className="flex gap-8">
             <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
             <Globe className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
             <Shield className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
