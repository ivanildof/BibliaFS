import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function HelpButton() {
  const loaded = useRef(false);
  const scriptLoaded = useRef(false);
  const loadingTried = useRef(false);
  const { toast } = useToast();

  const widgetDisabled = String((import.meta as any).env?.VITE_HELP_WIDGET_DISABLED || "").toLowerCase() === "true";
  const widgetKey = (import.meta as any).env?.VITE_HELP_WIDGET_KEY || "wk_bibliafs2026b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1";
  const configuredUrl = (import.meta as any).env?.VITE_HELP_WIDGET_URL as string | undefined;
  const widgetSources = [
    configuredUrl,
    "https://relpflow-fabriciosantossilva.replit.app/widget.js?key=wk_bibliafs2026b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1&hide-fab=true",
    "https://3e0dfee4-aa06-4172-bc03-18c40281e88b-00-2tn2hamxjchu4.spock.replit.dev/api/widget/embed.js",
  ].filter(Boolean) as string[];

  const loadWidgetScript = (sourceIndex = 0) => {
    if (sourceIndex >= widgetSources.length) {
      console.error("[HelpButton] Nenhuma URL de widget respondeu com sucesso");
      return;
    }

    const script = document.createElement("script");
    script.src = widgetSources[sourceIndex];
    script.async = true;
    script.defer = true;
    script.setAttribute("data-relpflow", "true");
    script.setAttribute("data-key", widgetKey);
    script.onload = () => {
      scriptLoaded.current = true;
      console.log("[HelpButton] Widget carregado:", widgetSources[sourceIndex]);
    };
    script.onerror = () => {
      console.error("[HelpButton] Falha ao carregar widget:", widgetSources[sourceIndex]);
      loadWidgetScript(sourceIndex + 1);
    };
    document.body.appendChild(script);
  };

  useEffect(() => {
    if (widgetDisabled) return;
    if (loaded.current) return;
    loaded.current = true;

    if (!loadingTried.current) {
      loadingTried.current = true;
      loadWidgetScript(0);
    }
  }, []);

  const tryOpenWidget = () => {
    const rf = (window as any).RelpFlow;
    const rfWidget = (window as any).RelpFlowWidget;

    if (rf?.open && typeof rf.open === "function") {
      rf.open();
      return true;
    }

    if (rfWidget?.open && typeof rfWidget.open === "function") {
      rfWidget.open();
      return true;
    }

    if (rf?.toggle && typeof rf.toggle === "function") {
      rf.toggle();
      return true;
    }

    window.dispatchEvent(new CustomEvent("relpflow:open"));

    const chatWidget = document.querySelector(
      ".relpflow-widget, .relpflow-container, [data-relpflow] iframe"
    );
    if (chatWidget) return true;

    return false;
  };

  const handleClick = async () => {
    if (widgetDisabled) {
      window.location.href = "/help";
      return;
    }

    if (tryOpenWidget()) return;

    if (!scriptLoaded.current) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (tryOpenWidget()) return;
    }

    window.location.href = "/help";
    toast({
      title: "Ajuda indisponível",
      description: "Chat indisponível no momento. Abrimos a central de ajuda para você.",
      variant: "destructive",
    });
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
