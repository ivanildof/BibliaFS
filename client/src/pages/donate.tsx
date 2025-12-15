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
import { Heart, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { SiPaypal } from "react-icons/si";

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

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalPaymentProps {
  amount: number;
  formData: DonationForm;
  onSuccess: () => void;
  onBack: () => void;
}

function PayPalPayment({ amount, formData, onSuccess, onBack }: PayPalPaymentProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const createDonationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/donations", data);
      return res.json();
    },
  });

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    
    if (!clientId) {
      toast({
        title: "Erro de configuração",
        description: "PayPal não está configurado. Entre em contato com o suporte.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (window.paypal) {
      setPaypalLoaded(true);
      setIsLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=BRL&locale=pt_BR`;
    script.async = true;
    
    script.onload = () => {
      setPaypalLoaded(true);
      setIsLoading(false);
    };
    
    script.onerror = () => {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o PayPal. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [toast]);

  useEffect(() => {
    if (!paypalLoaded || !window.paypal) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;

    container.innerHTML = "";

    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "donate",
      },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toFixed(2),
              currency_code: "BRL",
            },
            description: `Doação BíbliaFS - ${formData.destination === "app_operations" ? "Operações do App" : "Tradução Bíblica"}`,
          }],
          application_context: {
            brand_name: "BíbliaFS",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
          },
        });
      },
      onApprove: async (_data: any, actions: any) => {
        try {
          const order = await actions.order.capture();
          
          await createDonationMutation.mutateAsync({
            amount: Math.round(amount * 100),
            currency: formData.currency,
            type: formData.type,
            frequency: formData.type === "recurring" ? "monthly" : undefined,
            destination: formData.destination,
            isAnonymous: formData.isAnonymous,
            message: formData.message,
            paypalOrderId: order.id,
            status: "completed",
          });

          toast({
            title: t.donate.success_title,
            description: t.donate.success_message,
          });
          onSuccess();
        } catch (error: any) {
          console.error("PayPal capture error:", error);
          toast({
            title: "Erro",
            description: "Erro ao processar doação. Tente novamente.",
            variant: "destructive",
          });
        }
      },
      onError: (err: any) => {
        console.error("PayPal error:", err);
        toast({
          title: "Erro no PayPal",
          description: "Ocorreu um erro. Tente novamente.",
          variant: "destructive",
        });
      },
      onCancel: () => {
        toast({
          title: "Cancelado",
          description: "Doação cancelada.",
        });
      },
    }).render("#paypal-button-container");
  }, [paypalLoaded, amount, formData, onSuccess, toast, t, createDonationMutation]);

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
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <SiPaypal className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle>Doar com PayPal</CardTitle>
            <CardDescription>
              Doação de <strong>R$ {amount.toFixed(2)}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div id="paypal-button-container" className="min-h-[150px]" data-testid="paypal-buttons" />
            )}

            <p className="text-center text-xs text-muted-foreground">
              🔒 Pagamento seguro processado pelo PayPal
            </p>
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
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"form" | "payment">("form");
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

  const handleProceedToPayment = async (data: DonationForm) => {
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

    setFinalAmount(amount);
    setPaymentStep("payment");
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

  if (paymentStep === "payment") {
    return (
      <PayPalPayment
        amount={finalAmount}
        formData={form.getValues()}
        onSuccess={() => setDonationSuccess(true)}
        onBack={() => setPaymentStep("form")}
      />
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
              🔒 <strong>Doação 100% segura:</strong> Utilizamos o PayPal, uma das plataformas de pagamento mais confiáveis do mundo. Seus dados estão protegidos.
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
                  placeholder="Deixe uma mensagem de apoio (opcional)"
                  {...form.register("message")}
                  data-testid="textarea-message"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
            disabled={!selectedAmount || selectedAmount === 0}
            data-testid="button-proceed-to-payment"
          >
            <SiPaypal className="mr-2 h-5 w-5" />
            Continuar com PayPal
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function DonatePage() {
  return <DonationFormContent />;
}
