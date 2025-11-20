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
import { Heart, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { insertDonationSchema } from "@shared/schema";

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

export default function Donate() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

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

  const createDonationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/donations", data);
      return res.json();
    },
  });

  const handleDonate = async (data: DonationForm) => {
    try {
      setIsProcessing(true);

      const amount = selectedAmount === -1 && customAmountStr 
        ? parseFloat(customAmountStr) 
        : selectedAmount || data.amount;

      if (!amount || amount < 1) {
        toast({
          title: t.donate.error_title,
          description: t.donate.error_title,
          variant: "destructive",
        });
        return;
      }

      // NOTE: Full Stripe integration requires configuring STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY
      // This is a simplified flow. In production, you would:
      // 1. Create PaymentIntent on backend (done via /api/create-payment-intent)
      // 2. Use Stripe Elements or redirect to Stripe Checkout with the clientSecret
      // 3. Confirm the payment client-side using stripe.confirmPayment()
      // 4. Handle webhook on backend at /api/stripe/webhook to update donation status
      // 5. For recurring: create Subscription instead of PaymentIntent
      
      const { clientSecret, error } = await createPaymentIntentMutation.mutateAsync({
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

      // TEMPORARY: Simulate successful payment for demo purposes
      // TODO: Replace with actual Stripe confirmation flow
      await createDonationMutation.mutateAsync({
        amount: Math.round(amount * 100),
        currency: data.currency,
        type: data.type,
        frequency: data.type === "recurring" ? "monthly" : undefined,
        destination: data.destination,
        isAnonymous: data.isAnonymous,
        message: data.message,
        status: "pending", // Will be updated to "succeeded" via webhook
      });

      setDonationSuccess(true);
      toast({
        title: t.donate.success_title,
        description: t.donate.success_message,
      });
    } catch (error: any) {
      console.error("Donation error:", error);
      
      if (error.message && error.message.includes("not configured")) {
        toast({
          title: t.donate.error_title,
          description: t.donate.configure_stripe,
          variant: "destructive",
        });
      } else {
        toast({
          title: t.donate.error_title,
          description: error.message || "Erro desconhecido",
          variant: "destructive",
        });
      }
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
          <h1 className="text-2xl md:text-3xl font-bold">Sua doação mantém o Bíblia+ 100% gratuito e ajuda a levar a Palavra a mais pessoas, em mais idiomas.</h1>
          <div className="text-muted-foreground text-base space-y-3 max-w-2xl mx-auto">
            <p>
              Sua contribuição faz toda a diferença! Com ela, conseguimos manter o aplicativo totalmente gratuito, desenvolver novos recursos e alcançar ainda mais pessoas com a Palavra de Deus.
            </p>
            <p className="font-medium">
              🔒 <strong>Doação 100% segura:</strong> Utilizamos o Stripe, a plataforma de pagamento mais confiável do mundo, com criptografia de ponta a ponta. Seus dados estão protegidos e nunca são compartilhados.
            </p>
            <p className="font-semibold text-foreground">
              Faça parte dessa missão. Doe agora e transforme vidas através da Palavra!
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleDonate)} className="space-y-6">
          <Card data-testid="card-donation-form">
            <CardHeader>
              <CardTitle>{t.donate.amount}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Donation Type */}
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

              {/* Amount Selection */}
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
                
                {/* Custom Amount */}
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

              {/* Destination */}
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

              {/* Anonymous Option */}
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

              {/* Message */}
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing}
                data-testid="button-submit-donation"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.donate.processing}
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4 fill-current" />
                    {t.donate.donate_button}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Info Section */}
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
