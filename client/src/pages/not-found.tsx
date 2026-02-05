import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="h-24 w-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto text-slate-500 shadow-xl">
          <AlertCircle className="h-12 w-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">
            404 Página Não Encontrada
          </h1>
          <p className="text-slate-500 font-bold italic">
            A página <code className="bg-slate-100 px-2 py-1 rounded text-slate-600 text-sm not-italic">{location}</code> que você está procurando não existe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/">
            <Button className="rounded-[2rem] font-black italic uppercase tracking-tighter shadow-xl w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="rounded-[2rem] font-black italic uppercase tracking-tighter border-slate-200 w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Recarregar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
