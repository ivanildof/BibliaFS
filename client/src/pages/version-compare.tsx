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

// Multilingual Bible Books
const BIBLE_BOOKS = {
  pt: [
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
  ],
  en: [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Songs", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation"
  ],
  nl: [
  "Genesis", "Exodus", "Leviticus", "Numeri", "Deuteronomium",
  "Jozua", "Richteren", "Ruth", "1 Samuel", "2 Samuel",
  "1 Koningen", "2 Koningen", "1 Kronieken", "2 Kronieken", "Ezra",
  "Nehemia", "Esther", "Job", "Psalmen", "Spreuken",
  "Prediker", "Hooglied", "Jesaja", "Jeremia", "Klaagliederen",
  "Ezechiël", "Daniël", "Hosea", "Joël", "Amos",
  "Obadja", "Jona", "Micha", "Nahum", "Habakuk",
  "Zefanja", "Haggaï", "Zacharia", "Maleachi",
  "Mattheus", "Markus", "Lukas", "Johannes", "Handelingen",
  "Romeinen", "1 Corinthiërs", "2 Corinthiërs", "Galaten", "Efeziërs",
  "Filippenzen", "Colossenzen", "1 Thessalonicenzen", "2 Thessalonicenzen", "1 Timoteüs",
  "2 Timoteüs", "Titus", "Filemon", "Hebreeën", "Jakobus",
  "1 Petrus", "2 Petrus", "1 Johannes", "2 Johannes", "3 Johannes",
  "Judas", "Openbaring"
  ],
  es: [
  "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio",
  "Josué", "Jueces", "Rut", "1 Samuel", "2 Samuel",
  "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras",
  "Nehemías", "Ester", "Job", "Salmos", "Proverbios",
  "Eclesiastés", "Cantar de los Cantares", "Isaías", "Jeremías", "Lamentaciones",
  "Ezequiel", "Daniel", "Oseas", "Joel", "Amós",
  "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc",
  "Sofonías", "Ageo", "Zacarías", "Malaquías",
  "Mateo", "Marcos", "Lucas", "Juan", "Hechos",
  "Romanos", "1 Corintios", "2 Corintios", "Gálatas", "Efesios",
  "Filipenses", "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses", "1 Timoteo",
  "2 Timoteo", "Tito", "Filemón", "Hebreos", "Santiago",
  "1 Pedro", "2 Pedro", "1 Juan", "2 Juan", "3 Juan",
  "Judas", "Apocalipsis"
  ]
};

