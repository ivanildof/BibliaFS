import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Book, Video, Mail, ArrowLeft, Sparkles, Heart, Globe, Smartphone, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Help() {
  const faqs = [
    {
      q: "Como criar um plano de leitura?",
      a: "Acesse a seção 'Planos' no menu lateral ou na navegação inferior. Você verá uma lista de planos disponíveis organizados por duração. Clique em 'Iniciar Plano' no plano que desejar e ele será automaticamente adicionado aos seus planos ativos.",
      icon: Book
    },
    {
      q: "Como funciona o modo offline?",
      a: "No leitor da Bíblia, você verá um ícone de nuvem no canto superior. Clique nele para baixar o capítulo atual e poder lê-lo mesmo sem internet. Você pode gerenciar todos os capítulos baixados acessando a página 'Offline' no menu lateral.",
      icon: Smartphone
    },
    {
      q: "Posso destacar e fazer anotações nos versículos?",
      a: "Sim! Ao ler a Bíblia, clique em qualquer versículo para abrir um menu com opções. Você pode escolher entre 6 cores de destaque, adicionar notas pessoais ou salvar como favorito. Todas as marcações ficam sincronizadas na nuvem.",
      icon: Sparkles
    },
    {
      q: "Como funciona o sistema de gamificação?",
      a: "Cada vez que você lê capítulos ou completa planos, ganha XP. Ao acumular XP, você sobe de nível: Iniciante → Aprendiz → Conhecedor → Sábio → Mestre. Além disso, pode conquistar insígnias por atingir marcos especiais.",
      icon: Heart
    },
    {
      q: "Como usar o diário de orações?",
      a: "Acesse 'Orações' no menu e clique em 'Nova Oração'. Você pode escrever sua oração e até gravar um áudio. Quando a oração for respondida, marque-a como 'Respondida' para manter um histórico das bênçãos.",
      icon: Clock
    },
    {
      q: "O aplicativo é realmente 100% gratuito?",
      a: "Sim! O BíbliaFS é completamente gratuito e sempre será. O aplicativo é mantido por doações voluntárias de usuários que desejam apoiar o desenvolvimento e manter o app acessível para todos.",
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfaff] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-200/40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/about" data-testid="link-back-help">
            <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-back-help">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-slate-400">Voltar para Sobre</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
              <HelpCircle className="h-12 w-12 text-amber-500 drop-shadow-sm relative z-10" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 bg-clip-text text-transparent italic uppercase tracking-tighter">
            Ajuda e Suporte
          </h1>
          <p className="text-slate-400 text-lg font-bold">
            Estamos aqui para ajudar você a aproveitar ao máximo o BíbliaFS
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card data-testid="card-faq" className="rounded-[2.5rem] border-none bg-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full z-0" />
            <CardHeader className="p-8 border-b border-slate-50 relative z-10">
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-800 italic uppercase tracking-tighter">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 shadow-sm">
                  <Book className="h-6 w-6" />
                </div>
                Perguntas Frequentes
              </CardTitle>
              <CardDescription className="text-base font-bold text-slate-400 italic">
                Clique nas perguntas para ver as respostas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 relative z-10">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, idx) => (
                  <AccordionItem 
                    key={idx} 
                    value={`item-${idx}`} 
                    className="border-none bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl px-6 border border-slate-100"
                    data-testid={`accordion-faq-${idx}`}
                  >
                    <AccordionTrigger className="hover:no-underline py-6 font-black text-lg text-left text-slate-700 hover:text-slate-900 transition-colors" data-testid={`trigger-faq-${idx}`}>
                      <div className="flex items-center gap-4">
                        <faq.icon className="h-5 w-5 text-primary shrink-0" />
                        <span className="tracking-tight">{faq.q}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-500 text-base font-medium leading-relaxed pb-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card data-testid="card-tutorials" className="rounded-[2rem] border-none bg-white shadow-xl h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent rounded-bl-full z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-slate-800 font-black uppercase italic tracking-tighter">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
                    <Video className="h-6 w-6" />
                  </div>
                  Tutoriais em Vídeo
                </CardTitle>
                <CardDescription className="text-base font-bold text-slate-400 italic">
                  Aprenda a usar todos os recursos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-slate-500 font-medium leading-relaxed">
                  Em breve disponibilizaremos tutoriais em vídeo para ajudá-lo a explorar todos os recursos do BíbliaFS de forma visual e prática.
                </p>
                <Button variant="outline" className="w-full rounded-2xl h-12 border-slate-100 text-slate-300 font-black italic uppercase tracking-widest bg-slate-50" disabled>
                  <Video className="h-4 w-4 mr-2" />
                  Ver Tutoriais (Em Breve)
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <Card data-testid="card-contact-support" className="rounded-[2rem] border-none bg-white shadow-xl h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full z-0" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-slate-800 font-black uppercase italic tracking-tighter">
                  <div className="p-2.5 rounded-xl bg-primary shadow-lg text-white">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  Precisa de Mais Ajuda?
                </CardTitle>
                <CardDescription className="text-base font-bold text-slate-400 italic">
                  Nossa equipe está pronta para atendê-lo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-slate-500 font-medium leading-relaxed">
                  Se você não encontrou a resposta para sua dúvida nas FAQs acima, entre em contato conosco diretamente. Responderemos o mais breve possível!
                </p>
                <Link href="/contact" data-testid="link-contact-help">
                  <Button className="w-full rounded-2xl h-12 shadow-xl shadow-primary/20 font-black italic uppercase tracking-widest" data-testid="button-contact-us">
                    <Mail className="h-4 w-4 mr-2" />
                    Fale Conosco
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <footer className="text-center text-sm text-slate-400 py-8 border-t border-slate-100">
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
