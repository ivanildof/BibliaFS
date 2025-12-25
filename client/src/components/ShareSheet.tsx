import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Share2,
  MessageCircle,
  Send,
} from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import {
  shareContent,
  copyToClipboard,
  generateVerseShareText,
  generateVerseShareUrl,
  getWhatsAppShareUrl,
  getTelegramShareUrl,
  getTwitterShareUrl,
  getFacebookShareUrl,
} from "@/lib/shareUtils";

import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookName: string;
  bookAbbrev: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  version: string;
}

export function ShareSheet({
  open,
  onOpenChange,
  bookName,
  bookAbbrev,
  chapter,
  verseNumber,
  verseText,
  version,
}: ShareSheetProps) {
  const { toast } = useToast();

  const shareMutation = useMutation({
    mutationFn: async (platform: string) => {
      return await apiRequest("POST", "/api/bible/share", {
        book: bookAbbrev,
        chapter,
        verse: verseNumber,
        version,
        platform
      });
    }
  });

  const shareText = generateVerseShareText(bookName, chapter, verseNumber, verseText, version);
  const shareUrl = generateVerseShareUrl(bookAbbrev, chapter, verseNumber, version);
  const fullShareText = `${shareText}\n${shareUrl}`;

  const handleNativeShare = async () => {
    shareMutation.mutate("native");
    const success = await shareContent({
      title: `${bookName} ${chapter}:${verseNumber}`,
      text: shareText,
      url: shareUrl,
    });
    if (success) {
      onOpenChange(false);
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    shareMutation.mutate("copy");
    const success = await copyToClipboard(fullShareText);
    toast({
      title: success ? "Copiado!" : "Erro ao copiar",
      description: success ? "Versículo copiado para a área de transferência" : "Não foi possível copiar",
      variant: success ? "default" : "destructive",
    });
    if (success) onOpenChange(false);
  };

  const handleWhatsApp = () => {
    shareMutation.mutate("whatsapp");
    window.open(getWhatsAppShareUrl(fullShareText), "_blank");
    onOpenChange(false);
  };

  const handleTelegram = () => {
    shareMutation.mutate("telegram");
    window.open(getTelegramShareUrl(shareText, shareUrl), "_blank");
    onOpenChange(false);
  };

  const handleTwitter = () => {
    shareMutation.mutate("twitter");
    window.open(getTwitterShareUrl(shareText, shareUrl), "_blank");
    onOpenChange(false);
  };

  const handleFacebook = () => {
    shareMutation.mutate("facebook");
    window.open(getFacebookShareUrl(shareUrl), "_blank");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[60vh]">
        <SheetHeader>
          <SheetTitle>Compartilhar Versículo</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-serif italic">"{verseText}"</p>
            <p className="text-xs text-muted-foreground mt-2">
              — {bookName} {chapter}:{verseNumber} ({version.toUpperCase()})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {"share" in navigator && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleNativeShare}
                data-testid="button-share-native"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            )}
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleCopy}
              data-testid="button-share-copy"
            >
              <Copy className="h-4 w-4" />
              Copiar
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
              onClick={handleWhatsApp}
              data-testid="button-share-whatsapp"
            >
              <SiWhatsapp className="h-4 w-4 text-green-600" />
              WhatsApp
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
              onClick={handleTelegram}
              data-testid="button-share-telegram"
            >
              <Send className="h-4 w-4 text-blue-500" />
              Telegram
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleTwitter}
              data-testid="button-share-twitter"
            >
              <MessageCircle className="h-4 w-4" />
              X (Twitter)
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
              onClick={handleFacebook}
              data-testid="button-share-facebook"
            >
              <SiFacebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
