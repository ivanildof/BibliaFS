import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldAlert, BookOpen, Scale, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  const sections = [
    {
      title: "1. Aceitação dos Termos",
      icon: CheckCircle2,
      content: "Ao acessar e usar o BíbliaFS, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com alguma parte destes termos, não deverá usar nosso aplicativo."
    },
    {
      title: "2. Uso do Serviço",
      icon: BookOpen,
      intro: "O BíbliaFS é um aplicativo gratuito de estudo bíblico. Você concorda em usar o serviço apenas para fins legais e de acordo com estes Termos.",
      forbidden: [
        "Usar o serviço para qualquer finalidade ilegal ou não autorizada",
        "Tentar acessar dados de outros usuários",
        "Interferir ou interromper o serviço ou servidores",
        "Usar o conteúdo para fins comerciais sem autorização",
        "Publicar conteúdo ofensivo, difamatório ou inadequado"
      ]
    },
    {
      title: "3. Conteúdo do Usuário",
      icon: FileText,
      content: "Você mantém todos os direitos sobre o conteúdo que cria no aplicativo (notas, orações, posts). No entanto, ao compartilhar conteúdo publicamente na comunidade, você concede ao BíbliaFS uma licença não exclusiva para exibir esse conteúdo. Reservamo-nos o direito de remover qualquer conteúdo que viole estes termos ou seja considerado inadequado."
    },
    {
      title: "4. Propriedade Intelectual",
      icon: ShieldAlert,
      content: "O aplicativo BíbliaFS e todo seu conteúdo original são propriedade do BíbliaFS e são protegidos por leis de direitos autorais internacionais. Os textos bíblicos disponibilizados são de domínio público ou usados com permissão de seus respectivos detentores de direitos."
    },
    {
      title: "5. Limitação de Responsabilidade",
      icon: AlertTriangle,
      content: "O BíbliaFS é fornecido 'como está'. Não garantimos que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por quaisquer danos resultantes do uso ou incapacidade de usar o serviço."
    },
    {
      title: "6. Modificações",
      icon: Scale,
      content: "Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Mudanças significativas serão notificadas através do aplicativo."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/about" data-testid="link-back-terms">
            <Button variant="ghost" size="icon" className="rounded-xl" data-testid="button-back-terms">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-muted-foreground">Voltar para Sobre</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-800 to-slate-800 flex items-center justify-center shadow-xl shadow-slate-800/20">
              <FileText className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-slate-800 bg-clip-text text-transparent">
            Termos de Uso
          </h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </motion.div>

        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
          >
            <Card className="premium-card ring-2 ring-primary/10 rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                {section.content && <p>{section.content}</p>}
                {section.intro && <p>{section.intro}</p>}
                {section.forbidden && (
                  <div className="space-y-3 pt-2">
                    <p className="font-bold text-foreground">Você concorda em NÃO:</p>
                    <ul className="space-y-2">
                      {section.forbidden.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="premium-card ring-2 ring-primary/10 rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                7. Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através 
                da página "Fale Conosco".
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.55 }}
          className="grid md:grid-cols-3 gap-4 py-8"
        >
          {[
            { href: "/about", title: "Sobre", desc: "Conheça o BíbliaFS" },
            { href: "/privacy", title: "Privacidade", desc: "Proteção de dados" },
            { href: "/security", title: "Segurança", desc: "Medidas de segurança" }
          ].map((link, idx) => (
            <Link key={idx} href={link.href}>
              <Card className="premium-card ring-2 ring-primary/10 rounded-2xl border-none bg-card/80 backdrop-blur-xl shadow-lg cursor-pointer h-full transition-all hover:shadow-xl">
                <CardContent className="p-5 text-center">
                  <h3 className="font-bold mb-1">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

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
