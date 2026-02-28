import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle2, MessageSquare, Heart, Clock, ExternalLink, Star } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  subject: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  message: z.string().min(20, "Mensagem deve ter pelo menos 20 caracteres"),
});

type ContactForm = z.infer<typeof contactSchema>;

function ContactContent() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t.contact.success,
        description: "Retornaremos em breve. Obrigado pelo contato!",
      });
      setSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center space-y-6">
        <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Fale Conosco</h1>
          <p className="text-muted-foreground max-w-sm">
            Para entrar em contato com nossa equipe, você precisa estar conectado.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => window.location.href = "/login"} className="w-full h-12 rounded-xl text-lg font-bold">
            Entrar Agora
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"} className="w-full h-12 rounded-xl font-bold">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-muted/50 dark:bg-muted/30 blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4"
          >
            <Mail className="h-4 w-4" />
            <span>Fale Conosco</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
          >
            Como podemos <span className="text-primary">ajudar você?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto font-bold italic"
          >
            Tem dúvidas, sugestões ou feedback? Adoraríamos ouvir você! Nossa equipe está pronta para oferecer suporte e ouvir suas ideias.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Info & NPS */}
          <div className="lg:col-span-5 space-y-8">
            <div className="grid gap-4">
              {[
                { 
                  icon: MessageSquare, 
                  label: "Suporte Técnico", 
                  desc: "Dúvidas sobre o funcionamento do app",
                  gradient: "from-blue-500/15 via-indigo-500/10 to-transparent",
                  iconGradient: "from-blue-500 to-indigo-600",
                  shadow: "shadow-blue-500/20"
                },
                { 
                  icon: Heart, 
                  label: "Doações & Apoio", 
                  desc: "Apoie o BíbliaFS gratuitamente",
                  gradient: "from-rose-500/15 via-pink-500/10 to-transparent",
                  iconGradient: "from-rose-500 to-pink-600",
                  shadow: "shadow-rose-500/20"
                },
                { 
                  icon: Clock, 
                  label: "Tempo de Resposta", 
                  desc: "Normalmente em até 48 horas úteis",
                  gradient: "from-amber-500/15 via-orange-500/10 to-transparent",
                  iconGradient: "from-amber-500 to-orange-600",
                  shadow: "shadow-amber-500/20"
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`group flex items-center gap-6 p-6 rounded-[2rem] bg-gradient-to-r ${item.gradient} border-none shadow-lg ${item.shadow} relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full z-0" />
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${item.iconGradient} flex items-center justify-center shadow-lg relative z-10`}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="font-semibold text-lg text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* NPS Card Redesigned */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="rounded-[2.5rem] border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Heart className="h-32 w-32 -mr-16 -mt-16" />
                </div>
                <CardContent className="p-6 sm:p-8 space-y-6 relative z-10">
                  <div className="space-y-2">
                    <h3 className="font-bold text-2xl tracking-tight">Sua voz importa!</h3>
                    <p className="text-primary-foreground/80 text-sm">
                      O quanto você recomendaria o BíbliaFS para um amigo? (0-10)
                    </p>
                  </div>
                  
                  <div className="flex justify-start sm:justify-between gap-2 sm:gap-1.5 flex-wrap">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        data-nps-score={num}
                        data-testid={`nps-score-${num}`}
                        onClick={() => {
                          const event = new CustomEvent('open-nps-score', { detail: { score: num } });
                          window.dispatchEvent(event);
                        }}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-sm font-bold bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary transition-all transform hover:scale-110 active:scale-95 border border-primary-foreground/20"
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 space-y-3">
                    <Button 
                      variant="secondary" 
                      className="w-full rounded-2xl h-14 font-bold shadow-lg"
                      onClick={() => {
                        const event = new CustomEvent('open-nps-dialog');
                        window.dispatchEvent(event);
                      }}
                    >
                      Enviar feedback detalhado
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full rounded-2xl h-14 font-bold shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none gap-3"
                      onClick={() => {
                        window.open('https://play.google.com/store/apps/details?id=com.bibliafullstack.app', '_blank');
                      }}
                      data-testid="button-rate-play-store"
                    >
                      <Star className="h-5 w-5 fill-current" />
                      Avaliar na Play Store
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-primary/5 via-card to-indigo-500/5 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-bl-full z-0" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-tr-full z-0" />
                    <CardHeader className="p-8 sm:p-10 md:p-12 pb-0 relative z-10">
                      <CardTitle className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary via-indigo-600 to-purple-600 bg-clip-text text-transparent">Envie sua Mensagem</CardTitle>
                      <CardDescription className="text-base text-muted-foreground mt-2">
                        Preencha os campos abaixo e entraremos em contato.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-10 md:p-14 relative z-10">
                      <form onSubmit={form.handleSubmit((data) => contactMutation.mutate(data))} className="space-y-10">
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2 italic">Nome Completo</Label>
                            <Input
                              id="name"
                              placeholder="Como devemos te chamar?"
                              className="rounded-2xl h-16 bg-muted border-border focus:border-primary focus:ring-primary/10 transition-all px-8 text-lg font-bold text-foreground placeholder:text-muted-foreground shadow-inner"
                              {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                              <p className="text-[10px] text-destructive font-bold uppercase tracking-widest ml-2 animate-pulse">{form.formState.errors.name.message}</p>
                            )}
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2 italic">E-mail de Contato</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="exemplo@email.com"
                              className="rounded-2xl h-16 bg-muted border-border focus:border-primary focus:ring-primary/10 transition-all px-8 text-lg font-bold text-foreground placeholder:text-muted-foreground shadow-inner"
                              {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                              <p className="text-[10px] text-destructive font-bold uppercase tracking-widest ml-2 animate-pulse">{form.formState.errors.email.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2 italic">Assunto</Label>
                          <Input
                            id="subject"
                            placeholder="Sobre o que você gostaria de falar?"
                            className="rounded-2xl h-16 bg-muted border-border focus:border-primary focus:ring-primary/10 transition-all px-8 text-lg font-bold text-foreground placeholder:text-muted-foreground shadow-inner"
                            {...form.register("subject")}
                          />
                          {form.formState.errors.subject && (
                            <p className="text-[10px] text-destructive font-bold uppercase tracking-widest ml-2 animate-pulse">{form.formState.errors.subject.message}</p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground ml-2 italic">Sua Mensagem</Label>
                          <Textarea
                            id="message"
                            placeholder="Conte-nos os detalhes..."
                            className="rounded-[2.5rem] min-h-[220px] bg-muted border-border focus:border-primary focus:ring-primary/10 transition-all p-8 text-lg font-bold text-foreground placeholder:text-muted-foreground shadow-inner resize-none"
                            {...form.register("message")}
                          />
                          {form.formState.errors.message && (
                            <p className="text-[10px] text-destructive font-bold uppercase tracking-widest ml-2 animate-pulse">{form.formState.errors.message.message}</p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          disabled={contactMutation.isPending}
                          className="w-full rounded-[2.5rem] h-20 text-2xl font-bold italic uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary text-white"
                        >
                          <Send className="h-7 w-7 mr-4 drop-shadow-md" />
                          {contactMutation.isPending ? "Enviando..." : "Enviar agora"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12"
                >
                  <Card className="rounded-[3rem] border-none glass-premium hover-premium shadow-2xl text-center overflow-hidden relative">
                    <div className="h-4 w-full bg-green-500" />
                    <CardHeader className="pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-8">
                      <div className="flex justify-center mb-6 sm:mb-10">
                        <div className="h-24 sm:h-32 w-24 sm:w-32 rounded-[2.5rem] bg-green-500/10 flex items-center justify-center animate-bounce">
                          <CheckCircle2 className="h-12 sm:h-16 w-12 sm:w-16 text-green-600" />
                        </div>
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold">Mensagem Enviada!</CardTitle>
                      <CardDescription className="text-base sm:text-xl px-4 sm:px-8 mt-4">
                        Recebemos seu contato com sucesso. Nossa equipe analisará sua mensagem e retornaremos em até 48 horas.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-12 sm:pb-16 px-4 sm:px-8">
                      <Button 
                        onClick={() => setSubmitted(false)} 
                        variant="outline"
                        className="w-full rounded-[2rem] h-16 text-xl font-bold border-2"
                      >
                        Enviar Outra Mensagem
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="mt-20 text-center space-y-4 py-12 px-4 border-t border-border/50">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-muted-foreground text-sm sm:text-base">
            <a href="https://fabrisite.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-bold">FabriSite</a>
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <a href="#" className="hover:text-primary transition-colors font-bold">Termos de Uso</a>
            <span className="w-1.5 h-1.5 rounded-full bg-border" />
            <a href="#" className="hover:text-primary transition-colors font-bold">Privacidade</a>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-bold italic">© 2026 BíbliaFS | Desenvolvido por | <a href="https://fabrisite.com.br/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FabriSite</a></p>
        </footer>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <ProtectedRoute>
      <ContactContent />
    </ProtectedRoute>
  );
}
