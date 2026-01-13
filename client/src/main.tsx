import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("[BíbliaFS] Starting app...");

const rootElement = document.getElementById("root");

if (rootElement) {
  rootElement.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><div style="text-align:center;"><div style="border:4px solid #f3f3f3;border-top:4px solid #8B4513;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 20px;"></div><p>Carregando BíbliaFS...</p></div></div><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>';
  
  setTimeout(() => {
    try {
      console.log("[BíbliaFS] Rendering React app...");
      createRoot(rootElement).render(<App />);
      console.log("[BíbliaFS] React app rendered successfully");
    } catch (error) {
      console.error("[BíbliaFS] Error rendering app:", error);
      rootElement.innerHTML = `
        <div style="padding:20px;font-family:sans-serif;max-width:400px;margin:0 auto;">
          <h2 style="color:#c00;">Erro ao carregar</h2>
          <p>${error instanceof Error ? error.message : String(error)}</p>
          <button onclick="location.reload()" style="padding:10px 20px;background:#8B4513;color:white;border:none;border-radius:5px;cursor:pointer;">
            Tentar novamente
          </button>
        </div>
      `;
    }
  }, 100);
} else {
  console.error("[BíbliaFS] Root element not found");
  document.body.innerHTML = '<div style="padding:20px;font-family:sans-serif;"><h2>Erro: elemento root não encontrado</h2></div>';
}