// Map book names to SQLite abbreviations (universal for all languages)
const bookNameToAbbrev: { [lang: string]: { [key: string]: string } } = {
  pt: {
  "Gênesis": "gn", "Êxodo": "ex", "Levítico": "lv", "Números": "nm", "Deuteronômio": "dt",
  "Josué": "js", "Juízes": "jz", "Rute": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
  "1 Reis": "1rs", "2 Reis": "2rs", "1 Crônicas": "1cr", "2 Crônicas": "2cr", "Esdras": "esd",
  "Neemias": "ne", "Ester": "et", "Jó": "jó", "Salmos": "sl", "Provérbios": "pv",
  "Eclesiastes": "ec", "Cantares": "ct", "Isaías": "is", "Jeremias": "jr", "Lamentações": "lm",
  "Ezequiel": "ez", "Daniel": "dn", "Oséias": "os", "Joel": "jl", "Amós": "am",
  "Obadias": "ob", "Jonas": "jn", "Miquéias": "mq", "Naum": "na", "Habacuque": "hc",
  "Sofonias": "sf", "Ageu": "ag", "Zacarias": "zc", "Malaquias": "ml",
  "Mateus": "mt", "Marcos": "mc", "Lucas": "lc", "João": "jo", "Atos": "at",
  "Romanos": "rm", "1 Coríntios": "1co", "2 Coríntios": "2co", "Gálatas": "gl", "Efésios": "ef",
  "Filipenses": "fp", "Colossenses": "cl", "1 Tessalonicenses": "1ts", "2 Tessalonicenses": "2ts", "1 Timóteo": "1tm",
  "2 Timóteo": "2tm", "Tito": "tt", "Filemom": "fm", "Hebreus": "hb", "Tiago": "tg",
  "1 Pedro": "1pd", "2 Pedro": "2pd", "1 João": "1jo", "2 João": "2jo", "3 João": "3jo",
  "Judas": "jd", "Apocalipse": "ap"
  },
  en: {
  "Genesis": "gn", "Exodus": "ex", "Leviticus": "lv", "Numbers": "nm", "Deuteronomy": "dt",
  "Joshua": "js", "Judges": "jz", "Ruth": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
  "1 Kings": "1rs", "2 Kings": "2rs", "1 Chronicles": "1cr", "2 Chronicles": "2cr", "Ezra": "esd",
  "Nehemiah": "ne", "Esther": "et", "Job": "jó", "Psalms": "sl", "Proverbs": "pv",
  "Ecclesiastes": "ec", "Song of Songs": "ct", "Isaiah": "is", "Jeremiah": "jr", "Lamentations": "lm",
  "Ezekiel": "ez", "Daniel": "dn", "Hosea": "os", "Joel": "jl", "Amos": "am",
  "Obadiah": "ob", "Jonah": "jn", "Micah": "mq", "Nahum": "na", "Habakkuk": "hc",
  "Zephaniah": "sf", "Haggai": "ag", "Zechariah": "zc", "Malachi": "ml",
  "Matthew": "mt", "Mark": "mc", "Luke": "lc", "John": "jo", "Acts": "at",
  "Romans": "rm", "1 Corinthians": "1co", "2 Corinthians": "2co", "Galatians": "gl", "Ephesians": "ef",
  "Philippians": "fp", "Colossians": "cl", "1 Thessalonians": "1ts", "2 Thessalonians": "2ts", "1 Timothy": "1tm",
  "2 Timothy": "2tm", "Titus": "tt", "Philemon": "fm", "Hebrews": "hb", "James": "tg",
  "1 Peter": "1pd", "2 Peter": "2pd", "1 John": "1jo", "2 John": "2jo", "3 John": "3jo",
  "Jude": "jd", "Revelation": "ap"
  },
  nl: {
  "Genesis": "gn", "Exodus": "ex", "Leviticus": "lv", "Numeri": "nm", "Deuteronomium": "dt",
  "Jozua": "js", "Richteren": "jz", "Ruth": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
  "1 Koningen": "1rs", "2 Koningen": "2rs", "1 Kronieken": "1cr", "2 Kronieken": "2cr", "Ezra": "esd",
  "Nehemia": "ne", "Esther": "et", "Job": "jó", "Psalmen": "sl", "Spreuken": "pv",
  "Prediker": "ec", "Hooglied": "ct", "Jesaja": "is", "Jeremia": "jr", "Klaagliederen": "lm",
  "Ezechiël": "ez", "Daniël": "dn", "Hosea": "os", "Joël": "jl", "Amos": "am",
  "Obadja": "ob", "Jona": "jn", "Micha": "mq", "Nahum": "na", "Habakuk": "hc",
  "Zefanja": "sf", "Haggaï": "ag", "Zacharia": "zc", "Maleachi": "ml",
  "Mattheus": "mt", "Markus": "mc", "Lukas": "lc", "Johannes": "jo", "Handelingen": "at",
  "Romeinen": "rm", "1 Corinthiërs": "1co", "2 Corinthiërs": "2co", "Galaten": "gl", "Efeziërs": "ef",
  "Filippenzen": "fp", "Colossenzen": "cl", "1 Thessalonicenzen": "1ts", "2 Thessalonicenzen": "2ts", "1 Timoteüs": "1tm",
  "2 Timoteüs": "2tm", "Titus": "tt", "Filemon": "fm", "Hebreeën": "hb", "Jakobus": "tg",
  "1 Petrus": "1pd", "2 Petrus": "2pd", "1 Johannes": "1jo", "2 Johannes": "2jo", "3 Johannes": "3jo",
  "Judas": "jd", "Openbaring": "ap"
  },
  es: {
  "Génesis": "gn", "Éxodo": "ex", "Levítico": "lv", "Números": "nm", "Deuteronomio": "dt",
  "Josué": "js", "Jueces": "jz", "Rut": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
  "1 Reyes": "1rs", "2 Reyes": "2rs", "1 Crónicas": "1cr", "2 Crónicas": "2cr", "Esdras": "esd",
  "Nehemías": "ne", "Ester": "et", "Job": "jó", "Salmos": "sl", "Proverbios": "pv",
  "Eclesiastés": "ec", "Cantar de los Cantares": "ct", "Isaías": "is", "Jeremías": "jr", "Lamentaciones": "lm",
  "Ezequiel": "ez", "Daniel": "dn", "Oseas": "os", "Joel": "jl", "Amós": "am",
  "Abdías": "ob", "Jonás": "jn", "Miqueas": "mq", "Nahúm": "na", "Habacuc": "hc",
  "Sofonías": "sf", "Ageo": "ag", "Zacarías": "zc", "Malaquías": "ml",
  "Mateo": "mt", "Marcos": "mc", "Lucas": "lc", "Juan": "jo", "Hechos": "at",
  "Romanos": "rm", "1 Corintios": "1co", "2 Corintios": "2co", "Gálatas": "gl", "Efesios": "ef",
  "Filipenses": "fp", "Colosenses": "cl", "1 Tesalonicenses": "1ts", "2 Tesalonicenses": "2ts", "1 Timoteo": "1tm",
  "2 Timoteo": "2tm", "Tito": "tt", "Filemón": "fm", "Hebreos": "hb", "Santiago": "tg",
  "1 Pedro": "1pd", "2 Pedro": "2pd", "1 Juan": "1jo", "2 Juan": "2jo", "3 Juan": "3jo",
  "Judas": "jd", "Apocalipsis": "ap"
  }
};

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
  const { language } = useLanguage();
  const { sqliteReady, getSqliteChapter } = useOffline();
  
  // Get books for current language, default to first book
  const currentBooks = BIBLE_BOOKS[language as keyof typeof BIBLE_BOOKS] || BIBLE_BOOKS.pt;
  const bookMapping = bookNameToAbbrev[language as keyof typeof bookNameToAbbrev] || bookNameToAbbrev.pt;
  
  const [selectedBook, setSelectedBook] = useState(currentBooks[42]); // John
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [selectedVersions, setSelectedVersions] = useState(["nvi", "acf"]);
  const [versionsData, setVersionsData] = useState<VersionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [maxChapter, setMaxChapter] = useState(21);

  // Fallback: fetch from API when SQLite is not available
  const fetchChapterFromAPI = async (versionId: string, abbrev: string, chapter: number) => {
    try {
      const response = await fetch(`/api/bible/${versionId}/${abbrev}/${chapter}`);
      if (!response.ok) throw new Error("API fetch failed");
      return await response.json();
    } catch (err) {
      console.warn(`[VersionCompare] API fallback failed for ${versionId}/${abbrev}/${chapter}`);
      return null;
    }
  };

  const fetchChapterData = async () => {
    setIsLoading(true);
    const newData: VersionData[] = [];

    for (const versionId of selectedVersions) {
      try {
        const abbrev = bookMapping[selectedBook] || selectedBook.toLowerCase();
        let chapterData = null;
        
        // Try SQLite first if available
        if (sqliteReady) {
          chapterData = await getSqliteChapter(abbrev, selectedChapter);
        }
        
        // Fallback to API if SQLite not ready or didn't return data
        if (!chapterData?.verses) {
          chapterData = await fetchChapterFromAPI(versionId, abbrev, selectedChapter);
        }
        
        if (chapterData?.verses) {
          newData.push({
            versionId,
            versionName: VERSIONS.find(v => v.id === versionId)?.name || versionId.toUpperCase(),
            verses: chapterData.verses.map((v: any, i: number) => ({
              number: v.verse || v.number || i + 1,
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
    // Fetch data immediately - fallback to API if SQLite not ready
    fetchChapterData();
  }, [selectedBook, selectedChapter, selectedVersions, sqliteReady, language]);

  // Update selected book when language changes
  useEffect(() => {
    setSelectedBook(currentBooks[42]); // Reset to John in new language
  }, [language]);

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
                    {currentBooks.map((book) => (
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
