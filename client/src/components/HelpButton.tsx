import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

const RELPFLOW_BASE = "https://3e0dfee4-aa06-4172-bc03-18c40281e88b-00-2tn2hamxjchu4.spock.replit.dev";
const RELPFLOW_KEY = "wk_eb84c7ad05a43a0b77025ca39ff3630b126b5b1fb816fd13";

export function HelpButton() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if ((window as any).__relpflow_loaded) return;
    (window as any).__relpflow_loaded = true;

    const style = document.createElement("style");
    style.textContent = `
      .relpflow-widget,
      .relpflow-container,
      [data-relpflow] iframe,
      iframe[src*="relpflow"],
      .relpflow-modal {
        max-width: calc(100vw - 32px) !important;
        width: 380px !important;
        max-height: calc(100vh - 120px) !important;
        height: auto !important;
        bottom: 60px !important;
        top: auto !important;
        right: 16px !important;
        left: auto !important;
        border-radius: 16px !important;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2) !important;
        z-index: 9998 !important;
      }
      @media (max-width: 768px) {
        .relpflow-widget,
        .relpflow-container,
        [data-relpflow] iframe,
        iframe[src*="relpflow"],
        .relpflow-modal {
          width: calc(100vw - 24px) !important;
          max-width: 360px !important;
          max-height: calc(100vh - 110px) !important;
          height: 70vh !important;
          bottom: 55px !important;
          top: 60px !important;
          right: 12px !important;
          left: 12px !important;
          border-radius: 12px !important;
        }
      }
      .relpflow-message,
      .relpflow-message-content,
      .message-bubble,
      .chat-message {
        max-width: 85% !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        font-size: 14px !important;
        padding: 8px 12px !important;
        line-height: 1.4 !important;
      }
      .relpflow-input-area,
      .chat-input-wrapper,
      textarea[name="message"],
      input[type="text"][name="message"] {
        width: 100% !important;
        max-width: 100% !important;
        font-size: 16px !important;
        padding: 12px !important;
        box-sizing: border-box !important;
      }
      .relpflow-header,
      .chat-header {
        padding: 12px 16px !important;
        font-size: 15px !important;
        min-height: 50px !important;
      }
      .relpflow-messages,
      .chat-messages,
      .messages-container {
        max-height: calc(100% - 110px) !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
        padding: 8px 4px !important;
      }
      .relpflow-button,
      .chat-button,
      .send-button {
        min-height: 44px !important;
        min-width: 44px !important;
        padding: 10px 16px !important;
        font-size: 14px !important;
      }
      .relpflow-close,
      .chat-close {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        min-height: 40px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .relpflow-message img,
      .message-content img {
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
      }
      .relpflow-widget *,
      .relpflow-container * {
        box-sizing: border-box !important;
      }
    `;
    document.head.appendChild(style);

    loadScript();
  }, []);

  function loadScript(attempt = 1) {
    const suppress = (e: Event) => {
      e.stopImmediatePropagation();
      e.preventDefault();
    };
    window.addEventListener("error", suppress, true);
    window.addEventListener("unhandledrejection", suppress, true);

    const script = document.createElement("script");
    script.src = `${RELPFLOW_BASE}/api/widget/embed.js`;
    script.setAttribute("data-relpflow", "true");
    script.setAttribute("data-key", RELPFLOW_KEY);
    script.defer = true;

    const cleanup = () => {
      setTimeout(() => {
        window.removeEventListener("error", suppress, true);
        window.removeEventListener("unhandledrejection", suppress, true);
      }, 3000);
    };

    script.onload = () => {
      scriptLoaded.current = true;
      cleanup();
    };

    script.onerror = () => {
      cleanup();
      if (attempt < 3) {
        setTimeout(() => {
          fetch(RELPFLOW_BASE, { mode: "no-cors" }).catch(() => {});
          setTimeout(() => loadScript(attempt + 1), 2000);
        }, attempt * 2000);
      }
    };

    document.body.appendChild(script);
  }

  const handleClick = () => {
    if (typeof (window as any).RelpFlow !== "undefined" && typeof (window as any).RelpFlow.open === "function") {
      (window as any).RelpFlow.open();
      return;
    }
    if (typeof (window as any).RelpFlowWidget !== "undefined" && typeof (window as any).RelpFlowWidget.open === "function") {
      (window as any).RelpFlowWidget.open();
      return;
    }

    window.dispatchEvent(new CustomEvent("relpflow:open"));

    if (!scriptLoaded.current) {
      window.open(
        `${RELPFLOW_BASE}/widget/chat?key=${RELPFLOW_KEY}`,
        "relpflow_chat",
        "width=400,height=600,scrollbars=yes,resizable=yes"
      );
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      data-testid="button-help-relpflow"
      title="Central de Ajuda"
      className="h-10 w-10 rounded-xl bg-background/50 dark:bg-card/40 backdrop-blur-sm border-primary/20 dark:border-primary/30 hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-all shadow-sm active-elevate-2 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 dark:from-primary/20 dark:to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <MessageCircle className="h-5 w-5 relative z-10 text-purple-500" />
      <span className="sr-only">Central de Ajuda</span>
    </Button>
  );
}
