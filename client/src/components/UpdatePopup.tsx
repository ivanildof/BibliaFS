import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Clock, Shield, Sparkles, Bug, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.bibliafullstack.app";
const STORAGE_KEY = "bibliasf_update_dismissed_at";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;
const CURRENT_APP_VERSION = "2.0.0";

interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  downloadSize: string;
  releaseNotes: {
    icon: "sparkles" | "bug" | "zap";
    title: string;
    description: string;
  }[];
}

const iconMap = {
  sparkles: Sparkles,
  bug: Bug,
  zap: Zap,
};

export function UpdatePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
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
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            data-testid="update-popup"
          >
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#6c5dd3] to-[#ff9e6d]" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover-elevate active-elevate-2 transition-colors"
              data-testid="button-close-update"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="relative pt-8 px-6 pb-6">
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white shadow-lg flex items-center justify-center"
              >
                <Download className="w-10 h-10 text-[#6c5dd3]" />
              </motion.div>

              <h2 className="text-center text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                Nova Versão Disponível
              </h2>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
                Uma atualização está pronta para melhorar sua experiência
              </p>

              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Atual</p>
                  <p className="text-lg font-extrabold text-gray-700 dark:text-gray-300">
                    v{updateInfo.currentVersion}
                  </p>
                </div>
                <div className="flex items-center text-gray-400">
                  <span className="text-2xl">→</span>
                </div>
                <div className="text-center px-4 py-3 rounded-xl bg-gradient-to-br from-[#6c5dd3]/10 to-[#ff9e6d]/10 border border-[#6c5dd3]/20">
                  <p className="text-xs text-[#6c5dd3] mb-1">Nova</p>
                  <p className="text-lg font-extrabold text-[#6c5dd3]">
                    v{updateInfo.latestVersion}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {updateInfo.releaseNotes.slice(0, 3).map((note, index) => {
                  const IconComponent = iconMap[note.icon];
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#6c5dd3]/20 to-[#ff9e6d]/20">
                        <IconComponent className="w-4 h-4 text-[#6c5dd3]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {note.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {note.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2 mb-4 px-3 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Atualização segura pela Google Play Store
                </span>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6c5dd3] to-[#ff9e6d] text-white font-bold shadow-lg"
                  data-testid="button-update-now"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Atualizar Agora
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="w-full h-10 text-gray-500 dark:text-gray-400"
                  data-testid="button-remind-later"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Lembrar Mais Tarde
                </Button>
              </div>

              <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500 space-y-1">
                <p>Atualização gratuita • Mantém todos os seus dados</p>
                <p>Tamanho: {updateInfo.downloadSize} • Tempo estimado: 1-2 min</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
