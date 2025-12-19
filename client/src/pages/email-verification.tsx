import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Book, Loader2, Mail, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";

interface EmailVerificationProps {
  email?: string;
}

export default function EmailVerification(props: EmailVerificationProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState(props.email || "");
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(email);

  // Timer para reenvio
  useEffect(() => {
    if (canResend) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [canResend]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        throw new Error(error.message || "Erro ao reenviar email");
      }
    },
    onSuccess: () => {
      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
      setTimeLeft(120);
      setCanResend(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar",
        description: error.message || "Não foi possível reenviar o email",
        variant: "destructive",
      });
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async () => {
      if (!newEmail || newEmail === email) {
        throw new Error("Digite um email diferente");
      }
      setEmail(newEmail);
      setIsEditing(false);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: newEmail,
      });

      if (error) {
        throw new Error(error.message || "Erro ao enviar para novo email");
      }
    },
    onSuccess: () => {
      toast({
        title: "Email atualizado!",
        description: "Novo email de verificação foi enviado.",
      });
      setTimeLeft(120);
      setCanResend(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifique seu email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o email abaixo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isEditing ? (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Email cadastrado:</p>
              <p className="text-lg font-semibold text-foreground break-all">{email}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Digite um novo email:</p>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
                data-testid="input-new-email"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setNewEmail(email);
                  }}
                  data-testid="button-cancel-email"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => updateEmailMutation.mutate()}
                  disabled={updateEmailMutation.isPending}
                  data-testid="button-confirm-email"
                >
                  {updateEmailMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Atualizar
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                Clique no link no email para confirmar sua conta
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => resendMutation.mutate()}
              disabled={!canResend || resendMutation.isPending}
              className="w-full"
              data-testid="button-resend-email"
            >
              {resendMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {canResend ? "Reenviar email" : `Reenviar em ${formatTime(timeLeft)}`}
            </Button>

            {!isEditing && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(true)}
                data-testid="button-change-email"
              >
                Corrigir email
              </Button>
            )}
          </div>
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">
            Não recebeu? Verifique sua pasta de spam ou tente reenviar.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
