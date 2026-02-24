import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

export function HelpButton() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://relpflow-fabriciosantossilva.replit.app/widget.js?key=wk_bibliafs2026b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1&hide-fab=true";
    script.async = true;
    script.onerror = () => console.error("[HelpButton] Falha ao carregar widget");
    document.body.appendChild(script);
  }, []);

  const handleClick = () => {
    const rf = (window as any).RelpFlow;
    if (rf?.toggle) {
      rf.toggle();
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      title="Central de Ajuda"
      className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-indigo-500/15"
    >
      <HelpCircle className="h-9 w-9 text-purple-500 dark:text-purple-400 animate-pulse" />
      <span className="sr-only">Central de Ajuda</span>
    </Button>
  );
}
