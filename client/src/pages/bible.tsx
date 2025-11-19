import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Highlighter,
  StickyNote,
  Type
} from "lucide-react";

const highlightColors = [
  { name: "Amarelo", value: "yellow", class: "bg-yellow-200 dark:bg-yellow-900/40" },
  { name: "Verde", value: "green", class: "bg-green-200 dark:bg-green-900/40" },
  { name: "Azul", value: "blue", class: "bg-blue-200 dark:bg-blue-900/40" },
  { name: "Roxo", value: "purple", class: "bg-purple-200 dark:bg-purple-900/40" },
  { name: "Rosa", value: "pink", class: "bg-pink-200 dark:bg-pink-900/40" },
  { name: "Laranja", value: "orange", class: "bg-orange-200 dark:bg-orange-900/40" },
];

// Sample Bible books (in Portuguese)
const bibleBooks = [
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

export default function Bible() {
  const [selectedBook, setSelectedBook] = useState("João");
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [fontSize, setFontSize] = useState(18);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  // Sample verses from John 3
  const sampleVerses = [
    { verse: 1, text: "Havia, entre os fariseus, um homem chamado Nicodemos, um dos principais dos judeus." },
    { verse: 2, text: "Este, de noite, foi ter com Jesus e lhe disse: Rabi, sabemos que és Mestre vindo da parte de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não estiver com ele." },
    { verse: 3, text: "A isto, respondeu Jesus: Em verdade, em verdade te digo que, se alguém não nascer de novo, não pode ver o reino de Deus." },
    { verse: 16, text: "Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna." },
    { verse: 17, text: "Porquanto Deus enviou o seu Filho ao mundo, não para que julgasse o mundo, mas para que o mundo fosse salvo por ele." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Toolbar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" data-testid="button-prev-chapter">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className="w-40" data-testid="select-book">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bibleBooks.map((book) => (
                    <SelectItem key={book} value={book}>
                      {book}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedChapter.toString()} onValueChange={(v) => setSelectedChapter(parseInt(v))}>
                <SelectTrigger className="w-24" data-testid="select-chapter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((ch) => (
                    <SelectItem key={ch} value={ch.toString()}>
                      Cap. {ch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" data-testid="button-next-chapter">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Font Size Controls */}
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                data-testid="button-decrease-font"
              >
                A-
              </Button>
              <span className="text-sm min-w-12 text-center">{fontSize}px</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                data-testid="button-increase-font"
              >
                A+
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Highlight Tool */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-highlight-tool">
                  <Highlighter className="h-4 w-4 mr-2" />
                  Destacar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Cores de Destaque</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {highlightColors.map((color) => (
                      <button
                        key={color.value}
                        className={`${color.class} rounded-md p-3 border-2 border-transparent hover:border-primary transition-colors`}
                        data-testid={`button-highlight-${color.value}`}
                      >
                        <span className="sr-only">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search */}
            <div className="ml-auto flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar na Bíblia..." 
                  className="pl-9"
                  data-testid="input-search-bible"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bible Reading Area */}
      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <Card className="border-none shadow-none">
          <CardHeader className="text-center pb-8">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">{selectedBook}</Badge>
              <CardTitle className="font-display text-3xl md:text-4xl">
                Capítulo {selectedChapter}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6 font-serif" style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
              {sampleVerses.map((item) => (
                <div 
                  key={item.verse} 
                  className="group relative"
                  data-testid={`verse-${item.verse}`}
                >
                  <span className="absolute -left-12 top-0 text-sm font-sans text-muted-foreground select-none">
                    {item.verse}
                  </span>
                  <p
                    className={`cursor-pointer rounded px-2 py-1 transition-colors ${
                      selectedVerse === item.verse ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedVerse(item.verse)}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Verse Actions (appears when verse is selected) */}
            {selectedVerse && (
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{selectedBook} {selectedChapter}:{selectedVerse}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" data-testid="button-add-note">
                    <StickyNote className="h-4 w-4 mr-2" />
                    Adicionar Nota
                  </Button>
                  <Button size="sm" variant="outline" data-testid="button-share-verse">
                    Compartilhar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
