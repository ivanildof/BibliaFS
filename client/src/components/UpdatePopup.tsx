import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Clock, Shield, Sparkles, Bug, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/lib/config";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.bibliafullstack.app";
const STORAGE_KEY = "bibliasf_update_dismissed_at";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

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
      const response = await fetch(`/api/app/version?current=${APP_VERSION}`);
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
            className="relative w-[calc(100%-48px)] max-w-[280px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden mx-6"
            onClick={(e) => e.stopPropagation()}
            data-testid="update-popup"
          >
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-[#6c5dd3] to-[#ff9e6d]" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/20 hover-elevate active-elevate-2 transition-colors"
              data-testid="button-close-update"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>

            <div className="relative pt-4 px-4 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-[#6c5dd3]" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                    Nova Versão
                  </h2>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    v{updateInfo.latestVersion} disponível
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {updateInfo.releaseNotes.slice(0, 1).map((note, index) => {
                  const IconComponent = iconMap[note.icon];
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                    >
                      <IconComponent className="w-3 h-3 text-[#6c5dd3] mt-0.5 shrink-0" />
                      <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-snug">
                        <span className="font-bold">{note.title}:</span> {note.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="h-9 rounded-lg bg-gradient-to-r from-[#6c5dd3] to-[#ff9e6d] text-white font-bold shadow-sm text-[11px] px-2"
                  data-testid="button-update-now"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    "Atualizar"
                  )}
                </Button>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="h-9 text-gray-500 dark:text-gray-400 text-[11px] px-2"
                  data-testid="button-remind-later"
                >
                  Depois
                </Button>
              </div>

              <div className="text-center text-[9px] text-gray-400 dark:text-gray-500">
                <p>Tamanho: {updateInfo.downloadSize} • Seguro</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
