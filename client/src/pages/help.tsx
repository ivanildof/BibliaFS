import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Book, Video, Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Help() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/about">
            <Button variant="ghost" size="icon" data-testid="button-back-about">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">Voltar para Sobre</p>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shadow-lg">
              <HelpCircle className="h-10 w-10 text-amber-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Ajuda e Suporte</h1>
          <p className="text-muted-foreground">
            Estamos aqui para ajudar você a aproveitar ao máximo o BíbliaFS
          </p>
        </div>

        <Card data-testid="card-faq" className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>
              Clique nas perguntas para ver as respostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Como criar um plano de leitura?</AccordionTrigger>
                <AccordionContent>
                  Acesse a seção "Planos" no menu lateral ou na navegação inferior. Você verá uma lista de planos disponíveis organizados por duração (7 dias, 30 dias, 365 dias, etc.). Clique em "Iniciar Plano" no plano que desejar e ele será automaticamente adicionado aos seus planos ativos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Como funciona o modo offline?</AccordionTrigger>
                <AccordionContent>
                  No leitor da Bíblia, você verá um ícone de nuvem no canto superior. Clique nele para baixar o capítulo atual e poder lê-lo mesmo sem internet. Você pode gerenciar todos os capítulos baixados acessando a página "Offline" no menu lateral, onde também pode ver quanto espaço está sendo usado.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Posso destacar e fazer anotações nos versículos?</AccordionTrigger>
                <AccordionContent>
                  Sim! Ao ler a Bíblia, clique em qualquer versículo para abrir um menu com opções. Você pode escolher entre 6 cores de destaque (amarelo, verde, azul, roxo, rosa e laranja), adicionar notas pessoais ou salvar como favorito. Todas essas marcações ficam sincronizadas na nuvem.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Como funciona o sistema de gamificação?</AccordionTrigger>
                <AccordionContent>
                  Cada vez que você lê capítulos, completa planos ou mantém uma sequência de leitura diária, ganha XP (pontos de experiência). Ao acumular XP, você sobe de nível: Iniciante → Aprendiz → Conhecedor → Sábio → Mestre. Além disso, pode conquistar 18 diferentes conquistas por atingir marcos especiais, como ler 7 dias seguidos ou completar seu primeiro plano.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Como usar o diário de orações?</AccordionTrigger>
                <AccordionContent>
                  Acesse "Orações" no menu e clique em "Nova Oração". Você pode escrever sua oração, categorizá-la (Agradecimento, Súplica, Intercessão ou Confissão) e até gravar um áudio da sua oração. Quando a oração for respondida, marque-a como "Respondida" para manter um histórico das bênçãos recebidas.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>O aplicativo é realmente 100% gratuito?</AccordionTrigger>
                <AccordionContent>
                  Sim! O BíbliaFS é completamente gratuito e sempre será. Todos os recursos estão disponíveis sem custo algum. O aplicativo é mantido por doações voluntárias de usuários que desejam apoiar o desenvolvimento e manter o app gratuito para todos. Você pode doar se quiser, mas não é obrigatório.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Como compartilhar versículos?</AccordionTrigger>
                <AccordionContent>
                  Na página do Versículo do Dia ou ao selecionar qualquer versículo no leitor, você tem a opção de copiar o texto formatado ou baixar uma imagem bonita do versículo para compartilhar nas redes sociais ou com amigos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>Posso usar em vários dispositivos?</AccordionTrigger>
                <AccordionContent>
                  Sim! Ao fazer login com sua conta Replit, todos os seus dados (planos, notas, destaques, orações, progresso) são sincronizados automaticamente entre todos os seus dispositivos. Você pode começar a ler no celular e continuar no computador sem perder nada.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger>Quais versões da Bíblia estão disponíveis?</AccordionTrigger>
                <AccordionContent>
                  Atualmente oferecemos 4 versões em português: NVI (Nova Versão Internacional), ACF (Almeida Corrigida Fiel), ARC (Almeida Revista e Corrigida) e RA (Almeida Revista e Atualizada). Você pode alternar entre elas a qualquer momento no leitor da Bíblia.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger>Como alterar o idioma do aplicativo?</AccordionTrigger>
                <AccordionContent>
                  No canto superior direito, você encontrará um seletor de idiomas. O BíbliaFS está disponível em Português (BR), English, Nederlands e Español. Ao mudar o idioma, toda a interface é traduzida automaticamente.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">

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
                Em breve disponibilizaremos tutoriais em vídeo para ajudá-lo a explorar todos os recursos do BíbliaFS.
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
