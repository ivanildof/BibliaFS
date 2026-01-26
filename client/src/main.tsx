import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New content available, refresh to update');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("[BíbliaFS] Error rendering app:", error);
    rootElement.innerHTML = `
      <div style="padding:20px;font-family:sans-serif;max-width:400px;margin:0 auto;text-align:center;">
        <h2 style="color:#c00;">Erro ao carregar</h2>
        <p style="color:#666;">${error instanceof Error ? error.message : String(error)}</p>
        <button onclick="location.reload()" style="padding:10px 20px;background:#8B4513;color:white;border:none;border-radius:5px;cursor:pointer;margin-top:15px;">
          Tentar novamente
        </button>
      </div>
    `;
  }
}
