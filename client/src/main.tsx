import { createRoot } from "react-dom/client";

// Teste mínimo para identificar onde está travando
const rootElement = document.getElementById("root");

function showStep(step: string, success: boolean = true) {
  const el = document.createElement('div');
  el.style.cssText = 'padding:8px;margin:4px 0;border-radius:4px;font-family:monospace;font-size:12px;' + 
    (success ? 'background:#d4edda;color:#155724;' : 'background:#f8d7da;color:#721c24;');
  el.textContent = step;
  document.getElementById('debug-log')?.appendChild(el);
}

if (rootElement) {
  rootElement.innerHTML = `
    <div style="padding:20px;font-family:sans-serif;max-width:400px;margin:0 auto;">
      <h2 style="color:#8B4513;margin-bottom:20px;">BíbliaFS - Diagnóstico</h2>
      <div id="debug-log"></div>
    </div>
  `;
  
  showStep('1. HTML carregado ✓');
  showStep('2. JavaScript iniciando...');
  
  // Test 1: Check environment variables
  try {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    showStep(`3. VITE_SUPABASE_URL: ${supabaseUrl ? 'OK (' + supabaseUrl.substring(0, 30) + '...)' : 'FALTANDO!'}`);
    showStep(`4. VITE_SUPABASE_ANON_KEY: ${supabaseKey ? 'OK (definida)' : 'FALTANDO!'}`);
  } catch (e) {
    showStep('3. Erro ao verificar env vars: ' + (e as Error).message, false);
  }
  
  // Test 2: Try to import React
  try {
    showStep('5. React importado ✓');
  } catch (e) {
    showStep('5. Erro ao importar React: ' + (e as Error).message, false);
  }
  
  // Test 3: Try to render something simple
  setTimeout(() => {
    try {
      showStep('6. Tentando renderizar React...');
      
      const TestComponent = () => {
        return (
          <div style={{ marginTop: '20px', padding: '20px', background: '#e8f5e9', borderRadius: '8px' }}>
            <h3 style={{ color: '#2e7d32', margin: '0 0 10px' }}>React funcionando!</h3>
            <p style={{ margin: 0 }}>O aplicativo pode carregar normalmente agora.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ marginTop: '15px', padding: '10px 20px', background: '#8B4513', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              Recarregar com App Completo
            </button>
          </div>
        );
      };
      
      const container = document.createElement('div');
      document.getElementById('debug-log')?.appendChild(container);
      createRoot(container).render(<TestComponent />);
      
      showStep('7. React renderizado com sucesso! ✓');
    } catch (e) {
      showStep('6. Erro ao renderizar React: ' + (e as Error).message, false);
    }
  }, 500);
}
