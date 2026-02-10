import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Lock, Eye, Database, Users, Cookie, Baby, RefreshCw, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  const sections = [
    {
      title: "1. Informações que Coletamos",
      icon: Database,
      content: [
        { label: "Informações de Conta", desc: "Nome, e-mail e foto de perfil (quando você se registra)" },
        { label: "Conteúdo do Usuário", desc: "Notas, destaques, orações, planos de leitura e posts na comunidade" },
        { label: "Dados de Uso", desc: "Estatísticas de leitura, progresso em planos, conquistas e atividades" },
        { label: "Informações Técnicas", desc: "Tipo de dispositivo, sistema operacional e dados de navegação" },
        { label: "Dados de Pagamento", desc: "Informações de doação processadas de forma segura pelo Stripe" }
      ]
    },
    {
      title: "2. Como Usamos Suas Informações",
      icon: Eye,
      items: [
        "Fornecer e melhorar nossos serviços",
        "Personalizar sua experiência de estudo bíblico",
        "Sincronizar seus dados entre dispositivos",
        "Processar doações de forma segura",
        "Enviar notificações sobre planos de leitura (se ativado)",
        "Analisar padrões de uso para melhorar o aplicativo",
        "Comunicar atualizações importantes do serviço"
      ]
    },
    {
      title: "3. Compartilhamento de Informações",
      icon: Users,
      intro: "Nunca vendemos suas informações pessoais. Compartilhamos dados apenas:",
      items: [
        "Com outros usuários, quando você publica na comunidade",
        "Com processadores de pagamento (Stripe) para doações seguras",
        "Quando exigido por lei ou ordem judicial",
        "Com seu consentimento explícito"
      ]
    },
    {
      title: "4. Segurança dos Dados",
      icon: Lock,
      items: [
        "Criptografia de dados em trânsito (HTTPS/SSL)",
        "Armazenamento seguro em servidores protegidos",
        "Senhas criptografadas com bcrypt",
        "Acesso restrito a dados pessoais",
        "Backups regulares e seguros"
      ]
    },
    {
      title: "5. Seus Direitos",
      icon: Shield,
      items: [
        "Acessar suas informações pessoais",
        "Corrigir dados incorretos",
        "Solicitar exclusão de sua conta e dados",
        "Exportar seus dados",
        "Optar por não receber notificações",
        "Revogar consentimentos a qualquer momento"
      ]
    },
    {
      title: "6. Cookies e Armazenamento Local",
      icon: Cookie,
      items: [
        "Manter você conectado",
        "Lembrar suas preferências (idioma, tema)",
        "Armazenar conteúdo offline",
        "Melhorar o desempenho do aplicativo"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 dark:bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/about" data-testid="link-back-privacy">
            <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-back-privacy">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-muted-foreground">Voltar para Sobre</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-3xl glass-premium hover-premium shadow-xl flex items-center justify-center relative overflow-hidden">
              <Shield className="h-12 w-12 text-blue-600 drop-shadow-sm" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground font-bold italic">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card data-testid="card-intro" className="rounded-[2rem] border-none bg-gradient-to-br from-blue-500/10 via-card to-indigo-500/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/15 to-transparent rounded-bl-full z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-semibold text-foreground">Introdução</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground font-medium text-lg relative z-10">
              <p>
                No BíbliaFS, levamos sua privacidade a sério. Esta Política de Privacidade explica 
                como coletamos, usamos, armazenamos e protegemos suas informações pessoais.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05 }}
          >
            <Card className="rounded-[2rem] border-none bg-gradient-to-br from-primary/5 via-card to-purple-500/5 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-foreground font-semibold">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg">
                    <section.icon className="h-5 w-5" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground font-medium relative z-10">
                {section.intro && <p className="font-bold text-foreground italic">{section.intro}</p>}
                {section.content && (
                  <ul className="space-y-4">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="h-2 w-2 rounded-full bg-primary/60 shadow-sm mt-2 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground font-bold  tracking-wider text-[10px] block mb-1">{item.label}</strong>
                          <span className="text-muted-foreground">{item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {section.items && (
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="h-2 w-2 rounded-full bg-primary/60 shadow-sm mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="rounded-[2rem] border-none glass-premium hover-premium shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-muted to-transparent rounded-bl-full z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-foreground font-bold  tracking-tighter">
                <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-100 shadow-sm">
                  <Baby className="h-5 w-5 text-pink-600" />
                </div>
                7. Privacidade de Menores
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground font-medium relative z-10">
              <p>
                O BíbliaFS pode ser usado por menores de idade, mas recomendamos supervisão parental. 
                Não coletamos intencionalmente informações de crianças menores de 13 anos sem 
                consentimento dos pais.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card className="rounded-[2rem] border-none glass-premium hover-premium shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-muted to-transparent rounded-bl-full z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-foreground font-bold  tracking-tighter">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-100 shadow-sm">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                </div>
                8. Alterações nesta Política
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground font-medium relative z-10">
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
                mudanças significativas através do aplicativo ou por e-mail.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="rounded-[2rem] border-none glass-premium hover-premium shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-muted to-transparent rounded-bl-full z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-foreground font-bold  tracking-tighter">
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-100 shadow-sm">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                9. Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground font-medium relative z-10">
              <p>
                Para questões sobre privacidade ou para exercer seus direitos, entre em contato 
                através da página "Fale Conosco".
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.65 }}
          className="grid md:grid-cols-3 gap-6 py-8"
        >
          {[
            { href: "/about", title: "Sobre", desc: "Conheça o BíbliaFS" },
            { href: "/terms", title: "Termos de Uso", desc: "Regras e condições" },
            { href: "/security", title: "Segurança", desc: "Proteção de dados" }
          ].map((link, idx) => (
            <Link key={idx} href={link.href}>
              <Card className="rounded-2xl border-none glass-premium hover-premium shadow-lg cursor-pointer h-full transition-all hover:shadow-xl ">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-foreground mb-1 uppercase tracking-tight">{link.title}</h3>
                  <p className="text-sm text-muted-foreground font-bold italic">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

        <footer className="text-center text-sm text-muted-foreground py-8 border-t border-border">
          <p>© 2026 BíbliaFS | Desenvolvido por | <a href="https://fabrisite.com.br/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">FabriSite</a></p>
        </footer>
      </div>
    </div>
  );
}
