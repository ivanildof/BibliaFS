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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Plus, 
  Lock,
  Globe,
  UserPlus,
  LogOut,
  MessageCircle,
  BookOpen,
  Loader2,
  Crown,
  Send,
  Mail,
  Phone,
  Copy,
  Check,
  ArrowLeft
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

const inviteSchema = z.object({
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
});

const messageSchema = z.object({
  content: z.string().min(1, "Mensagem não pode estar vazia").max(2000),
});

type FormData = z.infer<typeof formSchema>;
type InviteFormData = z.infer<typeof inviteSchema>;
type MessageFormData = z.infer<typeof messageSchema>;

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

interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  verseReference?: string;
  verseText?: string;
  messageType: string;
  createdAt: string;
  user: {
    id: string;
    displayName?: string;
    profileImageUrl?: string;
  };
}

interface GroupInvite {
  id: string;
  groupId: string;
  inviteCode: string;
  invitedEmail?: string;
  invitedPhone?: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "members" | "invites">("chat");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isJoinByCodeDialogOpen, setIsJoinByCodeDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const { data: groupMessages = [], isLoading: loadingMessages } = useQuery<GroupMessage[]>({
    queryKey: ["/api/groups", selectedGroup?.id, "messages"],
    enabled: !!selectedGroup,
    refetchInterval: 5000,
  });

