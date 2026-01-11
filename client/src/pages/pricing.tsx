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
import { motion } from "framer-motion";

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
    priceId: "price_1SeNkrLxcUHgdisLFHU2eKzg",
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
    priceId: "price_1SeNlfLxcUHgdisLeMyIChFe",
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
    priceId: "price_1SeNmJLxcUHgdisLkccnbgRz",
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
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/5 to-amber-50/5 dark:from-background dark:via-purple-950/10 dark:to-amber-950/10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[150px]" />
      
      {/* Header */}
      <div className="relative z-10 p-4 md:p-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-2xl" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Hero */}
      <section className="relative z-10 px-4 pb-8 md:pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Planos Premium</p>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold mb-4 tracking-tight" data-testid="text-page-title">
            Escolha seu Plano
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            Transforme seu estudo bíblico com recursos premium
          </p>
          
          {isPremium && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="mt-6 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 px-4 py-2 rounded-full text-sm font-bold">
                <Crown className="h-4 w-4 mr-2" />
                Assinante {currentPlan === 'monthly' ? 'Mensal' : currentPlan === 'yearly' ? 'Anual' : 'Premium Plus'}
              </Badge>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Plans Grid */}
      <section className="relative z-10 px-4 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {plans.filter(plan => plan.id !== 'free').map((plan, index) => {
              const buttonConfig = getButtonConfig(plan);
              const isCurrentPlan = plan.id === currentPlan;
              const IconComponent = plan.icon;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                <Card 
                  className={`relative flex flex-col transition-all duration-500 rounded-3xl border-none backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 ${
                    plan.popular ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-xl ring-2 ring-primary/30' : 'bg-card/80 shadow-lg'
                  } ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  <CardHeader className="pb-4 space-y-4 pt-8">
                    {/* Icon and Popular Badge Row */}
                    <div className="flex items-center justify-between">
                      <div className={`h-14 w-14 rounded-2xl ${plan.iconBg} flex items-center justify-center shadow-lg`}>
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      {plan.popular && (
                        <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-bold shadow-lg shadow-primary/30">
                          Popular
                        </Badge>
                      )}
                      {isCurrentPlan && !plan.popular && (
                        <Badge variant="outline" className="text-sm px-3 py-1 rounded-full font-bold border-green-500 text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Atual
                        </Badge>
                      )}
                    </div>
                    
                    <div>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-base mt-2 font-medium">
                        {plan.description}
                      </CardDescription>
                    </div>
                    
                    {/* Price */}
                    <div className="pt-3">
                      <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                      <span className="text-muted-foreground text-base ml-2 font-medium">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pb-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-base" data-testid={`feature-${plan.id}-${i}`}>
                          <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pb-8">
                    <Button 
                      className={`w-full h-14 rounded-2xl font-bold text-lg shadow-lg transition-all ${plan.popular ? 'shadow-primary/30 hover:shadow-primary/40' : ''}`}
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative z-10 px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-5 py-3 rounded-2xl border border-border/50 shadow-sm">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-5 py-3 rounded-2xl border border-border/50 shadow-sm">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-5 py-3 rounded-2xl border border-border/50 shadow-sm">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">Garantia de 30 dias</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="font-display text-3xl font-bold text-center mb-8">
            Perguntas Frequentes
          </h2>
          
          <Accordion type="single" collapsible className="w-full bg-card/60 backdrop-blur-sm rounded-3xl border border-border/50 shadow-lg overflow-hidden">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-border/30 last:border-b-0 px-6">
                <AccordionTrigger className="text-left py-5 text-base font-medium hover:no-underline" data-testid={`faq-question-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-muted-foreground mb-6 text-lg font-medium">
            Dúvidas? Estamos aqui para ajudar
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="rounded-2xl px-8 h-12 font-bold" data-testid="button-contact">
              Fale Conosco
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
