import { useState } from "react";
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
import { Heart, Loader2, CheckCircle2, CreditCard, ArrowLeft } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

const PRESET_AMOUNTS = [10, 25, 50, 100];

const donationFormSchema = z.object({
  amount: z.number().min(1, "Valor mínimo é R$ 1"),
  customAmount: z.string().optional(),
  type: z.enum(["one_time", "recurring"]),
  frequency: z.enum(["monthly"]).optional(),
  destination: z.enum(["app_operations", "bible_translation"]),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
  currency: z.string().default("brl"),
});

type DonationForm = z.infer<typeof donationFormSchema>;

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  formData: DonationForm;
  onSuccess: () => void;
  onBack: () => void;
}

function PaymentForm({ clientSecret, amount, formData, onSuccess, onBack }: PaymentFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const createDonationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/donations", data);
      return res.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      });

      if (error) {
        toast({
          title: "Erro no pagamento",
          description: error.message || "Falha ao processar pagamento",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await createDonationMutation.mutateAsync({
          amount: Math.round(amount * 100),
          currency: formData.currency,
          type: formData.type,
          frequency: formData.type === "recurring" ? "monthly" : undefined,
          destination: formData.destination,
          isAnonymous: formData.isAnonymous,
          message: formData.message,
          stripePaymentIntentId: paymentIntent.id,
          status: "completed",
        });

        toast({
          title: t.donate.success_title,
          description: t.donate.success_message,
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar doação",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const elementStyle = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-lg mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
          data-testid="button-back-to-form"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card data-testid="card-payment-form">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle>Dados do Cartão</CardTitle>
            <CardDescription>
              Doação de <strong>R$ {amount.toFixed(2)}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Número do Cartão</Label>
                  <div className="p-3 border rounded-md bg-background" data-testid="input-card-number">
                    <CardNumberElement options={elementStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validade</Label>
                    <div className="p-3 border rounded-md bg-background" data-testid="input-card-expiry">
                      <CardExpiryElement options={elementStyle} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <div className="p-3 border rounded-md bg-background" data-testid="input-card-cvc">
                      <CardCvcElement options={elementStyle} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Seus dados são protegidos com criptografia de ponta a ponta
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Valor:</span>
                  <span className="font-medium">R$ {amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tipo:</span>
                  <span>{formData.type === "one_time" ? "Única" : "Mensal"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Destino:</span>
                  <span>{formData.destination === "app_operations" ? "Operações do App" : "Tradução Bíblica"}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!stripe || isProcessing}
                data-testid="button-confirm-payment"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando pagamento...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4 fill-current" />
                    Confirmar Doação de R$ {amount.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                🔒 Pagamento seguro processado pelo Stripe
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DonationFormContent() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "payment">("form");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState<number>(0);

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

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string }) => {
      const res = await apiRequest("POST", "/api/create-payment-intent", data);
      return res.json();
    },
  });

  const handleProceedToPayment = async (data: DonationForm) => {
    try {
      setIsProcessing(true);

      const amount = selectedAmount === -1 && customAmountStr 
        ? parseFloat(customAmountStr) 
        : selectedAmount || data.amount;

      if (!amount || amount < 1) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um valor válido",
          variant: "destructive",
        });
        return;
      }

      const { clientSecret: secret, error } = await createPaymentIntentMutation.mutateAsync({
        amount: Math.round(amount * 100),
        currency: data.currency,
      });

      if (error) {
        toast({
          title: t.donate.error_title,
          description: error,
          variant: "destructive",
        });
        return;
      }

      setClientSecret(secret);
      setFinalAmount(amount);
      setPaymentStep("payment");
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
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
              onClick={() => {
                setDonationSuccess(false);
                setPaymentStep("form");
                setClientSecret(null);
              }} 
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

  if (paymentStep === "payment" && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm
          clientSecret={clientSecret}
          amount={finalAmount}
          formData={form.getValues()}
          onSuccess={() => setDonationSuccess(true)}
          onBack={() => {
            setPaymentStep("form");
            setClientSecret(null);
          }}
        />
      </Elements>
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
              🔒 <strong>Doação 100% segura:</strong> Utilizamos o Stripe, a plataforma de pagamento mais confiável do mundo, com criptografia de ponta a ponta. Seus dados estão protegidos e nunca são compartilhados.
            </p>
            <p className="font-semibold text-foreground">
              Faça parte dessa missão. Doe agora e transforme vidas através da Palavra!
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleProceedToPayment)} className="space-y-6">
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
                    <Input
                      type="number"
                      placeholder="Digite o valor"
                      min="1"
                      step="0.01"
                      {...form.register("customAmount")}
                      data-testid="input-custom-amount"
                    />
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
                    <CreditCard className="mr-2 h-4 w-4" />
                    Continuar para Pagamento
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
              Processado com segurança através do Stripe. Suas informações de pagamento são protegidas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Donate() {
  return <DonationFormContent />;
}
