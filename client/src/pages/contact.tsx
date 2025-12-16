import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, CheckCircle2 } from "lucide-react";
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
    // Simulate sending message
    console.log("Contact form:", data);
    
    toast({
      title: t.contact.success,
      description: "Retornaremos em breve. Obrigado pelo contato!",
    });
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle>{t.contact.success}</CardTitle>
            <CardDescription>
              Recebemos sua mensagem e retornaremos em breve. Obrigado pelo contato!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setSubmitted(false)} 
              variant="outline"
              className="w-full"
              data-testid="button-send-another"
            >
              Enviar Outra Mensagem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-white dark:bg-slate-950">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">{t.contact.title}</h1>
          <p className="text-muted-foreground">
            Tem dúvidas, sugestões ou feedback? Adoraríamos ouvir você!
          </p>
        </div>

        <Card data-testid="card-contact-form">
          <CardHeader>
            <CardTitle>{t.contact.subtitle}</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e entraremos em contato o mais breve possível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.contact.name} *</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  {...form.register("name")}
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.contact.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...form.register("email")}
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  placeholder="Sobre o que você gostaria de falar?"
                  {...form.register("subject")}
                  data-testid="input-subject"
                />
                {form.formState.errors.subject && (
                  <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t.contact.message} *</Label>
                <Textarea
                  id="message"
                  placeholder="Escreva sua mensagem aqui..."
                  rows={6}
                  {...form.register("message")}
                  data-testid="textarea-message"
                />
                {form.formState.errors.message && (
                  <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full"
                data-testid="button-submit-contact"
              >
                <Send className="h-4 w-4 mr-2" />
                {t.contact.send}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card data-testid="card-other-contact">
          <CardHeader>
            <CardTitle>Outras Formas de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Suporte Técnico:</strong> Para problemas técnicos, consulte primeiro nossa página de Ajuda
            </p>
            <p>
              <strong>Doações:</strong> Visite a página "Doar" para apoiar o desenvolvimento do BíbliaFS
            </p>
            <p>
              <strong>Tempo de Resposta:</strong> Respondemos normalmente em até 48 horas úteis
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
