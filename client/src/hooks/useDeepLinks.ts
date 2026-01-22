import { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { isNative } from '@/lib/config';
import { supabase } from '@/lib/supabase';

export function useDeepLinks(onAuthCallback?: () => void) {
  useEffect(() => {
    if (!isNative) return;

    const handleDeepLink = async (event: URLOpenListenerEvent) => {
      const url = event.url;
      console.log('[DeepLink] Received URL:', url);

      try {
        const urlObj = new URL(url);
        
        if (urlObj.hash && urlObj.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            console.log('[DeepLink] Setting session from OAuth callback');
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('[DeepLink] Error setting session:', error);
            } else {
              console.log('[DeepLink] Session set successfully');
              onAuthCallback?.();
            }
          }
        } else if (urlObj.searchParams.has('code')) {
          const code = urlObj.searchParams.get('code');
          if (code) {
            console.log('[DeepLink] Exchanging auth code for session');
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('[DeepLink] Error exchanging code:', error);
            } else {
              console.log('[DeepLink] Code exchanged successfully');
              onAuthCallback?.();
            }
          }
        }
      } catch (error) {
        console.error('[DeepLink] Error processing URL:', error);
      }
    };

    App.addListener('appUrlOpen', handleDeepLink);

    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log('[DeepLink] App launched with URL:', result.url);
        handleDeepLink({ url: result.url });
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [onAuthCallback]);
}
