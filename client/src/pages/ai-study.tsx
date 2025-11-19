import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Brain, 
  Send, 
  BookOpen, 
  MessageCircle,
  Lightbulb,
  History
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestionPrompts = [
  "O que significa 'olho por olho' em Êxodo 21?",
  "Qual a diferença entre predestinação calvinista e arminiana?",
  "Resuma o livro de Ezequiel em 3 parágrafos",
  "O que Jesus quis dizer com 'nascer de novo'?",
  "Explique o contexto histórico do livro de Daniel",
];

export default function AIStudy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      return await apiRequest("POST", "/api/ai/study", { question });
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + "_assistant",
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      }]);
    },
    onError: (error) => {
      toast({
        title: "Erro ao consultar IA",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    askMutation.mutate(input);
    setInput("");
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold" data-testid="text-page-title">
                Estudar com IA
              </h1>
              <p className="text-muted-foreground">
                Assistente teológico inteligente
              </p>
            </div>
          </div>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Como usar o Assistente IA</p>
                  <p className="text-muted-foreground">
                    Faça perguntas sobre textos bíblicos, doutrinas, contexto histórico e interpretações teológicas. 
                    A IA utiliza comentários clássicos e dicionários bíblicos confiáveis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Conversa com IA
                </CardTitle>
              </CardHeader>
              
              <Separator />
              
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Comece uma conversa</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Faça uma pergunta teológica ou use uma das sugestões abaixo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${message.role}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                            <Brain className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                        
                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={user?.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {user?.firstName?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {askMutation.isPending && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
              
              <Separator />
              
              <div className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Faça sua pergunta teológica..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    className="min-h-[60px] resize-none"
                    data-testid="textarea-ai-question"
                  />
                  <Button 
                    onClick={handleSubmit}
                    disabled={!input.trim() || askMutation.isPending}
                    size="icon"
                    className="h-[60px] w-[60px] shrink-0"
                    data-testid="button-send-question"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sugestões</CardTitle>
                <CardDescription>Perguntas populares</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestionPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleSuggestionClick(prompt)}
                    data-testid={`button-suggestion-${index}`}
                  >
                    <BookOpen className="h-4 w-4 mr-2 shrink-0" />
                    <span className="text-sm">{prompt}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Recent Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm p-2 rounded hover-elevate cursor-pointer">
                    <Badge variant="secondary" className="mt-0.5">João 3:16</Badge>
                    <p className="text-muted-foreground line-clamp-2">
                      Contexto de "Deus amou o mundo"
                    </p>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-2 text-sm p-2 rounded hover-elevate cursor-pointer">
                    <Badge variant="secondary" className="mt-0.5">Gênesis 1</Badge>
                    <p className="text-muted-foreground line-clamp-2">
                      Criação em 6 dias - literal?
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
