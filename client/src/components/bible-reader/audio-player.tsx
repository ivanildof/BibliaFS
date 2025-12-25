import { Button } from "@/components/ui/button";
import { Loader2, Play, Pause, X, SkipBack, SkipForward } from "lucide-react";
import { formatTime } from "@/lib/audioService";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  isPlaying: boolean;
  isLoading: boolean;
  onToggle: () => void;
  onStop: () => void;
  title: string;
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
}

export function AudioPlayer({
  isPlaying,
  isLoading,
  onToggle,
  onStop,
  title,
  currentTime,
  duration,
  onSeek
}: AudioPlayerProps) {
  if (!isPlaying && !isLoading && currentTime === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t p-4 shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{title}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onSeek(Math.max(0, currentTime - 10))}>
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button 
              size="icon" 
              className="h-10 w-10 rounded-full" 
              onClick={onToggle}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onSeek(Math.min(duration, currentTime + 10))}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="w-px h-4 bg-border mx-2" />
            
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onStop}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={([val]) => onSeek(val)}
          className="w-full"
        />
      </div>
    </div>
  );
}
