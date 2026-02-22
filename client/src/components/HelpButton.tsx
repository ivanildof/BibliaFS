import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function HelpButton() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(timer);
  }, []);

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

    const suppress = (e: Event) => {
      e.stopImmediatePropagation();
      e.preventDefault();
    };
    window.addEventListener("error", suppress, true);
    window.addEventListener("unhandledrejection", suppress, true);

    const script = document.createElement("script");
    script.src = "https://3e0dfee4-aa06-4172-bc03-18c40281e88b-00-2tn2hamxjchu4.spock.replit.dev/api/widget/embed.js";
    script.setAttribute("data-relpflow", "true");
    script.setAttribute("data-key", "wk_eb84c7ad05a43a0b77025ca39ff3630b126b5b1fb816fd13");
    script.defer = true;

    const cleanup = () => {
      setTimeout(() => {
        window.removeEventListener("error", suppress, true);
        window.removeEventListener("unhandledrejection", suppress, true);
      }, 3000);
    };
    script.onload = cleanup;
    script.onerror = cleanup;

    document.body.appendChild(script);
  }, []);

  const handleClick = () => {
    if (typeof (window as any).RelpFlow !== "undefined" && typeof (window as any).RelpFlow.open === "function") {
      (window as any).RelpFlow.open();
    } else if (typeof (window as any).RelpFlowWidget !== "undefined" && typeof (window as any).RelpFlowWidget.open === "function") {
      (window as any).RelpFlowWidget.open();
    } else {
      window.dispatchEvent(new CustomEvent("relpflow:open"));
    }
  };

  return (
    <div className="relative">
      {pulse && (
        <span className="absolute -top-1 -right-1 z-20 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
        </span>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => { setPulse(false); handleClick(); }}
        data-testid="button-help-relpflow"
        title="Central de Ajuda"
        className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-indigo-500/15 dark:from-purple-500/25 dark:to-indigo-500/25 backdrop-blur-sm border-purple-400/40 dark:border-purple-400/50 hover:border-purple-500/70 hover:from-purple-500/25 hover:to-indigo-500/25 dark:hover:from-purple-500/35 dark:hover:to-indigo-500/35 transition-all shadow-sm shadow-purple-500/10 active-elevate-2 group relative overflow-visible"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-purple-500/10 via-transparent to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/15 opacity-0 group-hover:opacity-100 transition-opacity" />
        <HelpCircle className="h-5 w-5 relative z-10 text-purple-500 dark:text-purple-400" />
        <span className="sr-only">Central de Ajuda</span>
      </Button>
    </div>
  );
}
