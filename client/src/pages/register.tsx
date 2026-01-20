import { useState } from "react";
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
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/config";
import { Book, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Link } from "wouter";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  password: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

import logoImage from "../assets/logo-new.png";
import { motion } from "framer-motion";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // Create account via backend (which creates user and sends OTP)
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
      
      // In development, show code in console
      if (result.code) {
        console.log("[DEV] Código OTP:", result.code);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Você pode fazer login agora.",
      });
      
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar sua conta",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50/10 to-amber-50/10 dark:from-background dark:via-purple-950/10 dark:to-amber-950/10 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
              <img src={logoImage} alt="BíbliaFS Logo" className="w-16 h-16 object-cover rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300" />
            </motion.div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Criar Conta</CardTitle>
            <CardDescription className="text-sm font-medium">
              Junte-se à nossa comunidade de estudo bíblico
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
                            placeholder="João"
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
                            placeholder="Mínimo 6 caracteres"
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
                  className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
                  disabled={registerMutation.isPending}
                  data-testid="button-register"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Começar agora"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-8 pb-6 bg-muted/20 rounded-b-3xl border-t border-border/50">
            <div className="w-full space-y-3 pt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-muted px-2 text-muted-foreground font-bold">Ou continue com</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-border/50 bg-card hover:bg-muted/50 transition-all shadow-sm"
                onClick={() => window.location.href = "/api/auth/login"}
                data-testid="button-register-google"
              >
                <SiGoogle className="h-4 w-4 text-[#4285F4]" />
                Google
              </Button>

              <Link href="/" className="w-full block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-10 rounded-xl font-bold text-xs text-muted-foreground hover:text-primary transition-all"
                >
                  Voltar para Landing Page
                </Button>
              </Link>
            </div>

            <p className="text-xs text-center text-muted-foreground font-medium">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4" data-testid="link-login">
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
