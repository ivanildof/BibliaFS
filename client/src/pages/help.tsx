import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, Book, Video, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Help() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Ajuda e Suporte</h1>
          <p className="text-muted-foreground">
            Estamos aqui para ajudar você a aproveitar ao máximo o Bíblia+
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card data-testid="card-faq">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>
                Respostas para as dúvidas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">Como criar um plano de leitura?</h3>
                  <p className="text-sm text-muted-foreground">
                    Acesse a seção "Planos" e escolha um dos planos disponíveis ou crie seu próprio plano personalizado.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Como funciona o modo offline?</h3>
                  <p className="text-sm text-muted-foreground">
                    Baixe os capítulos que deseja ler offline clicando no ícone de nuvem no leitor da Bíblia.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Posso destacar versículos?</h3>
                  <p className="text-sm text-muted-foreground">
                    Sim! Selecione o versículo e escolha uma das 6 cores disponíveis para destacar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-tutorials">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Tutoriais em Vídeo
              </CardTitle>
              <CardDescription>
                Aprenda a usar todos os recursos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Em breve disponibilizaremos tutoriais em vídeo para ajudá-lo a explorar todos os recursos do Bíblia+.
              </p>
              <Button variant="outline" className="w-full" disabled>
                <Video className="h-4 w-4 mr-2" />
                Ver Tutoriais (Em Breve)
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-contact-support">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Precisa de Mais Ajuda?
            </CardTitle>
            <CardDescription>
              Nossa equipe está pronta para atendê-lo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Se você não encontrou a resposta para sua dúvida, entre em contato conosco. Responderemos o mais breve possível!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="flex-1">
                <Button className="w-full" data-testid="button-contact-us">
                  <Mail className="h-4 w-4 mr-2" />
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
