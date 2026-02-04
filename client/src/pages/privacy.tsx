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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
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
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card data-testid="card-intro" className="rounded-[2rem] border-none bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent z-0" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Introdução</CardTitle>
            </CardHeader>
            <CardContent className="text-white/60 font-medium text-lg relative z-10">
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
            <Card className="rounded-[2rem] border-none bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white font-black uppercase italic tracking-tighter">
                  <div className="p-2.5 rounded-xl bg-white/5 ring-1 ring-white/10 text-white shadow-inner">
                    <section.icon className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-white/60 font-medium relative z-10">
                {section.intro && <p className="font-bold text-white/80 italic">{section.intro}</p>}
                {section.content && (
                  <ul className="space-y-4">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] mt-2 flex-shrink-0" />
                        <div>
                          <strong className="text-white font-black uppercase italic tracking-wider text-xs block mb-1">{item.label}</strong>
                          <span className="text-white/60">{item.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {section.items && (
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)] mt-2 flex-shrink-0" />
                        <span className="text-white/70">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="premium-card ring-2 ring-primary/10 rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10">
                  <Baby className="h-5 w-5 text-pink-600" />
                </div>
                7. Privacidade de Menores
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                O BíbliaFS pode ser usado por menores de idade, mas recomendamos supervisão parental. 
                Não coletamos intencionalmente informações de crianças menores de 13 anos sem 
                consentimento dos pais.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card className="premium-card ring-2 ring-primary/10 rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                </div>
                8. Alterações nesta Política
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
                mudanças significativas através do aplicativo ou por e-mail.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="premium-card ring-2 ring-primary/10 rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                9. Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
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
          className="grid md:grid-cols-3 gap-4 py-8"
        >
          {[
            { href: "/about", title: "Sobre", desc: "Conheça o BíbliaFS" },
            { href: "/terms", title: "Termos de Uso", desc: "Regras e condições" },
            { href: "/security", title: "Segurança", desc: "Proteção de dados" }
          ].map((link, idx) => (
            <Link key={idx} href={link.href}>
              <Card className="premium-card ring-2 ring-primary/10 rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg cursor-pointer h-full transition-all hover:shadow-xl">
                <CardContent className="p-5 text-center">
                  <h3 className="font-bold mb-1">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
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
    </div>
  );
}
