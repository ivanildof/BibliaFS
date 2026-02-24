import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export function HelpButton() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://3e0dfee4-aa06-4172-bc03-18c40281e88b-00-2tn2hamxjchu4.spock.replit.dev/api/widget/embed.js";
    script.setAttribute("data-relpflow", "true");
    script.setAttribute("data-key", "wk_8040318c3aeba1fd7c2ae47f250665440ad005f9e545a56e");
    script.setAttribute("data-hide-fab", "true");
    script.defer = true;
    script.onerror = (e) => console.error("[HelpButton] Falha ao carregar widget", e);
    document.body.appendChild(script);
  }, []);

  const handleClick = () => {
    const rf = (window as any).RelpFlow;
    if (rf && rf.isReady) {
      rf.toggle();
    } else {
      console.warn("[HelpButton] Widget ainda carregando...");
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
