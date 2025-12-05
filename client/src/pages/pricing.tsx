import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Check,
  Sparkles,
  Zap,
  Crown,
  Heart,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

const freePlan = {
  id: "free",
  name: "Gratuito",
  price: "R$ 0",
  period: "/para sempre",
  description: "Perfeito para começar sua jornada de estudo bíblico",
  badge: null,
  features: [
    "Acesso completo à Bíblia (4 versões)",
    "Versículo do Dia",
    "Destaques em 6 cores",
    "Notas e anotações",
    "Modo offline básico",
    "Diário de orações",
    "Comunidade",
    "Gamificação e conquistas",
  ],
  cta: "Começar Grátis",
  highlighted: false,
};

const premiumPlan = {
  id: "premium",
  name: "Premium",
  price: "R$ 19,90",
  period: "/mês",
  description: "Desbloqueie todo o potencial do estudo bíblico",
  badge: { text: "Mais Popular", icon: Sparkles, color: "bg-primary/20 text-primary" },
  features: [
    "Tudo do plano Gratuito",
    "IA Teológica ilimitada",
    "Podcasts integrados",
    "Modo Professor completo",
    "Planos de leitura avançados",
    "Áudio narrado da Bíblia",
    "Modo offline ilimitado",
    "Temas personalizados",
    "Exportação de notas em PDF",
    "Suporte prioritário",
  ],
  cta: "Assinar Agora",
  highlighted: true,
};

const lifetimePlan = {
  id: "lifetime",
  name: "Vitalício",
  price: "R$ 299",
  period: "/pagamento único",
  description: "Acesso premium para sempre, sem mensalidades",
  badge: { text: "Melhor Custo-Benefício", icon: Crown, color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500" },
  features: [
    "Tudo do plano Premium",
    "Acesso vitalício",
    "Sem mensalidades",
    "Atualizações gratuitas",
    "Novos recursos inclusos",
    "Badge exclusivo",
    "Comunidade VIP",
    "Influencie desenvolvimento",
  ],
  cta: "Comprar Acesso Vitalício",
  highlighted: false,
};

const plans = [freePlan, premiumPlan, lifetimePlan];

const faqs = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura premium a qualquer momento, sem taxas ou burocracia. O acesso premium continuará até o fim do período pago."
  },
  {
    question: "O que acontece se eu cancelar?",
    answer: "Você mantém acesso a todos os recursos gratuitos. Seus dados (notas, destaques, orações) são preservados e estarão disponíveis se você reativar o premium."
  },
  {
    question: "Vocês oferecem desconto para estudantes ou pastores?",
    answer: "Sim! Oferecemos 50% de desconto para estudantes de teologia, pastores e líderes religiosos. Entre em contato conosco com comprovação."
  },
  {
    question: "Qual forma de pagamento vocês aceitam?",
    answer: "Aceitamos cartão de crédito, PIX e boleto bancário através do Stripe, a plataforma de pagamento mais segura do mundo."
  },
  {
    question: "Posso usar em múltiplos dispositivos?",
    answer: "Sim! Sua conta funciona em todos os seus dispositivos simultaneamente, com sincronização automática na nuvem."
  },
  {
    question: "O que é a garantia de 30 dias?",
    answer: "Se você não ficar satisfeito com o Premium nos primeiros 30 dias, devolvemos 100% do seu dinheiro, sem perguntas."
  },
];

export default function Pricing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-4">
            <Badge className="px-4 py-2 bg-primary/10 text-primary border-primary/20" data-testid="badge-pricing">
              <Zap className="h-4 w-4 mr-2" />
              Planos para todos
            </Badge>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold max-w-4xl mx-auto" data-testid="text-pricing-title">
            Escolha o plano ideal para sua jornada espiritual
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Comece gratuitamente e evolua quando estiver pronto. Todos os planos incluem o essencial para transformar seu estudo bíblico.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={plan.id}
                className={`relative hover-elevate transition-all duration-300 flex flex-col ${
                  plan.highlighted 
                    ? 'border-primary shadow-lg scale-100 md:scale-105 z-10' 
                    : ''
                }`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <Badge className={`px-4 py-1 ${plan.badge.color}`}>
                      <plan.badge.icon className="h-3 w-3 mr-1" />
                      {plan.badge.text}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="min-h-12">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl md:text-5xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3" data-testid={`feature-${plan.id}-${i}`}>
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm flex-1 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.highlighted 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'variant-outline'
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    size="lg"
                    data-testid={`button-cta-${plan.id}`}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary fill-primary" />
                </div>
              </div>
              
              <h2 className="font-display text-3xl font-bold mb-4">
                Garantia de 30 Dias
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Experimente o BíbliaFS Premium sem riscos. Se não ficar completamente satisfeito nos primeiros 30 dias, devolvemos 100% do seu investimento. Simples assim.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Sem perguntas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Reembolso total</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Cancelamento fácil</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Tudo que você precisa saber sobre nossos planos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} data-testid={`card-faq-${index}`}>
                <CardHeader>
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Ainda tem dúvidas?
            </p>
            <Link href="/contact">
              <Button variant="outline" data-testid="button-contact-support">
                Fale Conosco
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 md:py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Pronto para transformar seu estudo bíblico?
          </h2>
          
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já estão crescendo espiritualmente com o BíbliaFS
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
              data-testid="button-cta-final-free"
            >
              Começar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
              data-testid="button-cta-final-premium"
            >
              Ver Planos Premium
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
