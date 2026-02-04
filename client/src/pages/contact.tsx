import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle2, MessageSquare, Heart, Clock, ExternalLink, Star } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';

const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  subject: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  message: z.string().min(20, "Mensagem deve ter pelo menos 20 caracteres"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
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

  const onSubmit = async (data: ContactForm) => {
    console.log("Contact form:", data);
    toast({
      title: t.contact.success,
      description: "Retornaremos em breve. Obrigado pelo contato!",
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
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
            className="text-4xl md:text-6xl font-black tracking-tight text-foreground"
          >
            Como podemos <span className="text-primary">ajudar você?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
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
                  color: "bg-blue-500/10 text-blue-600"
                },
                { 
                  icon: Heart, 
                  label: "Doações & Apoio", 
                  desc: "Apoie o BíbliaFS gratuitamente",
                  color: "bg-rose-500/10 text-rose-600"
                },
                { 
                  icon: Clock, 
                  label: "Tempo de Resposta", 
                  desc: "Normalmente em até 48 horas úteis",
                  color: "bg-amber-500/10 text-amber-600"
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="group flex items-center gap-6 p-8 rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all shadow-[0_15px_30px_rgba(0,0,0,0.2)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent z-0" />
                  <div className={`h-16 w-16 rounded-2xl ${item.color} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-2xl relative z-10`}>
                    <item.icon className="h-8 w-8 drop-shadow-md" />
                  </div>
                  <div className="relative z-10">
                    <p className="font-black text-xl text-white italic uppercase tracking-tighter">{item.label}</p>
                    <p className="text-sm font-bold text-white/40 italic mt-1 leading-tight">{item.desc}</p>
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
                    <h3 className="font-black text-2xl tracking-tight">Sua voz importa!</h3>
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
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-sm font-black bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary transition-all transform hover:scale-110 active:scale-95 border border-primary-foreground/20"
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 space-y-3">
                    <Button 
                      variant="secondary" 
                      className="w-full rounded-2xl h-14 font-black shadow-lg"
                      onClick={() => {
                        const event = new CustomEvent('open-nps-dialog');
                        window.dispatchEvent(event);
                      }}
                    >
                      Enviar feedback detalhado
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full rounded-2xl h-14 font-black shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none gap-3"
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
                  <Card className="rounded-[3rem] border-none bg-slate-900/40 backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-600/5 z-0" />
                    <CardHeader className="p-8 sm:p-10 md:p-14 pb-0 relative z-10">
                      <CardTitle className="text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">Envie sua Mensagem</CardTitle>
                      <CardDescription className="text-base sm:text-lg font-bold text-white/40 italic mt-2">
                        Preencha os campos abaixo e entraremos em contato.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-10 md:p-14 relative z-10">
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2 italic">Nome Completo</Label>
                            <Input
                              id="name"
                              placeholder="Como devemos te chamar?"
                              className="rounded-2xl h-16 bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 transition-all px-8 text-lg font-bold text-white placeholder:text-white/20 shadow-inner"
                              {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                              <p className="text-[10px] text-destructive font-black uppercase tracking-widest ml-2 animate-pulse">{form.formState.errors.name.message}</p>
                            )}
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2 italic">E-mail de Contato</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="exemplo@email.com"
                              className="rounded-2xl h-16 bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 transition-all px-8 text-lg font-bold text-white placeholder:text-white/20 shadow-inner"
                              {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                              <p className="text-[10px] text-destructive font-black uppercase tracking-widest ml-2 animate-pulse">{form.formState.errors.email.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2 italic">Assunto</Label>
                          <Input
                            id="subject"
                            placeholder="Sobre o que você gostaria de falar?"
                            className="rounded-2xl h-16 bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 transition-all px-8 text-lg font-bold text-white placeholder:text-white/20 shadow-inner"
                            {...form.register("subject")}
                          />
                          {form.formState.errors.subject && (
                            <p className="text-[10px] text-destructive font-black uppercase tracking-widest ml-2 animate-pulse">{form.formState.errors.subject.message}</p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2 italic">Sua Mensagem</Label>
                          <Textarea
                            id="message"
                            placeholder="Conte-nos os detalhes..."
                            className="rounded-[2.5rem] min-h-[220px] bg-white/5 border-white/10 focus:border-primary focus:ring-primary/20 transition-all p-8 text-lg font-bold text-white placeholder:text-white/20 shadow-inner resize-none"
                            {...form.register("message")}
                          />
                          {form.formState.errors.message && (
                            <p className="text-[10px] text-destructive font-black uppercase tracking-widest ml-2 animate-pulse">{form.formState.errors.message.message}</p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          disabled={form.formState.isSubmitting}
                          className="w-full rounded-[2.5rem] h-20 text-2xl font-black italic uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary text-white"
                        >
                          <Send className="h-7 w-7 mr-4 drop-shadow-md" />
                          Enviar agora
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
                  <Card className="premium-card ring-2 ring-primary/10 rounded-[4rem] border-none bg-card/80 backdrop-blur-2xl shadow-2xl text-center overflow-hidden">
                    <div className="h-4 w-full bg-green-500" />
                    <CardHeader className="pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-8">
                      <div className="flex justify-center mb-6 sm:mb-10">
                        <div className="h-24 sm:h-32 w-24 sm:w-32 rounded-[2.5rem] bg-green-500/10 flex items-center justify-center animate-bounce">
                          <CheckCircle2 className="h-12 sm:h-16 w-12 sm:w-16 text-green-600" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl sm:text-4xl font-black">Mensagem Enviada!</CardTitle>
                      <CardDescription className="text-base sm:text-xl px-4 sm:px-8 mt-4">
                        Recebemos seu contato com sucesso. Nossa equipe analisará sua mensagem e retornaremos em até 48 horas.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-12 sm:pb-16 px-4 sm:px-8">
                      <Button 
                        onClick={() => setSubmitted(false)} 
                        variant="outline"
                        className="w-full rounded-[2rem] h-16 text-xl font-black border-2"
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
          <p className="text-xs sm:text-sm text-muted-foreground/60 font-medium">© 2026 BíbliaFS. Criado com dedicação para sua jornada espiritual.</p>
        </footer>
      </div>
    </div>
  );
}
