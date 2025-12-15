import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Heart, ExternalLink } from "lucide-react";
import { SiPaypal } from "react-icons/si";

const PRESET_AMOUNTS = [10, 25, 50, 100];

const donationFormSchema = z.object({
  amount: z.number().min(1, "Valor mínimo é R$ 1"),
  customAmount: z.string().optional(),
  type: z.enum(["one_time", "recurring"]),
  destination: z.enum(["app_operations", "bible_translation"]),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
});

type DonationForm = z.infer<typeof donationFormSchema>;

export default function DonatePage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: 25,
      type: "one_time",
      destination: "app_operations",
      isAnonymous: false,
    },
  });

  const donationType = form.watch("type");
  const customAmountStr = form.watch("customAmount");

  const handlePayPalDonation = () => {
    const amount = selectedAmount === -1 && customAmountStr 
      ? parseFloat(customAmountStr) 
      : selectedAmount || 25;

    if (!amount || amount < 1) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um valor válido",
        variant: "destructive",
      });
      return;
    }

    window.open("https://www.paypal.com/donate?hosted_button_id=AR4ZV6HSH9V6C", "_blank");
  };

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

        <div className="space-y-6">
          <Card data-testid="card-donation-form">
            <CardHeader>
              <CardTitle>{t.donate.amount}</CardTitle>
              <CardDescription>
                Escolha um valor sugerido ou digite um valor personalizado
              </CardDescription>
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
                <Label>Valores sugeridos</Label>
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

          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <SiPaypal className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Doar via PayPal</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Você será redirecionado para o PayPal para concluir sua doação de forma segura
                  </p>
                </div>
                
                <Button
                  onClick={handlePayPalDonation}
                  className="w-full h-14 text-lg bg-[#0070ba] hover:bg-[#005ea6]"
                  data-testid="button-donate-paypal"
                >
                  <SiPaypal className="mr-2 h-5 w-5" />
                  Doar com PayPal
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-muted-foreground">
                  🔒 Pagamento seguro processado pelo PayPal. Você pode definir o valor exato na página do PayPal.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Sobre as doações:</strong> 100% das doações são utilizadas para manter e melhorar o aplicativo BíbliaFS, 
              incluindo custos de servidor, desenvolvimento de novas funcionalidades e tradução bíblica.
            </p>
            <p>
              Que Deus abençoe sua generosidade! 🙏
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
