import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/config';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | 'default';
}

export function usePushNotifications() {
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'default',
  });

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      
      if (!isSupported) {
        setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
        return;
      }

      const permission = Notification.permission;
      let isSubscribed = false;

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          isSubscribed = !!subscription;
        }
      } catch (error) {
        console.error('[Push] Error checking subscription:', error);
      }

      setState({
        isSupported: true,
        isSubscribed,
        isLoading: false,
        permission,
      });
    };

    checkSupport();
  }, []);

  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[Push] Service Worker registered');
      return registration;
    } catch (error) {
      console.error('[Push] Service Worker registration failed:', error);
      return null;
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permissão negada',
          description: 'Você precisa permitir notificações para receber lembretes.',
          variant: 'destructive',
        });
        setState(prev => ({ ...prev, isLoading: false, permission }));
        return false;
      }

      const vapidResponse = await apiFetch('/api/notifications/vapid-key');
      if (!vapidResponse.ok) {
        throw new Error('Push notifications not configured on server');
      }
      const { publicKey } = await vapidResponse.json();

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        const newRegistration = await registerServiceWorker();
        if (!newRegistration) {
          throw new Error('Could not register service worker');
        }
        registration = newRegistration;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await apiFetch('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      toast({
        title: 'Notificações ativadas',
        description: 'Você receberá lembretes de leitura e oração.',
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
        permission: 'granted',
      }));

      return true;
    } catch (error: any) {
      console.error('[Push] Subscribe error:', error);
      toast({
        title: 'Erro ao ativar notificações',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [toast, registerServiceWorker]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await apiFetch('/api/notifications/unsubscribe', {
            method: 'POST',
            body: JSON.stringify({ endpoint: subscription.endpoint }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          await subscription.unsubscribe();
        }
      }

      toast({
        title: 'Notificações desativadas',
        description: 'Você não receberá mais lembretes.',
      });

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      console.error('[Push] Unsubscribe error:', error);
      toast({
        title: 'Erro ao desativar notificações',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [toast]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiFetch('/api/notifications/test', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Notificação enviada',
          description: 'Você deve receber uma notificação de teste em instantes.',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a notificação de teste.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
