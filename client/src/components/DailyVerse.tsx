import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import * as htmlToImage from "html-to-image";
import { useRef } from "react";

interface DailyVerse {
  id: string;
  dayOfYear: number;
  book: string;
  chapter: number;
  verseNumber: number;
  version: string;
  text: string;
  reference: string;
  theme?: string;
}

export function DailyVerse() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: verse, isLoading } = useQuery<DailyVerse>({
    queryKey: ["/api/daily-verse"],
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
      <Card className="p-8 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-48 mx-auto" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-32 mx-auto" />
        </div>
      </Card>
    );
  }

  if (!verse) return null;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-foreground" data-testid="text-daily-verse-title">
          {t.dailyVerse.verse_of_the_day}
        </h2>
        {verse.theme && (
          <p className="text-sm text-muted-foreground capitalize">
            {verse.theme}
          </p>
        )}
      </div>

      <div ref={cardRef} data-testid="card-daily-verse">
        <Card className="p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/20">
          <div className="space-y-6 text-center">
            <blockquote className="text-xl md:text-2xl font-serif leading-relaxed text-foreground" data-testid="text-verse-content">
              "{verse.text}"
            </blockquote>
            
            <p className="text-base font-semibold text-primary" data-testid="text-verse-reference">
              — {verse.reference}
            </p>
          </div>
        </Card>
      </div>

      <div className="flex justify-center gap-2 px-6 sm:px-0 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyText}
          data-testid="button-copy-verse"
          className="text-xs sm:text-sm"
        >
          <Copy className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t.dailyVerse.copy}</span>
          <span className="sm:hidden">Copiar</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadImage}
          data-testid="button-download-verse"
          className="text-xs sm:text-sm"
        >
          <Download className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t.dailyVerse.download_image}</span>
          <span className="sm:hidden">Baixar</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyText}
          data-testid="button-share-verse"
          className="text-xs sm:text-sm"
        >
          <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t.dailyVerse.share}</span>
          <span className="sm:hidden">Compartilhar</span>
        </Button>
      </div>
    </div>
  );
}
