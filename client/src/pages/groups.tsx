import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Lock,
  Globe,
  UserPlus,
  LogOut,
  Settings,
  MessageCircle,
  BookOpen,
  Loader2,
  Crown
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface Group {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  maxMembers?: number;
  leaderId: string;
  createdAt: string;
  role?: string;
  joinedAt?: string;
}

interface GroupMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  userName?: string;
  userEmail?: string;
  userImage?: string;
}

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const { data: allGroups = [], isLoading: loadingAll } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    retry: 2,
  });

  const { data: myGroups = [], isLoading: loadingMy } = useQuery<Group[]>({
    queryKey: ["/api/groups/my"],
    retry: 2,
  });

  const { data: groupMembers = [] } = useQuery<GroupMember[]>({
    queryKey: ["/api/groups", selectedGroup?.id, "members"],
    enabled: !!selectedGroup,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Grupo criado!",
        description: "Seu grupo de estudo foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("POST", `/api/groups/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      toast({
        title: "Bem-vindo ao grupo!",
        description: "Você agora é membro deste grupo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao entrar no grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("POST", `/api/groups/${groupId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      setSelectedGroup(null);
      toast({
        title: "Você saiu do grupo",
        description: "Você não é mais membro deste grupo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao sair do grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const isLoading = loadingAll || loadingMy;
  const publicGroups = allGroups.filter(g => g.isPublic);
  const myGroupIds = new Set(myGroups.map(g => g.id));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando grupos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                <Users className="h-6 w-6 text-white" />
              </div>
              Grupos de Estudo
            </h1>
            <p className="text-lg text-muted-foreground">
              Conecte-se com outros estudantes da Bíblia
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-group">
                <Plus className="h-5 w-5 mr-2" />
                Criar Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Grupo</DialogTitle>
                <DialogDescription>
                  Crie um grupo para estudar a Bíblia com outras pessoas
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Grupo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Grupo de Estudo de Romanos"
                            data-testid="input-group-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o propósito do grupo..."
                            data-testid="textarea-group-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Grupo Público</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Qualquer pessoa pode encontrar e participar
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-is-public"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      data-testid="button-save-group"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Criar Grupo"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="my-groups" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-groups" data-testid="tab-my-groups">
              Meus Grupos ({myGroups.length})
            </TabsTrigger>
            <TabsTrigger value="discover" data-testid="tab-discover">
              Descobrir ({publicGroups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups">
            {myGroups.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhum grupo ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie um grupo ou encontre um para participar
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-group">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Grupo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.map((group) => (
                  <Card key={group.id} className="hover-elevate" data-testid={`card-group-${group.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {group.name}
                            {group.role === "leader" && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {group.description || "Sem descrição"}
                          </CardDescription>
                        </div>
                        <Badge variant={group.isPublic ? "secondary" : "outline"}>
                          {group.isPublic ? (
                            <><Globe className="h-3 w-3 mr-1" /> Público</>
                          ) : (
                            <><Lock className="h-3 w-3 mr-1" /> Privado</>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Membro desde {group.joinedAt ? formatDistanceToNow(new Date(group.joinedAt), { addSuffix: true, locale: ptBR }) : "agora"}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedGroup(group)}
                        data-testid={`button-view-group-${group.id}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ver Grupo
                      </Button>
                      {group.role !== "leader" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => leaveMutation.mutate(group.id)}
                          disabled={leaveMutation.isPending}
                          data-testid={`button-leave-${group.id}`}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover">
            {publicGroups.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Globe className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Nenhum grupo público</h3>
                  <p className="text-muted-foreground">
                    Seja o primeiro a criar um grupo público!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicGroups.map((group) => {
                  const isMember = myGroupIds.has(group.id);
                  
                  return (
                    <Card key={group.id} className="hover-elevate" data-testid={`card-discover-${group.id}`}>
                      <CardHeader>
                        <CardTitle>{group.name}</CardTitle>
                        <CardDescription>
                          {group.description || "Sem descrição"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>Grupo de estudo bíblico</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {isMember ? (
                          <Badge variant="secondary" className="w-full justify-center py-2">
                            Você já é membro
                          </Badge>
                        ) : (
                          <Button 
                            className="w-full"
                            onClick={() => joinMutation.mutate(group.id)}
                            disabled={joinMutation.isPending}
                            data-testid={`button-join-${group.id}`}
                          >
                            {joinMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Participar
                              </>
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedGroup && (
          <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedGroup.name}
                  {selectedGroup.isPublic ? (
                    <Badge variant="secondary"><Globe className="h-3 w-3 mr-1" /> Público</Badge>
                  ) : (
                    <Badge variant="outline"><Lock className="h-3 w-3 mr-1" /> Privado</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selectedGroup.description || "Grupo de estudo bíblico"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Membros ({groupMembers.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {groupMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.userImage || ""} />
                          <AvatarFallback>
                            {member.userName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.userName || "Usuário"}</p>
                          <p className="text-xs text-muted-foreground">{member.userEmail}</p>
                        </div>
                        {member.role === "leader" && (
                          <Badge variant="secondary">
                            <Crown className="h-3 w-3 mr-1" />
                            Líder
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedGroup(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
