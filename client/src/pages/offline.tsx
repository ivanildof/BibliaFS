import { useState, useEffect } from "react";
import { useOffline } from "@/contexts/OfflineContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  CloudOff,
  Cloud,
  Trash2,
  Download,
  HardDrive,
  WifiOff,
  Wifi
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function OfflinePageContent() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    isOnline,
    downloadedChapters,
    getStorageStats,
    clearAllOffline,
  } = useOffline();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [downloadedChapters]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getStorageStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleClearAll = async () => {
    if (window.confirm("Tem certeza que deseja remover todo o conteúdo offline?")) {
      await clearAllOffline();
      await loadStats();
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-muted/50 dark:bg-muted/30 blur-3xl" />
      </div>
      <div className="relative z-10 container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.offline.title}</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o conteúdo disponível para leitura sem internet
          </p>
        </div>
        <Badge variant={isOnline ? "default" : "destructive"} className="gap-2">
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {/* Storage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CloudOff className="h-4 w-4" />
              {t.offline.chapters_saved}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-chapters">
              {stats?.totalChapters || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              {t.offline.space_used}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-storage-size">
              {formatSize(stats?.totalSize || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t.offline.books_downloaded}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-books">
              {stats ? Object.keys(stats.byBook).length : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Downloaded Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Conteúdo Baixado</CardTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={!stats || stats.totalChapters === 0}
              data-testid="button-clear-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t.offline.clear_all}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : stats && stats.totalChapters > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {Object.entries(stats.byBook as Record<string, number>).map(([book, count]) => (
                  <div key={book} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{book.toUpperCase()}</div>
                      <Badge variant="secondary">{count} capítulos</Badge>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 space-y-4">
              <CloudOff className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="text-muted-foreground">
                Nenhum conteúdo baixado ainda
              </div>
              <p className="text-sm text-muted-foreground">
                Baixe capítulos para ler sem internet na página da Bíblia
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • O modo offline permite ler a Bíblia sem conexão com a internet
          </p>
          <p>
            • Use o botão de nuvem na página da Bíblia para baixar capítulos
          </p>
          <p>
            • O conteúdo fica salvo no seu dispositivo até você removê-lo
          </p>
          <p>
            • Quando offline, o app carrega automaticamente o conteúdo salvo
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function OfflinePage() {
  return (
    <ProtectedRoute>
      <OfflinePageContent />
    </ProtectedRoute>
  );
}
