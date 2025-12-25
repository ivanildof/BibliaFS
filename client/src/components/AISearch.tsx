import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, BookOpen, Sparkles, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface SearchResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  relevance: string;
}

interface AISearchResponse {
  query: string;
  results: SearchResult[];
  summary: string;
}

export function AISearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string): Promise<AISearchResponse> => {
      const response = await apiRequest("POST", "/api/bible/ai-search", { query: searchQuery });
      return response.json();
    },
    onError: (error: any) => {
      toast({
        title: "Erro na busca",
        description: error.message || "Não foi possível realizar a busca.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 3) {
      toast({
        title: "Busca muito curta",
        description: "Digite pelo menos 3 caracteres para buscar.",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate(query);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pergunte sobre qualquer tema bíblico..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-10 pr-24"
            data-testid="input-ai-search"
          />
          <Button
            type="submit"
            size="sm"
            disabled={searchMutation.isPending || query.trim().length < 3}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
            data-testid="button-ai-search"
          >
            {searchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </form>

      {isOpen && (searchMutation.data || searchMutation.isPending) && (
        <Card className="absolute z-50 w-full mt-2 shadow-xl border-primary/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Resultados da Busca IA
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-search"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {searchMutation.isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Buscando versículos...</span>
              </div>
            ) : searchMutation.data ? (
              <div className="space-y-4">
                {searchMutation.data.summary && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">{searchMutation.data.summary}</p>
                  </div>
                )}
                
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {searchMutation.data.results.map((result, index) => (
                      <Link
                        key={index}
                        href={`/bible?book=${result.book}&chapter=${result.chapter}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Card className="cursor-pointer hover-elevate transition-all" data-testid={`card-search-result-${index}`}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <BookOpen className="h-4 w-4 text-primary" />
                                  <span className="font-semibold text-sm">{result.reference}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {result.relevance}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  "{result.text}"
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>

                {searchMutation.data.results.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum versículo encontrado para sua busca.
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
