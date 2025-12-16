import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2, Search as SearchIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  abbrev?: string;
}

// Map book names to abbreviations
const BOOK_ABBREV_MAP: { [key: string]: string } = {
  "Genesis": "gn", "Exodus": "ex", "Leviticus": "lv", "Numbers": "nm", "Deuteronomy": "dt",
  "Joshua": "js", "Judges": "jz", "Ruth": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
  "1 Kings": "1rs", "2 Kings": "2rs", "1 Chronicles": "1cr", "2 Chronicles": "2cr",
  "Ezra": "ed", "Nehemiah": "ne", "Esther": "et", "Job": "job", "Psalms": "sl", "Proverbs": "pv",
  "Ecclesiastes": "ec", "Song of Solomon": "ct", "Isaiah": "is", "Jeremiah": "jr",
  "Lamentations": "lm", "Ezekiel": "ez", "Daniel": "dn", "Hosea": "os", "Joel": "jl",
  "Amos": "am", "Obadiah": "ob", "Jonah": "jn", "Micah": "mq", "Nahum": "na",
  "Habakkuk": "hc", "Zephaniah": "sf", "Haggai": "ag", "Zechariah": "zc", "Malachi": "ml",
  "Matthew": "mt", "Mark": "mc", "Luke": "lc", "John": "jo", "Acts": "at",
  "Romans": "rm", "1 Corinthians": "1co", "2 Corinthians": "2co", "Galatians": "gl",
  "Ephesians": "ef", "Philippians": "fp", "Colossians": "cl", "1 Thessalonians": "1ts",
  "2 Thessalonians": "2ts", "1 Timothy": "1tm", "2 Timothy": "2tm", "Titus": "tt",
  "Philemon": "fm", "Hebrews": "hb", "James": "tg", "1 Peter": "1pe", "2 Peter": "2pe",
  "1 John": "1jo", "2 John": "2jo", "3 John": "3jo", "Jude": "jd", "Revelation": "ap"
};

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

  // Search handler - calls optimized backend API
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

    try {
      // Call optimized backend search endpoint
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&version=${selectedVersion}`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      const searchResults: SearchResult[] = await response.json();
      setResults(searchResults || []);
    } catch (error) {
      console.error("[Search] Error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
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
                  <Link
                    key={idx}
                    href={`/bible-reader?book=${result.abbrev}&chapter=${result.chapter}&verse=${result.verse}&version=${result.version}`}
                  >
                    <Card className="p-4 hover-elevate cursor-pointer" data-testid={`result-card-${idx}`}>
                      <div className="flex gap-3">
                        <BookOpen className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm">
                              {result.book} {result.chapter}:{result.verse}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {result.version.toUpperCase()}
                              </span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.text}
                            {result.text.length >= 150 && "..."}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
