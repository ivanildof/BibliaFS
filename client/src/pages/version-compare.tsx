import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Columns,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOffline } from "@/contexts/OfflineContext";
import { useLanguage } from "@/contexts/LanguageContext";

const BIBLE_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel",
  "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras",
  "Neemias", "Ester", "Jó", "Salmos", "Provérbios",
  "Eclesiastes", "Cantares", "Isaías", "Jeremias", "Lamentações",
  "Ezequiel", "Daniel", "Oséias", "Joel", "Amós",
  "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque",
  "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios",
  "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo",
  "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago",
  "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João",
  "Judas", "Apocalipse"
];

const VERSIONS = [
  { id: "nvi", name: "NVI", fullName: "Nova Versão Internacional" },
  { id: "acf", name: "ACF", fullName: "Almeida Corrigida Fiel" },
  { id: "arc", name: "ARC", fullName: "Almeida Revista e Corrigida" },
  { id: "ra", name: "RA", fullName: "Almeida Revista e Atualizada" },
];

interface Verse {
  number: number;
  text: string;
}

interface VersionData {
  versionId: string;
  versionName: string;
  verses: Verse[];
  isLoading: boolean;
  error?: string;
}

export default function VersionCompare() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { sqliteReady, getSqliteChapter } = useOffline();
  
  const [selectedBook, setSelectedBook] = useState("João");
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [selectedVersions, setSelectedVersions] = useState(["nvi", "acf"]);
  const [versionsData, setVersionsData] = useState<VersionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [maxChapter, setMaxChapter] = useState(21);

  const fetchChapterData = async () => {
    if (!sqliteReady) return;
    
    setIsLoading(true);
    const newData: VersionData[] = [];

    for (const versionId of selectedVersions) {
      try {
        const chapterData = await getSqliteChapter(selectedBook, selectedChapter);
        
        if (chapterData?.verses) {
          newData.push({
            versionId,
            versionName: VERSIONS.find(v => v.id === versionId)?.name || versionId.toUpperCase(),
            verses: chapterData.verses.map((v: any, i: number) => ({
              number: v.verse || i + 1,
              text: typeof v === 'string' ? v : v.text || ""
            })),
            isLoading: false,
          });
        } else {
          newData.push({
            versionId,
            versionName: VERSIONS.find(v => v.id === versionId)?.name || versionId.toUpperCase(),
            verses: [],
            isLoading: false,
            error: "Capítulo não encontrado",
          });
        }
      } catch (err) {
        newData.push({
          versionId,
          versionName: VERSIONS.find(v => v.id === versionId)?.name || versionId.toUpperCase(),
          verses: [],
          isLoading: false,
          error: "Erro ao carregar",
        });
      }
    }

    setVersionsData(newData);
    setIsLoading(false);
  };

  useEffect(() => {
    if (sqliteReady) {
      fetchChapterData();
    }
  }, [selectedBook, selectedChapter, selectedVersions, sqliteReady]);

  const toggleVersion = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      if (selectedVersions.length > 1) {
        setSelectedVersions(selectedVersions.filter(v => v !== versionId));
      }
    } else {
      if (selectedVersions.length < 3) {
        setSelectedVersions([...selectedVersions, versionId]);
      } else {
        toast({
          title: "Limite atingido",
          description: "Você pode comparar até 3 versões simultaneamente",
        });
      }
    }
  };

  const navigateChapter = (direction: number) => {
    const newChapter = selectedChapter + direction;
    if (newChapter >= 1 && newChapter <= maxChapter) {
      setSelectedChapter(newChapter);
    }
  };

  const maxVerses = Math.max(...versionsData.map(v => v.verses.length), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                <Columns className="h-6 w-6 text-white" />
              </div>
              Comparar Versões
            </h1>
            <p className="text-lg text-muted-foreground">
              Compare versículos em diferentes traduções lado a lado
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-48">
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger data-testid="select-book">
                    <SelectValue placeholder="Livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {BIBLE_BOOKS.map((book) => (
                      <SelectItem key={book} value={book}>
                        {book}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateChapter(-1)}
                  disabled={selectedChapter <= 1}
                  data-testid="button-prev-chapter"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                  min={1}
                  max={maxChapter}
                  data-testid="input-chapter"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateChapter(1)}
                  disabled={selectedChapter >= maxChapter}
                  data-testid="button-next-chapter"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex gap-2 flex-wrap">
                {VERSIONS.map((version) => (
                  <Badge
                    key={version.id}
                    variant={selectedVersions.includes(version.id) ? "default" : "outline"}
                    className="cursor-pointer toggle-elevate px-3 py-1"
                    onClick={() => toggleVersion(version.id)}
                    data-testid={`badge-version-${version.id}`}
                  >
                    {version.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {!sqliteReady || isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                {!sqliteReady ? "Inicializando banco de dados..." : "Carregando versículos..."}
              </p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-4 ${selectedVersions.length === 1 ? '' : selectedVersions.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {versionsData.map((versionData) => (
              <Card key={versionData.versionId} data-testid={`card-version-${versionData.versionId}`}>
                <CardHeader className="py-3 px-4 bg-muted/50 sticky top-0 z-10">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {versionData.versionName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[60vh]">
                    <div className="p-4 space-y-4">
                      {versionData.error ? (
                        <p className="text-muted-foreground text-center py-8">
                          {versionData.error}
                        </p>
                      ) : versionData.verses.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          Nenhum versículo encontrado
                        </p>
                      ) : (
                        versionData.verses.map((verse) => (
                          <div key={verse.number} className="group" data-testid={`verse-${versionData.versionId}-${verse.number}`}>
                            <span className="text-primary font-bold mr-2">
                              {verse.number}
                            </span>
                            <span className="text-foreground leading-relaxed">
                              {verse.text}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {versionsData.length > 0 && !isLoading && (
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {selectedBook} {selectedChapter} • {maxVerses} versículos
                </span>
                <span>
                  Comparando {selectedVersions.length} {selectedVersions.length === 1 ? 'versão' : 'versões'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
