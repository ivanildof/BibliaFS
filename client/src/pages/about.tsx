import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Info, 
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
  Tablet
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  
  const legalPages = [
    {
      title: "Política de Privacidade",
      description: "Como coletamos, usamos e protegemos seus dados",
      icon: Shield,
      href: "/privacy",
      color: "text-blue-600"
    },
    {
      title: "Termos de Uso",
      description: "Regras e condições de uso do aplicativo",
      icon: FileText,
      href: "/terms",
      color: "text-purple-600"
    },
    {
      title: "Política de Segurança",
      description: "Medidas de segurança e proteção de dados",
      icon: Lock,
      href: "/security",
      color: "text-green-600"
    },
    {
      title: "Perguntas Frequentes",
      description: "Dúvidas comuns e como usar o app",
      icon: HelpCircle,
      href: "/help",
      color: "text-amber-600"
    },
    {
      title: "Fale Conosco",
      description: "Entre em contato com nossa equipe",
      icon: Mail,
      href: "/contact",
      color: "text-pink-600"
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
    { name: "Android", icon: Smartphone, status: "Em breve" },
    { name: "iOS", icon: Tablet, status: "Em breve" }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
              <BookOpen className="h-10 w-10 text-primary" />
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
        </div>

        <Card data-testid="card-mission" className="border-none shadow-xl bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              Nossa Missão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
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

        <div className="grid md:grid-cols-2 gap-6">
          <Card data-testid="card-features" className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                Recursos Principais
              </CardTitle>
              <CardDescription>
                Tudo que você precisa para um estudo bíblico completo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {appFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card data-testid="card-languages" className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  Multilíngue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Disponível em múltiplos idiomas:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-lg">🇧🇷</span>
                    <span className="text-sm">Português</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-lg">🇺🇸</span>
                    <span className="text-sm">English</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-lg">🇳🇱</span>
                    <span className="text-sm">Nederlands</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <span className="text-lg">🇪🇸</span>
                    <span className="text-sm">Español</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-platforms" className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                  Plataformas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map((platform, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      data-testid={`platform-${platform.name.toLowerCase()}`}
                    >
                      <div className="flex items-center gap-2">
                        <platform.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{platform.name}</span>
                      </div>
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          platform.status === "Disponível" 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                        data-testid={`status-platform-${platform.name.toLowerCase()}`}
                      >
                        {platform.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card data-testid="card-team" className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              100% Gratuito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="leading-relaxed">
              O BíbliaFS é mantido por doações de usuários como você. Nosso compromisso é manter 
              o aplicativo 100% gratuito e acessível para todos que desejam se aproximar da Palavra de Deus.
            </p>
            <p className="leading-relaxed">
              Desenvolvido com dedicação pela equipe FabriSite, trabalhamos continuamente para 
              melhorar sua experiência e adicionar novos recursos.
            </p>
            <div className="pt-2">
              <Link href="/donate" data-testid="link-donate-about">
                <Button variant="outline" className="gap-2" data-testid="button-donate-about">
                  <Heart className="h-4 w-4" />
                  Apoiar o Projeto
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">Informações Legais e Ajuda</h2>
          <p className="text-center text-muted-foreground">
            Acesse nossas políticas, termos e suporte
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalPages.map((page, index) => (
              <Link key={index} href={page.href} data-testid={`link-${page.href.slice(1)}`}>
                <Card 
                  className="border-none shadow-md hover-elevate cursor-pointer h-full transition-all duration-300"
                  data-testid={`card-link-${page.href.slice(1)}`}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0`}>
                      <page.icon className={`h-6 w-6 ${page.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{page.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{page.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Card data-testid="card-fabrisite" className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <ExternalLink className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg" data-testid="text-fabrisite-title">Desenvolvido por FabriSite</h3>
              <p className="text-sm text-muted-foreground">
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
              <Button variant="outline" className="gap-2" data-testid="button-fabrisite">
                Visitar FabriSite
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground py-6 border-t">
          <p>© 2026 - BíbliaFS. Todos os direitos reservados.</p>
          <p className="mt-1">
            Desenvolvido por{" "}
            <a 
              href="https://fabrisite.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              FabriSite
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
