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
import { Mail, Send, CheckCircle2, MessageSquare, Heart, Clock, ExternalLink } from "lucide-react";
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 space-y-10">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid lg:grid-cols-5 gap-10"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {t.contact.title}
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Tem dúvidas, sugestões ou feedback? Adoraríamos ouvir você! Nossa equipe está aqui para ajudar.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: MessageSquare, label: "Suporte Técnico", desc: "Consulte nossa página de Ajuda" },
                    { icon: Heart, label: "Doações", desc: "Apoie o BíbliaFS gratuitamente" },
                    { icon: Clock, label: "Resposta", desc: "Normalmente em até 48 horas úteis" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 backdrop-blur-sm"
                    >
                      <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Card className="rounded-2xl border-none bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl shadow-lg">
                  <CardContent className="p-6 space-y-4 text-center">
                    <div className="flex justify-center">
                      <ExternalLink className="h-8 w-8 text-primary opacity-50" />
                    </div>
                    <p className="text-sm font-medium">Siga nossas redes sociais para atualizações e inspirações diárias.</p>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <Card data-testid="card-contact-form" className="rounded-[2.5rem] border-none bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <CardHeader className="bg-primary/5 p-8 md:p-10 border-b border-primary/10">
                    <CardTitle className="text-2xl font-bold">{t.contact.subtitle}</CardTitle>
                    <CardDescription className="text-base">
                      Preencha o formulário abaixo e responderemos o mais breve possível
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 md:p-10">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-bold ml-1">{t.contact.name} *</Label>
                          <Input
                            id="name"
                            placeholder="Seu nome completo"
                            className="rounded-xl h-12 bg-muted/50 border-none px-4"
                            {...form.register("name")}
                            data-testid="input-name"
                          />
                          {form.formState.errors.name && (
                            <p className="text-xs text-destructive font-medium ml-1">{form.formState.errors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-bold ml-1">{t.contact.email} *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            className="rounded-xl h-12 bg-muted/50 border-none px-4"
                            {...form.register("email")}
                            data-testid="input-email"
                          />
                          {form.formState.errors.email && (
                            <p className="text-xs text-destructive font-medium ml-1">{form.formState.errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-bold ml-1">Assunto *</Label>
                        <Input
                          id="subject"
                          placeholder="Sobre o que você gostaria de falar?"
                          className="rounded-xl h-12 bg-muted/50 border-none px-4"
                          {...form.register("subject")}
                          data-testid="input-subject"
                        />
                        {form.formState.errors.subject && (
                          <p className="text-xs text-destructive font-medium ml-1">{form.formState.errors.subject.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-bold ml-1">{t.contact.message} *</Label>
                        <Textarea
                          id="message"
                          placeholder="Escreva sua mensagem detalhadamente aqui..."
                          className="rounded-2xl min-h-[180px] bg-muted/50 border-none p-4 resize-none"
                          {...form.register("message")}
                          data-testid="textarea-message"
                        />
                        {form.formState.errors.message && (
                          <p className="text-xs text-destructive font-medium ml-1">{form.formState.errors.message.message}</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full rounded-xl h-14 text-lg font-bold shadow-lg shadow-primary/20"
                        data-testid="button-submit-contact"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        {t.contact.send}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto py-20"
            >
              <Card className="rounded-[3rem] border-none bg-card/80 backdrop-blur-2xl shadow-2xl text-center overflow-hidden">
                <div className="h-3 w-full bg-primary" />
                <CardHeader className="pt-12 pb-6">
                  <div className="flex justify-center mb-8">
                    <div className="h-24 w-24 rounded-3xl bg-green-500/10 flex items-center justify-center animate-bounce">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold">{t.contact.success}</CardTitle>
                  <CardDescription className="text-lg px-6">
                    Recebemos sua mensagem e retornaremos em breve. Obrigado pelo contato e por fazer parte da nossa comunidade!
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-12 px-10">
                  <Button 
                    onClick={() => setSubmitted(false)} 
                    variant="outline"
                    className="w-full rounded-2xl h-14 text-lg font-bold"
                    data-testid="button-send-another"
                  >
                    Enviar Outra Mensagem
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
