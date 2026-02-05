import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2, CheckCircle2, CreditCard, Shield, Lock } from "lucide-react";

const PRESET_AMOUNTS = [10, 25, 50, 100];

const donationFormSchema = z.object({
  amount: z.number().min(1, "Valor mínimo é R$ 1").max(1000000, "Valor máximo é R$ 1.000.000"),
  customAmount: z.string().optional(),
  type: z.enum(["one_time", "recurring"]),
  destination: z.enum(["app_operations", "bible_translation"]),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
  currency: z.string().default("brl"),
}).refine((data) => {
  if (data.customAmount) {
    const val = parseFloat(data.customAmount);
    return val >= 1;
  }
  return true;
}, {
  message: "Valor deve ser pelo menos R$ 1",
  path: ["customAmount"]
});

type DonationForm = z.infer<typeof donationFormSchema>;

export default function Donate() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setDonationSuccess(true);
      toast({
        title: t.donate.success_title,
        description: t.donate.success_message,
      });
      window.history.replaceState({}, '', '/doar');
    } else if (urlParams.get('canceled') === 'true') {
      toast({
        title: "Doação cancelada",
        description: "Você pode tentar novamente quando quiser.",
      });
      window.history.replaceState({}, '', '/doar');
    }
  }, []);

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: 25,
      type: "one_time",
      destination: "app_operations",
      isAnonymous: false,
      currency: "brl",
    },
  });

  const donationType = form.watch("type");
  const customAmountStr = form.watch("customAmount");

  const createCheckoutSessionMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string; type: string; destination: string; isAnonymous: boolean; message?: string }) => {
      const res = await apiRequest("POST", "/api/donations/checkout", data);
      return res.json();
    },
  });

  const handleSubmit = async (data: DonationForm) => {
    try {
      setIsProcessing(true);

      const amount = selectedAmount === -1 && customAmountStr 
        ? parseFloat(customAmountStr) 
        : selectedAmount || data.amount;

      if (!amount || amount < 1) {
        toast({
          title: "Erro",
          description: "Valor mínimo para doação é R$ 1",
          variant: "destructive",
        });
        return;
      }

      const { url, error } = await createCheckoutSessionMutation.mutateAsync({
        amount: Math.round(amount * 100),
        currency: data.currency,
        type: data.type,
        destination: data.destination,
        isAnonymous: data.isAnonymous,
        message: data.message,
      });

      if (error) {
        toast({
          title: t.donate.error_title,
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (url) {
        window.open(url, '_blank');
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        title: t.donate.error_title,
        description: error.message || "Erro ao iniciar pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (donationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="premium-card ring-2 ring-primary/10 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle>{t.donate.success_title}</CardTitle>
            <CardDescription>{t.donate.success_message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setDonationSuccess(false)} 
              className="w-full"
              data-testid="button-donate-another"
            >
              Fazer outra doação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-rose-500/20 via-pink-500/15 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto space-y-8 p-4 sm:p-6 md:p-8">
        <Card className="border-none bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-amber-500/10 shadow-2xl rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-rose-500/20 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-tr-full" />
          <CardContent className="p-8 md:p-10 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-rose-500/40">
                <Heart className="h-10 w-10 text-white fill-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">{t.donate.title}</h1>
            <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
              Faça parte dessa missão. <span className="font-semibold text-foreground">Doe agora</span> e transforme vidas através da Palavra!
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-teal-500/10 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/15 to-transparent rounded-bl-full" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-green-500/30 flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  Pagamento 100% Seguro
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Seus dados de cartão <strong className="text-foreground">nunca passam pelo nosso servidor</strong>. O pagamento é processado diretamente pelo Stripe.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Criptografia SSL/TLS</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>PCI DSS Nível 1</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card data-testid="card-donation-form" className="rounded-[2rem] border-none bg-gradient-to-br from-primary/5 via-card to-purple-500/5 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-md">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                {t.donate.amount}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t.donate.one_time} / {t.donate.recurring}</Label>
                <RadioGroup
                  value={donationType}
                  onValueChange={(value) => form.setValue("type", value as "one_time" | "recurring")}
                  className="flex flex-wrap gap-4 sm:gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one_time" id="one_time" data-testid="radio-onetime" />
                    <Label htmlFor="one_time" className="font-normal cursor-pointer">
                      {t.donate.one_time}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="recurring" data-testid="radio-recurring" />
                    <Label htmlFor="recurring" className="font-normal cursor-pointer">
                      {t.donate.monthly}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Escolha um valor</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(amount);
                        form.setValue("amount", amount);
                      }}
                      data-testid={`button-amount-${amount}`}
                      className="h-12 sm:h-16 text-sm sm:text-base"
                    >
                      R$ {amount}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant={selectedAmount === -1 ? "default" : "outline"}
                    onClick={() => setSelectedAmount(-1)}
                    data-testid="button-custom-amount"
                    className="w-full"
                  >
                    {t.donate.custom_amount}
                  </Button>
                  
                  {selectedAmount === -1 && (
                    <div className="space-y-1">
                      <Input
                        type="number"
                        placeholder="Digite o valor"
                        min="1"
                        step="0.01"
                        {...form.register("customAmount")}
                        data-testid="input-custom-amount"
                      />
                      <p className="text-xs text-muted-foreground">
                        Sua generosidade não tem limites. Escolha o valor que sentir no coração (mínimo R$ 1).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="destination">{t.donate.destination}</Label>
                <Select
                  value={form.watch("destination")}
                  onValueChange={(value) => form.setValue("destination", value as "app_operations" | "bible_translation")}
                >
                  <SelectTrigger data-testid="select-destination">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app_operations" data-testid="option-app-operations">
                      {t.donate.app_operations}
                    </SelectItem>
                    <SelectItem value="bible_translation" data-testid="option-bible-translation">
                      {t.donate.bible_translation}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={form.watch("isAnonymous")}
                  onCheckedChange={(checked) => form.setValue("isAnonymous", checked as boolean)}
                  data-testid="checkbox-anonymous"
                />
                <Label htmlFor="anonymous" className="font-normal cursor-pointer">
                  {t.donate.anonymous}
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t.donate.message}</Label>
                <Textarea
                  id="message"
                  placeholder={t.donate.message_placeholder}
                  {...form.register("message")}
                  data-testid="textarea-message"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing || !selectedAmount}
                data-testid="button-proceed-to-payment"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparando pagamento seguro...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Doar com Cartão
                  </>
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Você será redirecionado para a página segura do Stripe
              </p>
            </CardContent>
          </Card>
        </form>

        <Card className="premium-card ring-2 ring-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Sobre as doações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong>Operações do aplicativo:</strong> Sua doação ajuda a manter os servidores, desenvolvimento de novos recursos e melhorias contínuas.
            </p>
            <p>
              <strong>Tradução bíblica:</strong> Apoia projetos de tradução da Bíblia para idiomas e comunidades que ainda não têm acesso às Escrituras.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
