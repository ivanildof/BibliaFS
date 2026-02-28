import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { persistentStorage } from '@/lib/persistentStorage';

const SESSION_KEY = 'supabase_session';

async function saveSessionToPersistentStorage(session: any) {
  try {
    await persistentStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('[AuthCallback] Error saving session:', error);
  }
}

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[AuthCallback] Error setting session:', error);
            setStatus('error');
            setErrorMessage(error.message);
            return;
          }

          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await saveSessionToPersistentStorage(session);
          }

          setStatus('success');
          setTimeout(() => setLocation('/'), 1000);
          return;
        }

        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('[AuthCallback] Error exchanging code:', error);
            setStatus('error');
            setErrorMessage(error.message);
            return;
          }

          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await saveSessionToPersistentStorage(session);
          }

          setStatus('success');
          setTimeout(() => setLocation('/'), 1000);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await saveSessionToPersistentStorage(session);
          setStatus('success');
          setTimeout(() => setLocation('/'), 1000);
        } else {
          setStatus('error');
          setErrorMessage('Nenhum token de autenticação encontrado');
        }
      } catch (err: any) {
        console.error('[AuthCallback] Unexpected error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Erro inesperado');
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground">Autenticando...</h1>
            <p className="text-muted-foreground mt-2">Aguarde enquanto configuramos sua sessão</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Login realizado!</h1>
            <p className="text-muted-foreground mt-2">Redirecionando...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Erro na autenticação</h1>
            <p className="text-muted-foreground mt-2">{errorMessage}</p>
            <button
              onClick={() => setLocation('/login')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Voltar ao login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
