import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2, Search as SearchIcon } from "lucide-react";

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

const VERSIONS = ["nvi", "acf", "arc", "ra"];
const LANGUAGES = ["pt", "en", "es", "nl"];

export default function Search() {
  const [query, setQuery] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("nvi");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("bibleSearchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Search handler
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem("bibleSearchHistory", JSON.stringify(newHistory));

    // Map of book abbreviations
    const bookMap: { [key: string]: string } = {
      "gn": "Genesis", "ex": "Exodus", "lv": "Leviticus", "nm": "Numbers", "dt": "Deuteronomy",
      "js": "Joshua", "jz": "Judges", "rt": "Ruth", "1sm": "1 Samuel", "2sm": "2 Samuel",
      "1rs": "1 Kings", "2rs": "2 Kings", "1cr": "1 Chronicles", "2cr": "2 Chronicles",
      "ed": "Ezra", "ne": "Nehemiah", "et": "Esther", "job": "Job", "sl": "Psalms", "pv": "Proverbs",
      "ec": "Ecclesiastes", "ct": "Song of Solomon", "is": "Isaiah", "jr": "Jeremiah",
      "lm": "Lamentations", "ez": "Ezekiel", "dn": "Daniel", "os": "Hosea", "jl": "Joel",
      "am": "Amos", "ob": "Obadiah", "jn": "Jonah", "mq": "Micah", "na": "Nahum",
      "hc": "Habakkuk", "sf": "Zephaniah", "ag": "Haggai", "zc": "Zechariah", "ml": "Malachi",
      "mt": "Matthew", "mc": "Mark", "lc": "Luke", "jo": "John", "at": "Acts",
      "rm": "Romans", "1co": "1 Corinthians", "2co": "2 Corinthians", "gl": "Galatians",
      "ef": "Ephesians", "fp": "Philippians", "cl": "Colossians", "1ts": "1 Thessalonians",
      "2ts": "2 Thessalonians", "1tm": "1 Timothy", "2tm": "2 Timothy", "tt": "Titus",
      "fm": "Philemon", "hb": "Hebrews", "tg": "James", "1pe": "1 Peter", "2pe": "2 Peter",
      "1jo": "1 John", "2jo": "2 John", "3jo": "3 John", "jd": "Jude", "ap": "Revelation"
    };

    const bookAbbrevs = Object.keys(bookMap);
    const searchResults: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    // Build list of URLs - search all 66 books, chapters 1-50
    const urls: { url: string; book: string; chapter: number }[] = [];
    for (const abbrev of bookAbbrevs) {
      for (let ch = 1; ch <= 50; ch++) {
        urls.push({
          url: `/api/bible/multilang/pt/${selectedVersion}/${abbrev}/${ch}`,
          book: bookMap[abbrev],
          chapter: ch
        });
      }
    }

    // Fetch all in parallel with proper error handling
    const fetches = urls.map(item =>
      fetch(item.url, { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then(data => ({ data, ...item }))
        .catch(() => null)
    );

    const results = await Promise.all(fetches);
    
    for (const result of results) {
      if (!result?.data?.verses) continue;
      
      for (let idx = 0; idx < result.data.verses.length; idx++) {
        const verseText = result.data.verses[idx];
        if (verseText && verseText.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            book: result.book,
            chapter: result.chapter,
            verse: idx + 1,
            text: verseText.substring(0, 150),
            version: selectedVersion
          });
        }
      }
    }

    // Remove duplicates and sort
    const uniqueResults = Array.from(
      new Map(
        searchResults.map(r => [
          `${r.book}-${r.chapter}-${r.verse}`,
          r
        ])
      ).values()
    ).slice(0, 100); // Limit to 100 results

    setResults(uniqueResults);
    setIsSearching(false);
  };

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    if (query.trim()) {
      handleSearch(query);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <SearchIcon className="w-6 h-6" />
            Buscar Bíblia
          </h1>

          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              data-testid="input-search-query"
              placeholder="Digite uma palavra, versículo ou tema..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(query);
                }
              }}
              className="flex-1"
            />
            <Button
              data-testid="button-search"
              onClick={() => handleSearch(query)}
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
            </Button>
          </div>

          {/* Version Tabs */}
          <div className="mt-4">
            <Tabs value={selectedVersion} onValueChange={handleVersionChange}>
              <TabsList className="w-full grid grid-cols-4">
                {VERSIONS.map(v => (
                  <TabsTrigger 
                    key={v} 
                    value={v}
                    data-testid={`tab-version-${v}`}
                  >
                    {v.toUpperCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {query.trim() === "" && searchHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                Histórico de Buscas
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, idx) => (
                  <Button
                    key={idx}
                    data-testid={`button-history-${idx}`}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {!isSearching && results.length === 0 && query.trim() !== "" && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum resultado encontrado
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} resultados encontrados
              </p>

              <div className="space-y-3">
                {results.map((result, idx) => (
                  <Card key={idx} className="p-4 hover-elevate cursor-pointer" data-testid={`result-card-${idx}`}>
                    <div className="flex gap-3">
                      <BookOpen className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm">
                            {result.book} {result.chapter}:{result.verse}
                          </h3>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {result.version.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.text}
                          {result.text.length >= 150 && "..."}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
