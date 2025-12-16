import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/about" data-testid="link-back-privacy">
            <Button variant="ghost" size="icon" data-testid="button-back-privacy">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">Voltar para Sobre</p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Card data-testid="card-intro">
          <CardHeader>
            <CardTitle>Introdução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              No BíbliaFS, levamos sua privacidade a sério. Esta Política de Privacidade explica 
              como coletamos, usamos, armazenamos e protegemos suas informações pessoais.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-collection">
          <CardHeader>
            <CardTitle>1. Informações que Coletamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p className="font-medium">Coletamos as seguintes informações:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Informações de Conta:</strong> Nome, e-mail e foto de perfil (quando você se registra)
              </li>
              <li>
                <strong>Conteúdo do Usuário:</strong> Notas, destaques, orações, planos de leitura e posts na comunidade
              </li>
              <li>
                <strong>Dados de Uso:</strong> Estatísticas de leitura, progresso em planos, conquistas e atividades
              </li>
              <li>
                <strong>Informações Técnicas:</strong> Tipo de dispositivo, sistema operacional e dados de navegação
              </li>
              <li>
                <strong>Dados de Pagamento:</strong> Informações de doação processadas de forma segura pelo Stripe
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-usage-data">
          <CardHeader>
            <CardTitle>2. Como Usamos Suas Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>Usamos suas informações para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Personalizar sua experiência de estudo bíblico</li>
              <li>Sincronizar seus dados entre dispositivos</li>
              <li>Processar doações de forma segura</li>
              <li>Enviar notificações sobre planos de leitura (se ativado)</li>
              <li>Analisar padrões de uso para melhorar o aplicativo</li>
              <li>Comunicar atualizações importantes do serviço</li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-sharing">
          <CardHeader>
            <CardTitle>3. Compartilhamento de Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Nunca vendemos suas informações pessoais.</strong> Compartilhamos dados apenas:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Com outros usuários, quando você publica na comunidade</li>
              <li>Com processadores de pagamento (Stripe) para doações seguras</li>
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Com seu consentimento explícito</li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-security">
          <CardHeader>
            <CardTitle>4. Segurança dos Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger 
              suas informações:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Criptografia de dados em trânsito (HTTPS/SSL)</li>
              <li>Armazenamento seguro em servidores protegidos</li>
              <li>Senhas criptografadas com bcrypt</li>
              <li>Acesso restrito a dados pessoais</li>
              <li>Backups regulares e seguros</li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-rights">
          <CardHeader>
            <CardTitle>5. Seus Direitos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>Você tem direito a:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar exclusão de sua conta e dados</li>
              <li>Exportar seus dados</li>
              <li>Optar por não receber notificações</li>
              <li>Revogar consentimentos a qualquer momento</li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-cookies">
          <CardHeader>
            <CardTitle>6. Cookies e Armazenamento Local</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Usamos cookies e armazenamento local do navegador para:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Manter você conectado</li>
              <li>Lembrar suas preferências (idioma, tema)</li>
              <li>Armazenar conteúdo offline</li>
              <li>Melhorar o desempenho do aplicativo</li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-children">
          <CardHeader>
            <CardTitle>7. Privacidade de Menores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              O BíbliaFS pode ser usado por menores de idade, mas recomendamos supervisão parental. 
              Não coletamos intencionalmente informações de crianças menores de 13 anos sem 
              consentimento dos pais.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-changes">
          <CardHeader>
            <CardTitle>8. Alterações nesta Política</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
              mudanças significativas através do aplicativo ou por e-mail.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-contact-privacy">
          <CardHeader>
            <CardTitle>9. Contato</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Para questões sobre privacidade ou para exercer seus direitos, entre em contato 
              através da página "Fale Conosco".
            </p>
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
