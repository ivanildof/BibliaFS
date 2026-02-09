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
  ChevronUp,
  Star,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.bibliafullstack.app&pcampaignid=web_share";

export default function About() {
  const { t } = useLanguage();
  const { toast } = useToast();
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
  
  const handleShareApp = async () => {
    const shareData = {
      title: "BíbliaFS - Estudo Bíblico Premium",
      text: "Conheça o BíbliaFS! Estudo bíblico com IA teológica, planos de leitura, comunidade e muito mais. Baixe agora:",
      url: PLAY_STORE_URL,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copiado!",
          description: "O link do app foi copiado para a área de transferência.",
        });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copiado!",
          description: "O link do app foi copiado para a área de transferência.",
        });
      }
    }
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
      color: "text-muted-foreground",
      bgColor: "bg-muted-foreground/10"
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
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-muted/50 dark:bg-muted/30 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-12 space-y-12">
        <div className="flex justify-start">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-2xl gap-2 text-muted-foreground font-semibold uppercase tracking-widest text-[10px]"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar ao Início
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -40 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative h-20 w-20 rounded-2xl bg-card flex items-center justify-center shadow-xl border border-border">
                <BookOpen className="h-10 w-10 text-primary drop-shadow-sm" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tighter text-amber-700 dark:text-amber-500 uppercase italic">
              Sobre o BíbliaFS
            </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto font-medium uppercase tracking-tight leading-tight">
            Transformando o estudo bíblico com tecnologia de ponta e inteligência artificial.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-rose-500/10 via-card to-pink-500/5 shadow-xl overflow-hidden group relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/15 to-transparent rounded-bl-full z-0" />
            <CardHeader className="p-8 relative z-10">
              <CardTitle className="flex items-center gap-4 text-xl font-semibold text-foreground">
                <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4 text-muted-foreground font-medium relative z-10">
              <p>O BíbliaFS nasceu com o propósito de tornar o estudo da Palavra de Deus mais acessível, personalizado e envolvente.</p>
              <p>Acreditamos que a tecnologia pode ser uma ferramenta poderosa para aproximar as pessoas das Escrituras Sagradas.</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-indigo-500/10 via-card to-purple-500/5 shadow-xl overflow-hidden group relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/15 to-transparent rounded-bl-full z-0" />
            <CardHeader className="p-8 relative z-10">
              <CardTitle className="flex items-center gap-4 text-xl font-semibold text-foreground">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                100% Gratuito
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4 text-muted-foreground font-medium relative z-10">
              <p>O BíbliaFS é mantido por doações de usuários como você. Nosso compromisso é manter o aplicativo 100% gratuito.</p>
              <p>Desenvolvido com dedicação pela equipe FabriSite.</p>
            </CardContent>
          </Card>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight uppercase italic">Apoie o App</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="rounded-3xl border-none bg-gradient-to-br from-amber-500/10 via-card to-yellow-500/5 shadow-xl overflow-hidden group relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/15 to-transparent rounded-bl-full z-0" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Avalie o App</h3>
                    <p className="text-xs text-muted-foreground">Deixe sua avaliacao na Play Store</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2"
                  onClick={() => window.open(PLAY_STORE_URL, '_blank')}
                  data-testid="button-rate-app"
                >
                  <Star className="h-4 w-4" />
                  Avaliar na Play Store
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/5 shadow-xl overflow-hidden group relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/15 to-transparent rounded-bl-full z-0" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <Share2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Compartilhar</h3>
                    <p className="text-xs text-muted-foreground">Convide amigos para usar o app</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2"
                  onClick={handleShareApp}
                  data-testid="button-share-app"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar o App
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight uppercase italic">Informações Legais</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalPages.map((page, index) => (
              <Link key={index} href={page.href}>
                <Card className="rounded-3xl border-none glass-premium hover-premium shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-95 group">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl ${page.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <page.icon className={`h-6 w-6 ${page.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground uppercase text-xs tracking-tight">{page.title}</h3>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
