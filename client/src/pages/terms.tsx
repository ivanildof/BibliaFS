import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Termos de Uso</h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Card data-testid="card-acceptance">
          <CardHeader>
            <CardTitle>1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Ao acessar e usar o Bíblia+, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
              Se você não concordar com alguma parte destes termos, não deverá usar nosso aplicativo.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-usage">
          <CardHeader>
            <CardTitle>2. Uso do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              O Bíblia+ é um aplicativo gratuito de estudo bíblico. Você concorda em usar o serviço 
              apenas para fins legais e de acordo com estes Termos.
            </p>
            <p className="font-medium">Você concorda em NÃO:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Usar o serviço para qualquer finalidade ilegal ou não autorizada</li>
              <li>Tentar acessar dados de outros usuários</li>
              <li>Interferir ou interromper o serviço ou servidores</li>
              <li>Usar o conteúdo para fins comerciais sem autorização</li>
              <li>Publicar conteúdo ofensivo, difamatório ou inadequado</li>
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-content">
          <CardHeader>
            <CardTitle>3. Conteúdo do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Você mantém todos os direitos sobre o conteúdo que cria no aplicativo (notas, orações, posts). 
              No entanto, ao compartilhar conteúdo publicamente na comunidade, você concede ao Bíblia+ 
              uma licença não exclusiva para exibir esse conteúdo.
            </p>
            <p>
              Reservamo-nos o direito de remover qualquer conteúdo que viole estes termos ou seja 
              considerado inadequado.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-intellectual">
          <CardHeader>
            <CardTitle>4. Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              O aplicativo Bíblia+ e todo seu conteúdo original são propriedade do Bíblia+ e são 
              protegidos por leis de direitos autorais internacionais.
            </p>
            <p>
              Os textos bíblicos disponibilizados são de domínio público ou usados com permissão 
              de seus respectivos detentores de direitos.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-liability">
          <CardHeader>
            <CardTitle>5. Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              O Bíblia+ é fornecido "como está". Não garantimos que o serviço será ininterrupto 
              ou livre de erros. Não nos responsabilizamos por quaisquer danos resultantes do uso 
              ou incapacidade de usar o serviço.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-modifications">
          <CardHeader>
            <CardTitle>6. Modificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. 
              Mudanças significativas serão notificadas através do aplicativo.
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-contact-terms">
          <CardHeader>
            <CardTitle>7. Contato</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através 
              da página "Fale Conosco".
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
