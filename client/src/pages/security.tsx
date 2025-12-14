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

  const bestPractices = [
    "Mantenha seu navegador sempre atualizado",
    "Não compartilhe sua conta com terceiros",
    "Use uma conexão segura (evite Wi-Fi público sem VPN)",
    "Faça logout ao usar dispositivos compartilhados",
    "Verifique se o endereço começa com https://",
    "Reporte qualquer atividade suspeita imediatamente"
  ];

  const dataProtection = [
    {
      title: "Dados Criptografados",
      description: "Criptografia AES-256 para dados sensíveis",
      status: "active"
    },
    {
      title: "Backups Automáticos",
      description: "Backups diários com retenção de 30 dias",
      status: "active"
    },
    {
      title: "Acesso Restrito",
      description: "Apenas equipe autorizada acessa dados",
      status: "active"
    },
    {
      title: "Logs de Auditoria",
      description: "Registro de acessos para monitoramento",
      status: "active"
    },
    {
      title: "Recuperação de Desastres",
      description: "Plano de contingência para incidentes",
      status: "active"
    },
    {
      title: "Testes de Segurança",
      description: "Verificações periódicas de vulnerabilidades",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/about" data-testid="link-back-security">
            <Button variant="ghost" size="icon" data-testid="button-back-security">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">Voltar para Sobre</p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Política de Segurança</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sua segurança é nossa prioridade. Conheça as medidas que tomamos para proteger seus dados e garantir uma experiência segura no BíbliaFS.
          </p>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Card data-testid="card-commitment" className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Nosso Compromisso</h3>
                <p className="text-muted-foreground">
                  O BíbliaFS foi desenvolvido com segurança em mente desde o início. Utilizamos as melhores 
                  práticas da indústria para proteger seus dados pessoais, suas orações, notas e toda sua 
                  jornada espiritual registrada em nosso aplicativo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Medidas de Segurança
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {securityMeasures.map((measure, index) => (
              <Card key={index} data-testid={`card-security-${index}`} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <measure.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm mb-1">{measure.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {measure.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card data-testid="card-data-protection" className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Proteção de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {dataProtection.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-ai-security" className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-purple-600" />
              Segurança da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              O BíbliaFS utiliza a API da OpenAI para fornecer assistência teológica. Garantimos que:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Suas conversas com a IA não são usadas para treinar modelos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Dados são transmitidos de forma criptografada</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Não armazenamos histórico de conversas com IA além do necessário</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">API keys são armazenadas de forma segura como secrets</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-best-practices" className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Boas Práticas para Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Recomendamos que você siga estas práticas para manter sua conta segura:
            </p>
            <ul className="space-y-2">
              {bestPractices.map((practice, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs font-medium">{index + 1}</span>
                  </span>
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-incident" className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-red-600" />
              Resposta a Incidentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Em caso de qualquer incidente de segurança:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">1.</span>
                <span>Notificaremos usuários afetados em até 72 horas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">2.</span>
                <span>Tomaremos medidas imediatas para conter o incidente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">3.</span>
                <span>Investigaremos a causa raiz e implementaremos correções</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">4.</span>
                <span>Forneceremos orientações sobre ações que você deve tomar</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-contact-security" className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Reportar Vulnerabilidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Se você descobrir uma vulnerabilidade de segurança, por favor nos informe imediatamente 
              através da página de contato. Valorizamos pesquisadores de segurança que nos ajudam a 
              manter o BíbliaFS seguro.
            </p>
            <Link href="/contact">
              <Button className="gap-2" data-testid="button-report-vulnerability">
                Reportar Vulnerabilidade
                <Shield className="h-4 w-4" />
              </Button>
            </Link>
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
