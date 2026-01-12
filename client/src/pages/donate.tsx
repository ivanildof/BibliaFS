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
import { Heart, Loader2, CheckCircle2, CreditCard, QrCode, AlertCircle } from "lucide-react";

const PRESET_AMOUNTS = [10, 25, 50, 100];

const donationFormSchema = z.object({
  amount: z.number().min(5, "Valor mínimo é R$ 5").max(1000, "Valor máximo é R$ 1000"),
  customAmount: z.string().optional(),
  type: z.enum(["one_time", "recurring"]),
  frequency: z.enum(["monthly"]).optional(),
  destination: z.enum(["app_operations", "bible_translation"]),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
  currency: z.string().default("brl"),
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

      if (!amount || amount < 5) {
        toast({
          title: "Erro",
          description: "Valor mínimo para doação é R$ 5",
          variant: "destructive",
        });
        return;
      }

      if (amount > 1000) {
        toast({
          title: "Erro",
          description: "Valor máximo para doação é R$ 1000",
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
        <Card className="max-w-md w-full">
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary fill-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">{t.donate.title}</h1>
          <div className="text-muted-foreground text-base space-y-3 max-w-2xl mx-auto">
            <p className="font-medium">
              Sua doação é 100% segura. Utilizamos o Stripe, a plataforma de pagamento mais confiável do mundo.
            </p>
            <p className="font-semibold text-foreground">
              Faça parte dessa missão. Doe agora e transforme vidas através da Palavra!
            </p>
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex gap-2">
                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                <QrCode className="h-5 w-5 text-primary mt-0.5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Formas de pagamento aceitas</p>
                <p className="text-sm text-muted-foreground">
                  <strong>PIX</strong> (pagamento instantâneo) ou <strong>Cartão de Crédito/Débito</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PIX disponível apenas para doações únicas. Doações recorrentes usam cartão.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card data-testid="card-donation-form">
            <CardHeader>
              <CardTitle>{t.donate.amount}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t.donate.one_time} / {t.donate.recurring}</Label>
                <RadioGroup
                  value={donationType}
                  onValueChange={(value) => form.setValue("type", value as "one_time" | "recurring")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one_time" id="one_time" data-testid="radio-onetime" />
                    <Label htmlFor="one_time" className="font-normal cursor-pointer">
                      {t.donate.one_time} (PIX ou Cartão)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id="recurring" data-testid="radio-recurring" />
                    <Label htmlFor="recurring" className="font-normal cursor-pointer">
                      {t.donate.monthly} (Cartão)
                    </Label>
                  </div>
                </RadioGroup>
                
                {donationType === "recurring" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>Doações recorrentes são cobradas mensalmente via cartão de crédito.</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Escolha um valor</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      className="h-16"
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
                        placeholder="Digite o valor (R$ 5 - R$ 1000)"
                        min="5"
                        max="1000"
                        step="0.01"
                        {...form.register("customAmount")}
                        data-testid="input-custom-amount"
                      />
                      <p className="text-xs text-muted-foreground">
                        Valor mínimo: R$ 5 | Valor máximo: R$ 1000
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
                    Preparando pagamento...
                  </>
                ) : (
                  <>
                    {donationType === "one_time" ? (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        Doar com PIX ou Cartão
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Doar com Cartão
                      </>
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>

        <Card>
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
            <p className="text-xs">
              Processado com segurança através do Stripe. Suas informações de pagamento são protegidas com criptografia de ponta a ponta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