  const { data: groupInvites = [] } = useQuery<GroupInvite[]>({
    queryKey: ["/api/groups", selectedGroup?.id, "invites"],
    enabled: !!selectedGroup && (selectedGroup.role === "leader" || selectedGroup.role === "moderator"),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });

  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData): Promise<Group> => {
      const res = await apiRequest("POST", "/api/groups", data);
      return res.json();
    },
    onSuccess: (newGroup: Group) => {
      queryClient.setQueryData(["/api/groups"], (oldData: Group[] = []) => [
        newGroup,
        ...oldData,
      ]);
      
      queryClient.setQueryData(["/api/groups/my"], (oldData: Group[] = []) => [
        {
          ...newGroup,
          role: newGroup.role || "leader",
          joinedAt: newGroup.joinedAt || new Date().toISOString(),
        },
        ...oldData,
      ]);
      
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Grupo criado!",
        description: "Seu grupo de estudo foi criado com sucesso.",
      });
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
        queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      }, 500);
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

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      return await apiRequest("POST", `/api/groups/${selectedGroup?.id}/messages`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "messages"] });
      messageForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createInviteMutation = useMutation({
    mutationFn: async (data: InviteFormData): Promise<GroupInvite> => {
      const res = await apiRequest("POST", `/api/groups/${selectedGroup?.id}/invites`, data);
      return res.json();
    },
    onSuccess: (invite: GroupInvite) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "invites"] });
      inviteForm.reset();
      setIsInviteDialogOpen(false);
      toast({
        title: "Convite criado!",
        description: `Código: ${invite.inviteCode} - Compartilhe com quem deseja convidar.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/invites/accept", { code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      setIsJoinByCodeDialogOpen(false);
      setInviteCode("");
      toast({
        title: "Bem-vindo ao grupo!",
        description: "Você agora é membro deste grupo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao usar código",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const onSendMessage = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const onCreateInvite = (data: InviteFormData) => {
    if (!data.email && !data.phone) {
      toast({
        title: "Erro",
        description: "Informe um email ou telefone",
        variant: "destructive",
      });
      return;
    }
    createInviteMutation.mutate(data);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Código copiado!",
      description: "Compartilhe este código com quem deseja convidar.",
    });
  };

  const isLoading = loadingAll || loadingMy;
  const publicGroups = allGroups.filter(g => g.isPublic);
  const myGroupIds = new Set(myGroups.map(g => g.id));

  // Group detail view
  if (selectedGroup) {
    const isLeaderOrMod = selectedGroup.role === "leader" || selectedGroup.role === "moderator";
    
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedGroup(null)}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos grupos
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    {selectedGroup.name}
                    {selectedGroup.role === "leader" && (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedGroup.description || "Grupo de estudo bíblico"}
                  </CardDescription>
                </div>
                <Badge variant={selectedGroup.isPublic ? "secondary" : "outline"}>
                  {selectedGroup.isPublic ? (
                    <><Globe className="h-3 w-3 mr-1" /> Público</>
                  ) : (
                    <><Lock className="h-3 w-3 mr-1" /> Privado</>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="w-full justify-start mb-4">
                  <TabsTrigger value="chat" data-testid="tab-chat">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Discussão
                  </TabsTrigger>
                  <TabsTrigger value="members" data-testid="tab-members">
                    <Users className="h-4 w-4 mr-2" />
                    Membros ({groupMembers.length})
                  </TabsTrigger>
                  {isLeaderOrMod && (
                    <TabsTrigger value="invites" data-testid="tab-invites">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Convites
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="chat" className="space-y-4">
                  <ScrollArea className="h-[400px] border rounded-lg p-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : groupMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
                        <p className="text-sm text-muted-foreground">Seja o primeiro a iniciar a discussão!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[...groupMessages].reverse().map((message) => {
                          const isOwn = message.user?.id === user?.id;
                          return (
                            <div 
                              key={message.id} 
                              className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                              data-testid={`message-${message.id}`}
                            >
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={message.user?.profileImageUrl || ""} />
                                <AvatarFallback>
                                  {message.user?.displayName?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`flex-1 max-w-[80%] ${isOwn ? "text-right" : ""}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">
                                    {message.user?.displayName || "Usuário"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ptBR })}
                                  </span>
                                </div>
                                <div className={`rounded-lg p-3 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                  {message.verseReference && (
                                    <div className="text-xs opacity-80 mb-1 flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      {message.verseReference}
                                    </div>
                                  )}
                                  <p className="text-sm">{message.content}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  <Form {...messageForm}>
                    <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="flex gap-2">
                      <FormField
                        control={messageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="Digite sua mensagem..." 
                                data-testid="input-message"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={sendMessageMutation.isPending}
                        data-testid="button-send-message"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="members">
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                        data-testid={`member-${member.id}`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.userImage || ""} />
                          <AvatarFallback>
                            {member.userName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.userName || "Usuário"}</p>
                          <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                        </div>
                        <Badge variant={member.role === "leader" ? "default" : "secondary"}>
                          {member.role === "leader" && <Crown className="h-3 w-3 mr-1" />}
                          {member.role === "leader" ? "Líder" : member.role === "moderator" ? "Moderador" : "Membro"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {isLeaderOrMod && (
                  <TabsContent value="invites">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Convites pendentes</h4>
                        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" data-testid="button-new-invite">
                              <Plus className="h-4 w-4 mr-2" />
                              Novo Convite
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Convidar para o grupo</DialogTitle>
                              <DialogDescription>
                                Envie um convite por email ou telefone
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...inviteForm}>
                              <form onSubmit={inviteForm.handleSubmit(onCreateInvite)} className="space-y-4">
                                <FormField
                                  control={inviteForm.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <div className="flex gap-2">
                                          <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                                          <Input 
                                            placeholder="email@exemplo.com"
                                            data-testid="input-invite-email"
                                            {...field}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={inviteForm.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Telefone (opcional)</FormLabel>
                                      <FormControl>
                                        <div className="flex gap-2">
                                          <Phone className="h-4 w-4 mt-3 text-muted-foreground" />
                                          <Input 
                                            placeholder="(11) 99999-9999"
                                            data-testid="input-invite-phone"
                                            {...field}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button 
                                    type="submit" 
                                    disabled={createInviteMutation.isPending}
                                    data-testid="button-create-invite"
                                  >
                                    {createInviteMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <UserPlus className="h-4 w-4 mr-2" />
                                    )}
                                    Criar Convite
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {groupInvites.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum convite pendente</p>
                          <p className="text-sm">Crie um convite para adicionar membros</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {groupInvites.map((invite) => (
                            <div 
                              key={invite.id} 
                              className="flex items-center justify-between p-3 rounded-lg border"
                              data-testid={`invite-${invite.id}`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  {invite.invitedEmail && (
                                    <div className="flex items-center gap-1 text-sm">
                                      <Mail className="h-3 w-3" />
                                      {invite.invitedEmail}
                                    </div>
                                  )}
                                  {invite.invitedPhone && (
                                    <div className="flex items-center gap-1 text-sm">
                                      <Phone className="h-3 w-3" />
                                      {invite.invitedPhone}
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Código: <span className="font-mono font-bold">{invite.inviteCode}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={invite.status === "pending" ? "outline" : invite.status === "accepted" ? "default" : "secondary"}>
                                  {invite.status === "pending" ? "Pendente" : invite.status === "accepted" ? "Aceito" : "Expirado"}
                                </Badge>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={() => copyInviteCode(invite.inviteCode)}
                                  data-testid={`button-copy-${invite.id}`}
                                >
                                  {copiedCode === invite.inviteCode ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>

            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                {groupMembers.length} membro{groupMembers.length !== 1 ? "s" : ""}
              </div>
              {selectedGroup.role !== "leader" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => leaveMutation.mutate(selectedGroup.id)}
                  disabled={leaveMutation.isPending}
                  data-testid="button-leave-group"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair do Grupo
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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
          
          <div className="flex gap-2">
            <Dialog open={isJoinByCodeDialogOpen} onOpenChange={setIsJoinByCodeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" data-testid="button-use-code">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Usar Código
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Usar Código de Convite</DialogTitle>
                  <DialogDescription>
                    Digite o código que você recebeu para entrar em um grupo privado
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input 
                    placeholder="Digite o código (ex: ABC12345)"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="font-mono text-center text-lg"
                    data-testid="input-invite-code"
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsJoinByCodeDialogOpen(false);
                      setInviteCode("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => acceptInviteMutation.mutate(inviteCode)}
                    disabled={!inviteCode || acceptInviteMutation.isPending}
                    data-testid="button-accept-invite"
                  >
                    {acceptInviteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Entrar no Grupo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                  <Card key={group.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedGroup(group)} data-testid={`card-group-${group.id}`}>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroup(group);
                        }}
                        data-testid={`button-view-group-${group.id}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Abrir
                      </Button>
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
      </div>
    </div>
  );
}
