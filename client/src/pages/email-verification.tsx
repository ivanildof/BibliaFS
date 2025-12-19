import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, RefreshCw, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

interface EmailVerificationProps {
  email?: string;
}

export default function EmailVerification(props: EmailVerificationProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState(props.email || "");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(email);

  // Load email from sessionStorage on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verificationEmail");
    if (storedEmail && !email) {
      setEmail(storedEmail);
      setNewEmail(storedEmail);
    }
  }, [email]);

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

  // Verifica código OTP via backend
  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (code.length !== 6) {
        throw new Error("Digite um código de 6 dígitos");
      }

      const response = await apiRequest("POST", "/api/auth/verify-otp", {
        email,
        code,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Código inválido");
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email verificado!",
        description: "Bem-vindo à BíbliaFS! Você já pode fazer login.",
      });
      // Clear session storage
      sessionStorage.removeItem("verificationEmail");
      // Redirect to login
      setTimeout(() => setLocation("/login"), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Código inválido",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
      setCode("");
    },
  });

  // Reenvio de código via backend
  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/resend-otp", { email });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erro ao reenviar código");
      }
      
      // In development, show code in console
      if (data.code) {
        console.log("[DEV] Código OTP:", data.code);
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Código reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
      setTimeLeft(120);
      setCanResend(false);
      setCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Atualizar email e reenviar código
  const updateEmailMutation = useMutation({
    mutationFn: async () => {
      if (!newEmail || newEmail === email) {
        throw new Error("Digite um email diferente");
      }
      
      const response = await apiRequest("POST", "/api/auth/resend-otp", { email: newEmail });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Erro ao enviar código");
      }
      
      // Update stored email
      sessionStorage.setItem("verificationEmail", newEmail);
      setEmail(newEmail);
      setIsEditing(false);
      setCode("");
      
      // In development, show code in console
      if (data.code) {
        console.log("[DEV] Código OTP:", data.code);
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email atualizado!",
        description: "Novo código foi enviado.",
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

  if (isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold">Corrigir E-mail</CardTitle>
            <CardDescription>Digite um novo email para receber o código</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Novo Email</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
                data-testid="input-new-email"
                className="mt-2"
              />
            </div>
          </CardContent>

          <CardFooter className="gap-3 flex-col">
            <Button
              className="w-full"
              onClick={() => updateEmailMutation.mutate()}
              disabled={updateEmailMutation.isPending}
              data-testid="button-confirm-email"
            >
              {updateEmailMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Atualizar Email
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsEditing(false);
                setNewEmail(email);
              }}
              data-testid="button-cancel-email"
            >
              Cancelar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center border border-primary/30">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          <CardTitle className="text-2xl font-bold">Verifique seu Email</CardTitle>

          <CardDescription className="text-base">
            Enviamos um código de 6 dígitos para{" "}
            <span className="font-semibold text-primary break-all">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Código de Verificação</label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setCode(value);
              }}
              placeholder="000000"
              data-testid="input-verification-code"
              className="text-center text-2xl font-bold tracking-widest"
            />
            <p className="text-xs text-muted-foreground text-center">Digite o código de 6 dígitos</p>
          </div>

          <Button
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending || code.length !== 6}
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold"
            data-testid="button-verify-code"
          >
            {verifyMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Verificar Email
          </Button>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => resendMutation.mutate()}
              disabled={!canResend || resendMutation.isPending}
              className="text-primary hover:text-primary/80"
              data-testid="button-resend-code"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              {canResend ? "Não recebeu o código? Reenviar" : `Reenviar em ${formatTime(timeLeft)}`}
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-change-email"
            >
              <Edit2 className="mr-1 h-4 w-4" />
              Corrigir E-Mail
            </Button>
          </div>
        </CardContent>

        <CardFooter className="text-center text-xs text-muted-foreground">
          <p className="w-full">
            Verifique sua caixa de spam se não encontrar o email.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
