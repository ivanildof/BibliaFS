import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', message, source, lineno, colno, error);
  const root = document.getElementById("root");
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
      <h2>Erro ao carregar o aplicativo</h2>
      <p>${message}</p>
      <p>Fonte: ${source}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">Recarregar</button>
    </div>`;
  }
};

try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error('React render error:', error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
      <h2>Erro ao inicializar</h2>
      <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px;">Recarregar</button>
    </div>`;
  }
}
