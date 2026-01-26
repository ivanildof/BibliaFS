import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Clock, Shield, Sparkles, Bug, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.bibliafullstack.app";
const STORAGE_KEY = "bibliasf_update_dismissed_at";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;
const CURRENT_APP_VERSION = "2.0.0";

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  downloadSize: string;
  critical?: boolean;
  releaseNotes: {
    icon: "sparkles" | "bug" | "zap" | "shield-check";
    title: string;
    description: string;
  }[];
}

const iconMap = {
  sparkles: Sparkles,
  bug: Bug,
  zap: Zap,
  "shield-check": ShieldCheck,
};

export function UpdatePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    // Não mostrar na Web (identificamos pelo UserAgent ou se não for um ambiente PWA/Android)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Se for Web puro (não PWA e não Mobile), não mostra
    if (!isStandalone && !/Android/i.test(navigator.userAgent)) {
      return;
    }

    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION_MS) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/app/version?current=${CURRENT_APP_VERSION}`);
      if (!response.ok) return;
      
      const data = await response.json();
      
      if (data.updateAvailable) {
        setUpdateInfo({
          currentVersion: data.currentVersion,
          latestVersion: data.latestVersion,
          downloadSize: data.downloadSize || "~15 MB",
          releaseNotes: data.releaseNotes || [
            { icon: "sparkles", title: "Novos recursos", description: "Melhorias na experiência de estudo" },
            { icon: "bug", title: "Correções", description: "Bugs corrigidos para maior estabilidade" },
            { icon: "zap", title: "Performance", description: "App mais rápido e responsivo" },
          ],
        });
        setIsVisible(true);
      }
    } catch (error) {
      console.error("[UpdatePopup] Error checking for updates:", error);
    }
  };

  const handleUpdate = () => {
    setIsLoading(true);
    
    const marketUrl = "market://details?id=com.bibliafullstack.app";
    
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = marketUrl;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      document.body.removeChild(iframe);
      window.open(PLAY_STORE_URL, "_blank");
      setIsLoading(false);
      setIsVisible(false);
    }, 500);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!updateInfo) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-[calc(100%-32px)] max-w-[320px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
            data-testid="update-popup"
          >
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-[#6c5dd3] to-[#ff9e6d]" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/20 hover-elevate active-elevate-2 transition-colors"
              data-testid="button-close-update"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="relative pt-6 px-5 pb-5">
              <motion.div
                animate={{ 
                  y: [0, -4, 0],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 mx-auto mb-3 rounded-xl bg-white shadow-lg flex items-center justify-center"
              >
                <Download className="w-8 h-8 text-[#6c5dd3]" />
              </motion.div>

              <h2 className="text-center text-lg font-extrabold text-gray-900 dark:text-white mb-1">
                Nova Versão Disponível
              </h2>
              <p className="text-center text-gray-500 dark:text-gray-400 text-xs mb-4">
                Uma atualização está pronta para você
              </p>

              <div className="flex justify-center gap-3 mb-4">
                <div className="text-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex-1">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Atual</p>
                  <p className="text-sm font-extrabold text-gray-700 dark:text-gray-300">
                    v{updateInfo.currentVersion}
                  </p>
                </div>
                <div className="flex items-center text-gray-400">
                  <span className="text-xl">→</span>
                </div>
                <div className="text-center px-3 py-2 rounded-lg bg-gradient-to-br from-[#6c5dd3]/10 to-[#ff9e6d]/10 border border-[#6c5dd3]/20 flex-1">
                  <p className="text-[10px] text-[#6c5dd3] mb-0.5">Nova</p>
                  <p className="text-sm font-extrabold text-[#6c5dd3]">
                    v{updateInfo.latestVersion}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {updateInfo.releaseNotes.slice(0, 2).map((note, index) => {
                  const IconComponent = iconMap[note.icon];
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-[#6c5dd3]/20 to-[#ff9e6d]/20 shrink-0">
                        <IconComponent className="w-3.5 h-3.5 text-[#6c5dd3]" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-900 dark:text-white leading-tight">
                          {note.title}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                          {note.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[10px] font-medium text-green-700 dark:text-green-400">
                  Google Play Store
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-[#6c5dd3] to-[#ff9e6d] text-white font-bold shadow-md text-sm"
                  data-testid="button-update-now"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Atualizar Agora
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="w-full h-9 text-gray-500 dark:text-gray-400 text-xs"
                  data-testid="button-remind-later"
                >
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  Lembrar Mais Tarde
                </Button>
              </div>

              <div className="mt-3 text-center text-[10px] text-gray-400 dark:text-gray-500">
                <p>Tamanho: {updateInfo.downloadSize} • Gratuito</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
