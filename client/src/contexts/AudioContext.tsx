import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, X, ChevronDown, ChevronUp } from "lucide-react";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getBookName } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";

interface AudioState {
  audioUrl: string;
  book: string;
  chapter: number;
  version: string;
  isPlaying: boolean;
}

interface AudioContextType {
  currentAudio: AudioState | null;
  playChapter: (book: string, chapter: number, version: string) => void;
  stopAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentAudio, setCurrentAudio] = useState<AudioState | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();

  const playChapter = async (book: string, chapter: number, version: string) => {
    try {
      // Fetch audio URL from backend
      const response = await fetch(`/api/bible/audio/${version}/${book}/${chapter}`);
      if (!response.ok) {
        throw new Error("Áudio não disponível");
      }

      const data = await response.json();
      
      setCurrentAudio({
        audioUrl: data.audioUrl,
        book,
        chapter,
        version,
        isPlaying: true,
      });
      
      setIsExpanded(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar áudio",
        description: error.message || "Não foi possível carregar o áudio deste capítulo",
      });
    }
  };

  const stopAudio = () => {
    setCurrentAudio(null);
  };

  const handleTimeUpdate = async (currentTime: number, duration: number) => {
    if (!currentAudio) return;

    // Save progress every 5 seconds
    if (Math.floor(currentTime) % 5 === 0) {
      try {
        await apiRequest("POST", "/api/bible/audio/progress", {
          book: currentAudio.book,
          chapter: currentAudio.chapter,
          version: currentAudio.version,
          currentTime: Math.floor(currentTime),
          duration: Math.floor(duration),
          playbackSpeed: "1.0",
          isCompleted: currentTime / duration > 0.95,
        });
      } catch (error) {
        console.error("Error saving audio progress:", error);
      }
    }
  };

  const handleEnded = () => {
    if (!currentAudio) return;

    // Mark as completed
    apiRequest("POST", "/api/bible/audio/progress", {
      book: currentAudio.book,
      chapter: currentAudio.chapter,
      version: currentAudio.version,
      currentTime: 0,
      duration: 0,
      playbackSpeed: "1.0",
      isCompleted: true,
    });

    toast({
      title: "Capítulo concluído!",
      description: `Você terminou de ouvir ${getBookName(currentAudio.book, language)} ${currentAudio.chapter}`,
    });

    // TODO: Auto-play next chapter
  };

  return (
    <AudioContext.Provider value={{ currentAudio, playChapter, stopAudio }}>
      {children}

      {/* Floating Mini Player */}
      {currentAudio && (
        <div 
          className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-2xl"
          data-testid="mini-player"
        >
          <Card className="overflow-hidden">
            {/* Mini player header */}
            <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm" data-testid="text-mini-player-title">
                    {getBookName(currentAudio.book, language)} {currentAudio.chapter}
                  </p>
                  <p className="text-xs opacity-90 truncate">
                    {currentAudio.version.toUpperCase()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  data-testid="button-toggle-player"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopAudio}
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  data-testid="button-close-player"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expanded player */}
            {isExpanded && (
              <div className="p-4">
                <AudioPlayer
                  audioUrl={currentAudio.audioUrl}
                  book={currentAudio.book}
                  chapter={currentAudio.chapter}
                  version={currentAudio.version}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                />
              </div>
            )}
          </Card>
        </div>
      )}
    </AudioContext.Provider>
  );
}
