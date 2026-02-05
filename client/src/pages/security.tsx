import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  Shield, 
  Server, 
  Key, 
  Eye, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Database,
  Globe,
  Fingerprint,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

export default function Security() {
  const securityMeasures = [
    {
      icon: Lock,
      title: "Criptografia HTTPS/TLS",
      description: "Todas as comunicações entre seu dispositivo e nossos servidores são criptografadas usando protocolo TLS 1.3, garantindo que seus dados não sejam interceptados."
    },
    {
      icon: Database,
      title: "Banco de Dados Seguro",
      description: "Utilizamos PostgreSQL com criptografia em repouso. Seus dados pessoais, notas e orações são armazenados de forma segura em servidores protegidos."
    },
    {
      icon: Key,
      title: "Autenticação Segura",
      description: "Login com email e senha protegido por criptografia bcrypt, garantindo autenticação segura e proteção de credenciais."
    },
    {
      icon: Shield,
      title: "Proteção de Sessão",
      description: "Sessões gerenciadas com cookies httpOnly e secure, com expiração automática e renovação segura de tokens."
    },
    {
      icon: Eye,
      title: "Privacidade por Design",
      description: "Nunca vendemos ou compartilhamos seus dados com terceiros para fins de marketing. Seus dados são usados exclusivamente para melhorar sua experiência."
    },
    {
      icon: Server,
      title: "Infraestrutura Cloud",
      description: "Hospedagem em infraestrutura de nuvem com alta disponibilidade, backups automáticos e proteção contra DDoS."
    }
  ];

  const dataProtection = [
    { title: "Dados Criptografados", description: "Criptografia AES-256 para dados sensíveis" },
    { title: "Backups Automáticos", description: "Backups diários com retenção de 30 dias" },
    { title: "Acesso Restrito", description: "Apenas equipe autorizada acessa dados" },
    { title: "Logs de Auditoria", description: "Registro de acessos para monitoramento" },
    { title: "Recuperação de Desastres", description: "Plano de contingência para incidentes" },
    { title: "Testes de Segurança", description: "Verificações periódicas de vulnerabilidades" }
  ];

  const bestPractices = [
    "Mantenha seu navegador sempre atualizado",
    "Não compartilhe sua conta com terceiros",
    "Use uma conexão segura (evite Wi-Fi público sem VPN)",
    "Faça logout ao usar dispositivos compartilhados",
    "Verifique se o endereço começa com https://",
    "Reporte qualquer atividade suspeita imediatamente"
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-200/40 dark:bg-slate-700/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100/50 dark:bg-slate-800/40 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/about" data-testid="link-back-security">
            <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-back-security">
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
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/20">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
            Segurança
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conheça as medidas que tomamos para proteger seus dados e garantir uma experiência segura no BíbliaFS.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card data-testid="card-commitment" className="rounded-2xl border-none bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-xl shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-3 text-green-600">Nosso Compromisso</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    O BíbliaFS foi desenvolvido com segurança em mente desde o início. Utilizamos as melhores 
                    práticas da indústria para proteger seus dados pessoais, suas orações, notas e toda sua 
                    jornada espiritual registrada em nosso aplicativo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            Medidas de Segurança
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {securityMeasures.map((measure, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.05 }}
              >
                <Card data-testid={`card-security-${index}`} className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <measure.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{measure.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {measure.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card data-testid="card-data-protection" className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                Proteção de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {dataProtection.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-base">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card data-testid="card-ai-security" className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 rounded-xl bg-slate-600/10">
                  <Fingerprint className="h-6 w-6 text-slate-600" />
                </div>
                Segurança da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="text-lg">
                O BíbliaFS utiliza a API da OpenAI para fornecer assistência teológica. Garantimos que:
              </p>
              <ul className="grid sm:grid-cols-2 gap-4">
                {[
                  "Suas conversas com a IA não são usadas para treinar modelos",
                  "Dados são transmitidos de forma criptografada",
                  "Não armazenamos histórico além do necessário",
                  "Chaves de API são protegidas rigorosamente"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card data-testid="card-best-practices" className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                Boas Práticas para Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-lg mb-6">
                Recomendamos que você siga estas práticas para manter sua conta segura:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {bestPractices.map((practice, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30">
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium leading-tight pt-1">{practice}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card data-testid="card-incident" className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 rounded-xl bg-red-500/10">
                  <RefreshCw className="h-6 w-6 text-red-600" />
                </div>
                Resposta a Incidentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="text-lg font-medium text-foreground">Em caso de qualquer incidente de segurança:</p>
              <div className="grid gap-3">
                {[
                  "Notificaremos usuários afetados em até 72 horas",
                  "Tomaremos medidas imediatas para conter o incidente",
                  "Investigaremos a causa raiz e corrigiremos",
                  "Forneceremos orientações sobre ações preventivas"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <Card data-testid="card-contact-security" className="rounded-2xl border-none bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                Reportar Vulnerabilidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Se você descobrir uma vulnerabilidade de segurança, por favor nos informe imediatamente 
                através da página de contato. Valorizamos pesquisadores de segurança que nos ajudam a 
                manter o BíbliaFS seguro.
              </p>
              <Link href="/contact">
                <Button className="rounded-xl h-12 px-8 gap-2 shadow-lg shadow-primary/20" data-testid="button-report-vulnerability">
                  Reportar Vulnerabilidade
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-4 py-8"
        >
          {[
            { href: "/about", title: "Sobre", desc: "Conheça o BíbliaFS" },
            { href: "/privacy", title: "Privacidade", desc: "Proteção de dados" },
            { href: "/terms", title: "Termos", desc: "Regras e condições" }
          ].map((link, idx) => (
            <Link key={idx} href={link.href}>
              <Card className="rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg cursor-pointer h-full transition-all hover:shadow-xl">
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
