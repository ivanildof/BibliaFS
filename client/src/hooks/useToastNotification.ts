import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export function useToastNotification() {
  const { toast } = useToast();

  const success = useCallback((message: string, options?: ToastOptions) => {
    toast({
      title: options?.title || 'Sucesso',
      description: message,
      duration: options?.duration || 3000,
    });
  }, [toast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    toast({
      title: options?.title || 'Erro',
      description: message,
      variant: 'destructive',
      duration: options?.duration || 5000,
    });
  }, [toast]);

  const loading = useCallback((message: string, options?: ToastOptions) => {
    toast({
      title: options?.title || 'Carregando...',
      description: message,
      duration: options?.duration || 2000,
    });
  }, [toast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    toast({
      title: options?.title || 'Informação',
      description: message,
      duration: options?.duration || 3000,
    });
  }, [toast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    toast({
      title: options?.title || 'Atenção',
      description: message,
      duration: options?.duration || 4000,
    });
  }, [toast]);

  return {
    success,
    error,
    loading,
    info,
    warning,
  };
}
