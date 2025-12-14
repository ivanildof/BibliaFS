import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowLeft,
  Loader2,
  Settings,
  Star,
  Shield
} from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SubscriptionStatus {
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  aiRequestsToday: number;
  aiRequestsResetAt: string | null;
}

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    description: "Comece sua jornada bíblica",
    icon: Star,
    iconBg: "bg-slate-500",
    features: [
      "Bíblia completa (4 versões)",
      "Versículo do Dia",
      "Destaques coloridos",
      "Notas e anotações",
      "Diário de orações",
      "3 perguntas IA/dia",
    ],
    cta: "Plano Atual",
    popular: false,
    priceId: null,
    planType: "free",
  },
  {
    id: "monthly",
    name: "Mensal",
    price: "R$ 19,90",
    period: "por mês",
    description: "Acesso premium completo",
    icon: Sparkles,
    iconBg: "bg-primary",
    features: [
      "Tudo do Gratuito",
      "IA Teológica: ~500 perguntas/mês",
      "Podcasts integrados",
      "Modo Professor",
      "Áudio narrado",
      "Temas personalizados",
      "Suporte prioritário",
    ],
    cta: "Assinar",
    popular: true,
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || null,
    planType: "monthly",
  },
  {
    id: "yearly",
    name: "Anual",
    price: "R$ 149,90",
    period: "por ano",
    description: "Economize 37%",
    icon: Crown,
    iconBg: "bg-amber-500",
    features: [
      "Tudo do Mensal",
      "IA Teológica: ~3.750 perguntas/ano",
      "Economia de R$ 89/ano",
      "Badge exclusivo",
      "Comunidade VIP",
      "Influencie recursos",
    ],
    cta: "Assinar",
    popular: false,
    priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || null,
    planType: "yearly",
  },
  {
    id: "premium_plus",
    name: "Premium Plus",
    price: "R$ 289",
    period: "por ano",
    description: "Máximo poder de IA",
    icon: Zap,
    iconBg: "bg-purple-600",
    features: [
      "Tudo do Anual",
      "IA Teológica: ~7.200 perguntas/ano",
      "Dobro do limite comparado ao Anual",
      "Acesso antecipado a recursos",
      "Suporte VIP 24h",
    ],
    cta: "Assinar",
    popular: false,
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PLUS_PRICE_ID || null,
    planType: "premium_plus",
  },
];

const faqs = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Cancele quando quiser, sem taxas. O acesso continua até o fim do período pago."
  },
  {
    question: "Quais formas de pagamento?",
    answer: "Cartão de crédito, PIX e boleto via Stripe - a plataforma mais segura do mundo."
  },
  {
    question: "Funciona em vários dispositivos?",
    answer: "Sim! Use em todos os seus dispositivos com sincronização automática."
  },
  {
    question: "Tem desconto para pastores?",
    answer: "Sim! 50% de desconto para estudantes de teologia, pastores e líderes. Entre em contato."
  },
];

export default function Pricing() {
  const { toast } = useToast();
  const [location] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({
        title: "Pagamento confirmado!",
        description: "Sua assinatura foi ativada. Aproveite o Premium!",
      });
      window.history.replaceState({}, '', '/planos');
    } else if (params.get('canceled') === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/planos');
    }
  }, [location, toast]);

  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscriptions/status'],
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ priceId, planType }: { priceId: string; planType: string }) => {
      const response = await apiRequest("POST", '/api/subscriptions/checkout', { priceId, planType });
      return response.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      const errorMsg = error.message || "Erro ao processar pagamento";
      toast({
        title: "Erro no pagamento",
        description: errorMsg.includes("No such price") 
          ? "Plano não configurado. Entre em contato conosco."
          : errorMsg,
        variant: "destructive",
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", '/api/subscriptions/portal');
      return response.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (plan: typeof plans[0]) => {
    if (plan.id === 'free') return;
    
    if (!plan.priceId) {
      toast({
        title: "Em breve",
        description: "Sistema de pagamentos em configuração. Tente novamente em breve.",
        variant: "destructive",
      });
      return;
    }

    checkoutMutation.mutate({ priceId: plan.priceId, planType: plan.planType });
  };

  const currentPlan = subscription?.plan || 'free';
  const isPremium = currentPlan !== 'free';

  const getButtonConfig = (plan: typeof plans[0]) => {
    const isCurrentPlan = plan.id === currentPlan;
    
    if (isCurrentPlan && isPremium) {
      return { text: "Gerenciar", disabled: false, isPortal: true };
    }
    if (plan.id === 'free' && currentPlan === 'free') {
      return { text: "Plano Atual", disabled: true, isPortal: false };
    }
    if (plan.id === 'free' && isPremium) {
      return { text: "Gerenciar", disabled: false, isPortal: true };
    }
    if (isPremium && plan.id !== currentPlan) {
      return { text: "Mudar Plano", disabled: false, isPortal: true };
    }
    return { text: plan.cta, disabled: false, isPortal: false };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 md:p-6">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Hero */}
      <section className="px-4 pb-8 md:pb-12 text-center">
        <h1 className="font-display text-3xl md:text-5xl font-bold mb-4" data-testid="text-page-title">
          Escolha seu Plano
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Transforme seu estudo bíblico com recursos premium
        </p>
        
        {isPremium && (
          <Badge className="mt-4 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
            <Crown className="h-3 w-3 mr-1" />
            Assinante {currentPlan === 'monthly' ? 'Mensal' : currentPlan === 'yearly' ? 'Anual' : 'Premium Plus'}
          </Badge>
        )}
      </section>

      {/* Plans Grid */}
      <section className="px-4 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {plans.map((plan) => {
              const buttonConfig = getButtonConfig(plan);
              const isCurrentPlan = plan.id === currentPlan;
              const IconComponent = plan.icon;
              
              return (
                <Card 
                  key={plan.id}
                  className={`relative flex flex-col transition-all duration-200 ${
                    plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
                  } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  <CardHeader className="pb-2 space-y-3">
                    {/* Icon and Popular Badge Row */}
                    <div className="flex items-center justify-between">
                      <div className={`h-10 w-10 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      {plan.popular && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Popular
                        </Badge>
                      )}
                      {isCurrentPlan && !plan.popular && (
                        <Badge variant="outline" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Atual
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {plan.description}
                      </CardDescription>
                    </div>
                    
                    {/* Price */}
                    <div className="pt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm ml-1">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pb-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" data-testid={`feature-${plan.id}-${i}`}>
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      disabled={buttonConfig.disabled || checkoutMutation.isPending || portalMutation.isPending}
                      onClick={() => {
                        if (buttonConfig.isPortal) {
                          portalMutation.mutate();
                        } else {
                          handleSubscribe(plan);
                        }
                      }}
                      data-testid={`button-cta-${plan.id}`}
                    >
                      {(checkoutMutation.isPending || portalMutation.isPending) && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {buttonConfig.text}
                      {buttonConfig.isPortal && <Settings className="h-4 w-4 ml-2" />}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm">Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="text-sm">Garantia de 30 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-6">
            Perguntas Frequentes
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground mb-4">
            Dúvidas? Entre em contato conosco
          </p>
          <Link href="/contact">
            <Button variant="outline" data-testid="button-contact">
              Fale Conosco
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
