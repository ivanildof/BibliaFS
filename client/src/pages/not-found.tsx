import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import logoImage from "../assets/logo-new.png";

export default function NotFound() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background via-purple-50/5 to-amber-50/5 dark:from-background dark:via-purple-950/10 dark:to-amber-950/10 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[150px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md mx-4 rounded-3xl border-none bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardContent className="pt-8 pb-6 px-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-6"
            >
              <img 
                src={logoImage} 
                alt="BíbliaFS Logo" 
                className="w-20 h-20 object-cover rounded-2xl shadow-xl mx-auto"
                loading="lazy"
                data-testid="img-logo"
              />
            </motion.div>
            
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-foreground mb-2" data-testid="text-404-title">404</h1>
            <h2 className="text-xl font-bold text-foreground mb-4" data-testid="text-404-subtitle">Página Não Encontrada</h2>

            <p className="text-muted-foreground mb-2" data-testid="text-404-description">
              A página que você está procurando não existe ou foi movida.
            </p>
            
            {location && location !== "/" && (
              <p className="text-xs text-muted-foreground/70 font-mono bg-muted/50 rounded-lg px-3 py-2 mb-4 break-all" data-testid="text-404-path">
                {location}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 px-8 pb-8">
            <Link href="/" className="w-full" data-testid="link-go-home">
              <Button 
                size="lg" 
                className="w-full rounded-xl font-bold shadow-lg shadow-primary/20"
                data-testid="button-go-home"
              >
                <Home className="h-5 w-5 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
            
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 rounded-xl"
                onClick={() => window.history.back()}
                data-testid="button-go-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <Link href="/bible" className="flex-1" data-testid="link-go-bible">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full rounded-xl"
                  data-testid="button-go-bible"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Bíblia
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-6" data-testid="text-help-message">
          Se o problema persistir, entre em{" "}
          <Link href="/contact" className="text-primary underline-offset-4" data-testid="link-contact">
            contato conosco
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
