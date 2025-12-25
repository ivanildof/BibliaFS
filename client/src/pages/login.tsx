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
import { Book, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

import logoImage from "@assets/Biblia_FS_1766520633441.png";
import { motion } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        throw new Error(error.message === "Invalid login credentials" 
          ? "E-mail ou senha incorretos." 
          : error.message);
      }
      
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50/10 to-amber-50/10 dark:from-background dark:via-purple-950/10 dark:to-amber-950/10 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-none shadow-2xl rounded-3xl backdrop-blur-sm bg-card/90">
          <CardHeader className="text-center space-y-4 pt-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto"
            >
              <img src={logoImage} alt="BíbliaFS Logo" className="w-20 h-20 object-cover rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300" />
            </motion.div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Bem-vindo</CardTitle>
            <CardDescription className="text-base font-medium">
              Acesse sua conta para continuar sua jornada
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-sm">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="h-14 rounded-2xl bg-muted/50 border-primary/5 focus-visible:ring-primary text-lg"
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
                      <FormLabel className="font-bold text-sm">Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha"
                            className="h-14 rounded-2xl bg-muted/50 border-primary/5 focus-visible:ring-primary text-lg pr-12"
                            data-testid="input-password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                    data-testid="link-forgot-password"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar agora"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 px-8 pb-10 bg-muted/20 rounded-b-3xl border-t border-border/50">
            <p className="text-sm text-center text-muted-foreground pt-6 font-medium">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4" data-testid="link-register">
                Criar uma conta grátis
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
