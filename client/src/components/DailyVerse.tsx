import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Download, Quote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import * as htmlToImage from "html-to-image";
import { useRef } from "react";
import { apiFetch } from "@/lib/config";
import { motion } from "framer-motion";

interface DailyVerse {
  id: string;
  reference: string;
  text: string;
  dayOfYear: number;
  version: string;
  theme?: string;
}

export function DailyVerse() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: verse, isLoading } = useQuery<DailyVerse>({
    queryKey: ["/api/daily-verse", Intl.DateTimeFormat().resolvedOptions().timeZone],
    queryFn: async () => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await apiFetch(`/api/daily-verse?tz=${encodeURIComponent(tz)}&t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch daily verse');
      return response.json();
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 60,
  });

  const handleCopyText = async () => {
    if (!verse) return;

    const text = `${verse.text}\n\n— ${verse.reference}`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: t.dailyVerse.verse_copied,
        description: t.dailyVerse.verse_copied_description,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.dailyVerse.copy_failed,
        description: t.dailyVerse.copy_failed_description,
      });
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current || !verse) return;

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `versiculo-do-dia-${verse.dayOfYear}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: t.dailyVerse.image_downloaded,
        description: t.dailyVerse.image_downloaded_description,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.dailyVerse.download_failed,
        description: t.dailyVerse.download_failed_description,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card-achievements p-10 animate-pulse rounded-2xl">
        <div className="relative z-10 space-y-4">
          <div className="h-6 bg-white/50 rounded w-48 mx-auto" />
          <div className="h-24 bg-white/50 rounded" />
          <div className="h-4 bg-white/50 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!verse) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div ref={cardRef} data-testid="card-daily-verse">
        <div className="bg-card-achievements p-8 sm:p-10 shadow-lg rounded-2xl">
          <div className="relative z-10 space-y-6 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-nowrap overflow-hidden">
              <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-[#FFA500]/50" />
              <Quote className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-[#FFA500] rotate-180 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#FFA500] whitespace-nowrap" data-testid="text-daily-verse-title">
                {t.dailyVerse.verse_of_the_day}
              </span>
              <Quote className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-[#FFA500] flex-shrink-0" />
              <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-[#FFA500]/50" />
            </div>

            {verse.theme && (
              <p className="text-sm text-[#666666] capitalize font-medium">
                {verse.theme}
              </p>
            )}

            <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl leading-relaxed text-[#333333] font-medium" data-testid="text-verse-content">
              "{verse.text}"
            </blockquote>
            
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-[#800080]/30" />
              <p className="text-base font-semibold text-[#800080]" data-testid="text-verse-reference">
                {verse.reference}
              </p>
              <div className="h-px w-8 bg-[#800080]/30" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 px-4 sm:px-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyText}
          data-testid="button-copy-verse"
          className="rounded-full text-xs sm:text-sm shadow-sm"
        >
          <Copy className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">{t.dailyVerse.copy}</span>
          <span className="sm:hidden">Copiar</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadImage}
          data-testid="button-download-verse"
          className="rounded-full text-xs sm:text-sm shadow-sm"
        >
          <Download className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">{t.dailyVerse.download_image}</span>
          <span className="sm:hidden">Baixar</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyText}
          data-testid="button-share-verse"
          className="rounded-full text-xs sm:text-sm shadow-sm"
        >
          <Share2 className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">{t.dailyVerse.share}</span>
          <span className="sm:hidden">Compartilhar</span>
        </Button>
      </div>
    </motion.div>
  );
}
