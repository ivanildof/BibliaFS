import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Check,
  Sparkles,
  Zap,
  Crown,
  Heart,
  ArrowRight,
  Loader2,
  Settings,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

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
      "3 perguntas IA por dia",
    ],
    cta: "Plano Atual",
    highlighted: false,
    priceId: null,
    planType: "free",
  },
  {
    id: "monthly",
    name: "Mensal",
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
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || null,
    planType: "monthly",
  },
  {
    id: "yearly",
    name: "Anual",
    price: "R$ 149,90",
    period: "/ano",
    description: "Economize 37% com o plano anual",
    badge: { text: "Melhor Custo-Benefício", icon: Crown, color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500" },
    features: [
      "Tudo do plano Mensal",
      "Economia de 37%",
      "Acesso por 12 meses",
      "Atualizações gratuitas",
      "Badge exclusivo",
      "Comunidade VIP",
      "Suporte prioritário",
      "Influencie desenvolvimento",
    ],
    cta: "Assinar Anual",
    highlighted: false,
    priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || null,
    planType: "yearly",
  },
];

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
  const { toast } = useToast();
  const [location] = useLocation();

  // Check URL params for payment result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({
        title: "Pagamento confirmado!",
        description: "Sua assinatura foi ativada com sucesso. Aproveite todos os recursos premium!",
      });
      window.history.replaceState({}, '', '/pricing');
    } else if (params.get('canceled') === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento. Pode tentar novamente quando quiser.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/pricing');
    }
  }, [location, toast]);

  // Fetch subscription status
  const { data: subscription, isLoading: isLoadingStatus } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscriptions/status'],
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async ({ priceId, planType }: { priceId: string; planType: string }) => {
      const response = await apiRequest('/api/subscriptions/checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId, planType }),
      });
      return response;
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Portal mutation (manage subscription)
  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/subscriptions/portal', {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao acessar portal",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (plan: typeof plans[0]) => {
    if (plan.id === 'free') return;
    
    if (!plan.priceId) {
      toast({
        title: "Configuração pendente",
        description: "O sistema de pagamentos ainda não foi configurado. Configure as variáveis STRIPE_SECRET_KEY e VITE_STRIPE_MONTHLY_PRICE_ID/VITE_STRIPE_YEARLY_PRICE_ID.",
        variant: "destructive",
      });
      return;
    }

    checkoutMutation.mutate({ priceId: plan.priceId, planType: plan.planType });
  };

  const currentPlan = subscription?.plan || 'free';
  const isPremium = currentPlan === 'monthly' || currentPlan === 'yearly';

  const getButtonState = (plan: typeof plans[0]) => {
    // Current premium plan - show manage button
    if (plan.id === currentPlan && isPremium) {
      return { text: "Gerenciar Assinatura", disabled: false, variant: "default" as const, isPortal: true };
    }
    // Current free plan - just show as current
    if (plan.id === 'free' && currentPlan === 'free') {
      return { text: "Plano Atual", disabled: true, variant: "outline" as const };
    }
    // Free plan card when user is premium - allow downgrade via portal
    if (plan.id === 'free' && isPremium) {
      return { text: "Gerenciar Assinatura", disabled: false, variant: "outline" as const, isPortal: true };
    }
    // Other premium plans for free users
    if (!isPremium && plan.id !== 'free') {
      return { text: plan.cta, disabled: false, variant: plan.highlighted ? "default" as const : "outline" as const };
    }
    // Premium user looking at other premium plan - upgrade/change via portal
    if (isPremium && plan.id !== currentPlan) {
      return { text: "Mudar Plano", disabled: false, variant: "outline" as const, isPortal: true };
    }
    return { text: plan.cta, disabled: false, variant: plan.highlighted ? "default" as const : "outline" as const };
  };

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

          {/* Current subscription status */}
          {isPremium && (
            <div className="flex justify-center">
              <Badge className="px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20">
                <Crown className="h-4 w-4 mr-2" />
                Você é assinante {currentPlan === 'yearly' ? 'Anual' : 'Mensal'}
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => {
              const buttonState = getButtonState(plan);
              const isCurrentPlan = plan.id === currentPlan || (plan.id === 'free' && currentPlan === 'free');
              
              return (
                <Card 
                  key={plan.id}
                  className={`relative hover-elevate transition-all duration-300 flex flex-col ${
                    plan.highlighted 
                      ? 'border-primary shadow-lg scale-100 md:scale-105 z-10' 
                      : ''
                  } ${isCurrentPlan ? 'ring-2 ring-primary/50' : ''}`}
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

                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-4 z-20">
                      <Badge className="px-3 py-1 bg-green-500 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Atual
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

                  <CardFooter className="flex flex-col gap-2">
                    <Button 
                      className="w-full"
                      variant={buttonState.variant}
                      size="lg"
                      disabled={buttonState.disabled || checkoutMutation.isPending}
                      onClick={() => {
                        if (buttonState.isPortal) {
                          portalMutation.mutate();
                        } else {
                          handleSubscribe(plan);
                        }
                      }}
                      data-testid={`button-cta-${plan.id}`}
                    >
                      {(checkoutMutation.isPending || portalMutation.isPending) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {buttonState.text}
                      {!buttonState.disabled && !buttonState.isPortal && (
                        <ArrowRight className="h-4 w-4 ml-2" />
                      )}
                      {buttonState.isPortal && (
                        <Settings className="h-4 w-4 ml-2" />
                      )}
                    </Button>

                    {/* Manage subscription button for premium users */}
                    {isPremium && plan.id !== 'free' && plan.id === currentPlan && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={() => portalMutation.mutate()}
                        disabled={portalMutation.isPending}
                        data-testid={`button-manage-${plan.id}`}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar assinatura
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* AI Usage indicator for free plan */}
          {currentPlan === 'free' && subscription && (
            <div className="mt-8 max-w-md mx-auto">
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      Perguntas IA hoje: {subscription.aiRequestsToday}/3
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assine Premium para perguntas ilimitadas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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
            {!isPremium ? (
              <>
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8"
                  onClick={() => handleSubscribe(plans[1])}
                  disabled={checkoutMutation.isPending}
                  data-testid="button-cta-final-monthly"
                >
                  {checkoutMutation.isPending && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                  Assinar Mensal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
                  onClick={() => handleSubscribe(plans[2])}
                  disabled={checkoutMutation.isPending}
                  data-testid="button-cta-final-yearly"
                >
                  Economize 37% - Anual
                </Button>
              </>
            ) : (
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                data-testid="button-cta-final-manage"
              >
                {portalMutation.isPending && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                <Settings className="mr-2 h-5 w-5" />
                Gerenciar Minha Assinatura
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
