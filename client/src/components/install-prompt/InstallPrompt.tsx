import { useState, useEffect } from 'react';
import { Share, Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { isNative } from '@/lib/config';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // Don't show if already in native app
    if (isNative) return;

    // Detect if already installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // Platform detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    
    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');

    // Handle PWA install prompt (Chrome/Android/Desktop)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we show the prompt manually since beforeinstallprompt isn't supported
    if (isIOS) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-[100] md:bottom-8 md:right-8 md:left-auto md:w-96"
      >
        <Card className="border-none shadow-2xl bg-card/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-primary/20">
          <CardContent className="p-6">
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                {platform === 'desktop' ? (
                  <Monitor className="h-6 w-6 text-primary" />
                ) : (
                  <Smartphone className="h-6 w-6 text-primary" />
                )}
              </div>
              
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-lg leading-tight mb-1">
                  Instalar BíbliaFS
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tenha acesso rápido e offline instalando o aplicativo em seu dispositivo.
                </p>

                {platform === 'ios' ? (
                  <div className="space-y-3 bg-muted/50 p-3 rounded-2xl text-xs border border-border/50">
                    <p className="font-semibold flex items-center gap-2">
                      Como instalar no iOS:
                    </p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li className="flex items-center gap-2">
                        Toque no ícone de <Share className="h-3 w-3 text-blue-500 inline" /> Compartilhar
                      </li>
                      <li>Role para baixo e selecione "Adicionar à Tela de Início"</li>
                    </ol>
                  </div>
                ) : (
                  <Button 
                    onClick={handleInstall}
                    className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-primary/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Instalar Agora
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
