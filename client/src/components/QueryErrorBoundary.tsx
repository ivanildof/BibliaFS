import { ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  error?: Error | null;
  isError?: boolean;
  onRetry?: () => void;
  customMessage?: string;
}

export function QueryErrorBoundary({
  children,
  error,
  isError,
  onRetry,
  customMessage,
}: QueryErrorBoundaryProps) {
  if (isError && error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>
            <div className="space-y-4">
              <p>{customMessage || error.message || 'Ocorreu um erro inesperado.'}</p>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

interface LoadingBoundaryProps {
  children: ReactNode;
  isLoading?: boolean;
  fallback?: ReactNode;
}

export function LoadingBoundary({ children, isLoading, fallback }: LoadingBoundaryProps) {
  if (isLoading) {
    return (
      <>
        {fallback || (
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
