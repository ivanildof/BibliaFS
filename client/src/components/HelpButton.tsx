import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export function HelpButton() {
  const loaded = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://relpflow-fabriciosantossilva.replit.app/widget.js?key=wk_5366637160d561125be4c0f874bbd2347282e94a17d46e2a&hide-fab=true";
    script.onload = () => setReady(true);
    script.onerror = () => console.warn("[HelpButton] widget.js failed to load — app may be offline or domain not whitelisted");
    document.body.appendChild(script);
  }, []);

  const handleClick = () => {
    try {
      const relpflow = (window as any).RelpFlow;
      if (relpflow && typeof relpflow.toggle === "function") {
        relpflow.toggle();
        return;
      }
      const panel = document.getElementById("rf-panel");
      if (panel) panel.classList.toggle("rf-open");
    } catch (e) {
      console.warn("[HelpButton] Could not open widget:", e);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      data-testid="button-help-relpflow"
      title="Central de Ajuda"
      className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-indigo-500/15"
    >
      <HelpCircle className="h-9 w-9 text-purple-500 dark:text-purple-400 animate-pulse" />
      <span className="sr-only">Central de Ajuda</span>
    </Button>
  );
}
