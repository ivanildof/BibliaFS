import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { initSupabase } from "@/lib/supabase";
import { apiFetch, isNative } from "@/lib/config";
import { APP_URL, GOOGLE_CLIENT_ID } from "@/lib/env-config";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Link } from "wouter";
import logoImage from "../assets/logo-new.png";
import { motion, AnimatePresence } from "framer-motion";

const registerSchema = z.object({
  email: z.string().email("Email invalido"),
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas nao coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

type Step = "register" | "verify" | "success";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<Step>("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiFetch("/api/auth/register-with-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Erro ao criar conta");
      }
      
      if (result.code) {
        console.log("[DEV] Codigo OTP:", result.code);
      }
      
      return result;
    },
    onSuccess: (data) => {
      setRegisteredEmail(data.email);
      setRegisteredUserId(data.userId);
      setStep("verify");
      setResendCooldown(60);
      toast({
        title: "Codigo enviado!",
        description: `Enviamos um codigo de verificacao para ${data.email}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Nao foi possivel criar sua conta",
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, code, userId: registeredUserId }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Codigo invalido");
      }
      
      return result;
    },
    onSuccess: () => {
      setStep("success");
      toast({
        title: "Email verificado!",
        description: "Sua conta foi confirmada com sucesso.",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 2500);
    },
    onError: (error: any) => {
      toast({
        title: "Codigo invalido",
        description: error.message || "Verifique o codigo e tente novamente",
        variant: "destructive",
      });
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Erro ao reenviar codigo");
      }
      
      if (result.code) {
        console.log("[DEV] Novo codigo OTP:", result.code);
      }
      
      return result;
    },
    onSuccess: () => {
      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      toast({
        title: "Codigo reenviado!",
        description: `Novo codigo enviado para ${registeredEmail}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    
    if (value.length > 1) {
      const chars = value.split("").filter(c => /\d/.test(c)).slice(0, 6);
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newDigits[index + i] = char;
        }
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      const fullCode = newDigits.join("");
      if (fullCode.length === 6 && !verifyMutation.isPending) {
        verifyMutation.mutate(fullCode);
      }
      return;
    }
    
    newDigits[index] = value;
    setOtpDigits(newDigits);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    const fullCode = newDigits.join("");
    if (fullCode.length === 6 && !verifyMutation.isPending) {
      verifyMutation.mutate(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-muted/50 dark:bg-muted/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <AnimatePresence mode="wait">
          {step === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md relative z-10"
            >
              <Card className="border-none shadow-2xl rounded-3xl backdrop-blur-sm bg-card/90">
                <CardHeader className="text-center space-y-2 pt-6">
                  <motion.div 
                    initial={{ rotate: -10, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mx-auto"
                  >
                    <img src={logoImage} alt="BibliaFS Logo" className="w-16 h-16 object-cover rounded-2xl shadow-xl" />
                  </motion.div>
                  <CardTitle className="text-2xl font-extrabold tracking-tight">Criar Conta</CardTitle>
                  <CardDescription className="text-sm font-medium">
                    Junte-se a nossa comunidade de estudo biblico
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-xs">Nome</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Joao"
                                  className="h-10 rounded-xl bg-muted/50 border-primary/5 focus-visible:ring-primary font-medium text-sm"
                                  data-testid="input-firstName"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-xs">Sobrenome</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Silva"
                                  className="h-10 rounded-xl bg-muted/50 border-primary/5 focus-visible:ring-primary font-medium text-sm"
                                  data-testid="input-lastName"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-xs">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="seu@email.com"
                                className="h-10 rounded-xl bg-muted/50 border-primary/5 focus-visible:ring-primary font-medium text-sm"
                                data-testid="input-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-xs">Senha</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Minimo 6 caracteres"
                                  className="h-10 rounded-xl bg-muted/50 border-primary/5 focus-visible:ring-primary font-medium pr-10 text-sm"
                                  data-testid="input-password"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={() => setShowPassword(!showPassword)}
                                  data-testid="button-toggle-password"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-xs">Confirmar Senha</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirme sua senha"
                                  className="h-10 rounded-xl bg-muted/50 border-primary/5 focus-visible:ring-primary font-medium pr-10 text-sm"
                                  data-testid="input-confirmPassword"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  data-testid="button-toggle-confirmPassword"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all mt-2"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          "Comecar agora"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 px-8 pb-6 bg-muted/20 rounded-b-3xl border-t border-border/50">
                  <div className="w-full space-y-3 pt-4">
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-muted px-4 text-muted-foreground font-bold tracking-wider">Registrar com Google</span>
                      </div>
                    </div>

                    <div className="flex flex-col pt-1">
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-3 border-border/50 bg-card transition-all shadow-sm hover:bg-muted/50"
                        onClick={async () => {
                          const clientId = GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
                          const google = (window as any).google;
                          if (!clientId || !google?.accounts?.id) {
                            const client = await initSupabase();
                            const redirectUrl = isNative ? "bibliafs://login-callback" : `${APP_URL || window.location.origin}/`;
                            await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl } });
                            return;
                          }
                          google.accounts.id.initialize({
                            client_id: clientId,
                            callback: async (response: any) => {
                              if (!response.credential) return;
                              try {
                                const client = await initSupabase();
                                const { error } = await client.auth.signInWithIdToken({
                                  provider: 'google',
                                  token: response.credential,
                                });
                                if (error) {
                                  console.error("[Register Google] signInWithIdToken error:", error);
                                  const redirectUrl = isNative ? "bibliafs://login-callback" : `${APP_URL || window.location.origin}/`;
                                  await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl } });
                                  return;
                                }
                                await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                                window.location.href = "/";
                              } catch (err) {
                                console.error("[Register Google] Error:", err);
                              }
                            },
                            auto_select: false,
                            cancel_on_tap_outside: true,
                          });
                          google.accounts.id.prompt((notification: any) => {
                            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                              const parent = document.createElement('div');
                              parent.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:white;padding:24px;border-radius:12px;box-shadow:0 25px 50px rgba(0,0,0,0.3)';
                              const overlay = document.createElement('div');
                              overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998';
                              overlay.onclick = () => { overlay.remove(); parent.remove(); };
                              document.body.appendChild(overlay);
                              document.body.appendChild(parent);
                              google.accounts.id.renderButton(parent, { theme: 'outline', size: 'large', text: 'signup_with', width: 300 });
                            }
                          });
                        }}
                        data-testid="button-register-google"
                      >
                        <SiGoogle className="h-5 w-5 text-[#4285F4]" />
                        Criar conta com Google
                      </Button>
                    </div>

                    <Link href="/" className="w-full block">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-10 rounded-xl font-bold text-xs text-muted-foreground transition-all"
                      >
                        Voltar para Landing Page
                      </Button>
                    </Link>
                  </div>

                  <p className="text-xs text-center text-muted-foreground font-medium">
                    Ja tem uma conta?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4" data-testid="link-login">
                      Fazer login
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-md relative z-10"
            >
              <Card className="border-none shadow-2xl rounded-3xl backdrop-blur-sm bg-card/90">
                <CardHeader className="text-center space-y-3 pt-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-2xl font-extrabold tracking-tight">Verifique seu email</CardTitle>
                  <CardDescription className="text-sm font-medium px-4">
                    Enviamos um codigo de 6 digitos para{" "}
                    <span className="font-bold text-foreground">{registeredEmail}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                    <div className="flex justify-center gap-2">
                      {otpDigits.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => { inputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={index === 0 ? 6 : 1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-muted/50 border-primary/10 focus-visible:ring-primary focus-visible:border-primary"
                          data-testid={`input-otp-${index}`}
                          autoFocus={index === 0}
                          disabled={verifyMutation.isPending}
                        />
                      ))}
                    </div>

                    <Button
                      className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all"
                      disabled={verifyMutation.isPending || otpDigits.join("").length !== 6}
                      onClick={() => {
                        const fullCode = otpDigits.join("");
                        if (fullCode.length === 6) {
                          verifyMutation.mutate(fullCode);
                        }
                      }}
                      data-testid="button-verify-otp"
                    >
                      {verifyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Verificar codigo"
                      )}
                    </Button>

                    <div className="text-center space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Nao recebeu o codigo?
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resendMutation.mutate()}
                        disabled={resendCooldown > 0 || resendMutation.isPending}
                        className="font-bold text-sm"
                        data-testid="button-resend-otp"
                      >
                        {resendMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        {resendCooldown > 0 
                          ? `Reenviar em ${resendCooldown}s` 
                          : "Reenviar codigo"}
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full font-bold text-sm text-muted-foreground"
                      onClick={() => {
                        setStep("register");
                        setOtpDigits(["", "", "", "", "", ""]);
                      }}
                      data-testid="button-back-to-register"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar e usar outro email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md relative z-10"
            >
              <Card className="border-none shadow-2xl rounded-3xl backdrop-blur-sm bg-card/90">
                <CardContent className="py-12 px-8 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                  </motion.div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold tracking-tight">Conta verificada!</h2>
                    <p className="text-sm text-muted-foreground font-medium">
                      Seu email foi confirmado com sucesso. Redirecionando para o login...
                    </p>
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
