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
  ArrowLeft,
  Sparkles,
  GraduationCap,
  Star,
  CheckCircle2,
  AlertCircle,
  FileText
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

const discussionSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200),
  description: z.string().max(500).optional(),
  question: z.string().max(500).optional(),
  verseReference: z.string().max(100).optional(),
  verseText: z.string().max(1000).optional(),
  useAI: z.boolean().default(true),
});

const answerSchema = z.object({
  content: z.string().min(10, "Resposta deve ter pelo menos 10 caracteres").max(2000),
  verseReference: z.string().max(100).optional(),
});

type GroupFormData = z.infer<typeof formSchema>;
type InviteFormData = z.infer<typeof inviteSchema>;
type MessageFormData = z.infer<typeof messageSchema>;
type DiscussionFormData = z.infer<typeof discussionSchema>;
type AnswerFormData = z.infer<typeof answerSchema>;

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

interface GroupDiscussion {
  id: string;
  groupId: string;
  createdById: string;
  title: string;
  description?: string;
  question: string;
  verseReference?: string;
  verseText?: string;
  aiSynthesis?: string;
  synthesizedAt?: string;
  status: string;
  allowAnonymous: boolean;
  deadline?: string;
  createdAt: string;
  creator?: {
    id: string;
    displayName?: string;
    profileImageUrl?: string;
  };
  answers?: GroupAnswer[];
}

interface GroupAnswer {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  verseReference?: string;
  reviewStatus: string;
  reviewComment?: string;
  isAnonymous: boolean;
  createdAt: string;
  user?: {
    id: string;
    displayName?: string;
    profileImageUrl?: string;
  };
}

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "members" | "invites" | "discussions">("chat");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isJoinByCodeDialogOpen, setIsJoinByCodeDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDiscussionDialogOpen, setIsDiscussionDialogOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<GroupDiscussion | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

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

  const { data: groupDiscussions = [], isLoading: loadingDiscussions } = useQuery<GroupDiscussion[]>({
    queryKey: ["/api/groups", selectedGroup?.id, "discussions"],
    enabled: !!selectedGroup,
  });

  const { data: discussionDetails } = useQuery<GroupDiscussion>({
    queryKey: ["/api/discussions", selectedDiscussion?.id],
    enabled: !!selectedDiscussion,
    refetchInterval: 10000,
  });

  const form = useForm<GroupFormData>({
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

  const discussionForm = useForm<DiscussionFormData>({
    resolver: zodResolver(discussionSchema),
    defaultValues: {
      title: "",
      description: "",
      question: "",
      verseReference: "",
      verseText: "",
      useAI: true,
    },
  });

  const answerForm = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      content: "",
      verseReference: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GroupFormData): Promise<Group> => {
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

  const createDiscussionMutation = useMutation({
    mutationFn: async (data: DiscussionFormData): Promise<GroupDiscussion> => {
      const res = await apiRequest("POST", `/api/groups/${selectedGroup?.id}/discussions`, data);
      return res.json();
    },
    onSuccess: (discussion: GroupDiscussion) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "discussions"] });
      discussionForm.reset();
      setIsDiscussionDialogOpen(false);
      toast({
        title: "Discussão criada!",
        description: discussion.question ? "Pergunta gerada com sucesso" : "Discussão iniciada",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar discussão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (data: AnswerFormData) => {
      return await apiRequest("POST", `/api/discussions/${selectedDiscussion?.id}/answers`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion?.id] });
      answerForm.reset();
      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi registrada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const synthesizeMutation = useMutation({
    mutationFn: async (discussionId: string) => {
      setIsSynthesizing(true);
      const res = await apiRequest("POST", `/api/discussions/${discussionId}/synthesize`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion?.id] });
      setIsSynthesizing(false);
      toast({
        title: "Síntese gerada!",
        description: "A IA analisou todas as respostas.",
      });
    },
    onError: (error: Error) => {
      setIsSynthesizing(false);
      toast({
        title: "Erro ao sintetizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reviewAnswerMutation = useMutation({
    mutationFn: async ({ answerId, status, comment }: { answerId: string; status: string; comment?: string }) => {
      return await apiRequest("PATCH", `/api/answers/${answerId}/review`, { status, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions", selectedDiscussion?.id] });
      toast({
        title: "Avaliação salva!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao avaliar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GroupFormData) => {
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
                <TabsList className="w-full justify-start mb-4 flex-wrap gap-1 h-auto">
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
                  <TabsTrigger value="discussions" data-testid="tab-discussions">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Estudos ({groupDiscussions.length})
                  </TabsTrigger>
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

                <TabsContent value="discussions" className="space-y-4">
                  {selectedDiscussion ? (
                    // Discussion Detail View
                    <div className="space-y-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedDiscussion(null)}
                        data-testid="button-back-discussions"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar às discussões
                      </Button>

                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{discussionDetails?.title || selectedDiscussion.title}</CardTitle>
                              <CardDescription>{discussionDetails?.description || selectedDiscussion.description}</CardDescription>
                            </div>
                            <Badge variant={discussionDetails?.status === "open" ? "default" : discussionDetails?.status === "synthesized" ? "secondary" : "outline"}>
                              {discussionDetails?.status === "open" ? "Aberta" : discussionDetails?.status === "synthesized" ? "Sintetizada" : "Encerrada"}
                            </Badge>
                          </div>
                          {discussionDetails?.verseReference && (
                            <div className="mt-2 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {discussionDetails.verseReference}
                              </p>
                              {discussionDetails.verseText && (
                                <p className="text-sm text-muted-foreground mt-1 italic">"{discussionDetails.verseText}"</p>
                              )}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <p className="font-medium flex items-center gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              Pergunta para Reflexão
                            </p>
                            <p className="text-lg">{discussionDetails?.question || selectedDiscussion.question}</p>
                          </div>

                          {/* Answer Form */}
                          {discussionDetails?.status === "open" && (
                            <Form {...answerForm}>
                              <form onSubmit={answerForm.handleSubmit((data) => submitAnswerMutation.mutate(data))} className="space-y-3">
                                <FormField
                                  control={answerForm.control}
                                  name="content"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Sua Resposta</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Compartilhe sua reflexão..." 
                                          rows={4}
                                          data-testid="input-answer"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={answerForm.control}
                                  name="verseReference"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Referência Bíblica (opcional)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Ex: João 3:16" 
                                          data-testid="input-answer-verse"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <Button 
                                  type="submit" 
                                  disabled={submitAnswerMutation.isPending}
                                  data-testid="button-submit-answer"
                                >
                                  {submitAnswerMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                  )}
                                  Enviar Resposta
                                </Button>
                              </form>
                            </Form>
                          )}

                          {/* Answers List */}
                          <Separator />
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Respostas ({discussionDetails?.answers?.length || 0})
                            </h4>
                            
                            {discussionDetails?.answers?.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground">
                                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>Nenhuma resposta ainda</p>
                                <p className="text-sm">Seja o primeiro a compartilhar!</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {discussionDetails?.answers?.map((answer) => (
                                  <Card key={answer.id} className="p-4">
                                    <div className="flex items-start gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={answer.isAnonymous ? "" : (answer.user?.profileImageUrl || "")} />
                                        <AvatarFallback>
                                          {answer.isAnonymous ? "?" : (answer.user?.displayName?.charAt(0) || "U")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-sm">
                                            {answer.isAnonymous ? "Anônimo" : (answer.user?.displayName || "Membro")}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true, locale: ptBR })}
                                          </span>
                                          {answer.reviewStatus === "excellent" && (
                                            <Badge variant="default" className="text-xs">
                                              <Star className="h-3 w-3 mr-1" />
                                              Excelente
                                            </Badge>
                                          )}
                                          {answer.reviewStatus === "approved" && (
                                            <Badge variant="secondary" className="text-xs">
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                              Aprovada
                                            </Badge>
                                          )}
                                          {answer.reviewStatus === "needs_review" && (
                                            <Badge variant="outline" className="text-xs">
                                              <AlertCircle className="h-3 w-3 mr-1" />
                                              Revisar
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm">{answer.content}</p>
                                        {answer.verseReference && (
                                          <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            {answer.verseReference}
                                          </p>
                                        )}
                                        {answer.reviewComment && (
                                          <p className="text-xs text-muted-foreground mt-2 italic bg-muted p-2 rounded">
                                            Comentário do líder: {answer.reviewComment}
                                          </p>
                                        )}
                                        
                                        {/* Leader Review Actions */}
                                        {isLeaderOrMod && answer.reviewStatus === "pending" && (
                                          <div className="flex gap-2 mt-2">
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              onClick={() => reviewAnswerMutation.mutate({ answerId: answer.id, status: "excellent" })}
                                              data-testid={`button-review-excellent-${answer.id}`}
                                            >
                                              <Star className="h-3 w-3 mr-1" />
                                              Excelente
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              onClick={() => reviewAnswerMutation.mutate({ answerId: answer.id, status: "approved" })}
                                              data-testid={`button-review-approve-${answer.id}`}
                                            >
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                              Aprovar
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* AI Synthesis */}
                          {discussionDetails?.aiSynthesis && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  Síntese da IA
                                </h4>
                                <div className="prose prose-sm max-w-none p-4 bg-muted/50 rounded-lg">
                                  <div className="whitespace-pre-wrap">{discussionDetails.aiSynthesis}</div>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Leader Actions */}
                          {isLeaderOrMod && discussionDetails?.status === "open" && (discussionDetails?.answers?.length || 0) >= 1 && (
                            <div className="flex gap-2 pt-4">
                              <Button 
                                onClick={() => synthesizeMutation.mutate(selectedDiscussion.id)}
                                disabled={isSynthesizing}
                                data-testid="button-synthesize"
                              >
                                {isSynthesizing ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Sparkles className="h-4 w-4 mr-2" />
                                )}
                                Gerar Síntese com IA
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Discussions List View
                    <div className="space-y-4">
                      {isLeaderOrMod && (
                        <div className="flex justify-end">
                          <Dialog open={isDiscussionDialogOpen} onOpenChange={setIsDiscussionDialogOpen}>
                            <DialogTrigger asChild>
                              <Button data-testid="button-new-discussion">
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Discussão
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Criar Discussão Estruturada</DialogTitle>
                                <DialogDescription>
                                  A IA vai gerar uma pergunta reflexiva baseada no tema e versículo
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...discussionForm}>
                                <form onSubmit={discussionForm.handleSubmit((data) => createDiscussionMutation.mutate(data))} className="space-y-4">
                                  <FormField
                                    control={discussionForm.control}
                                    name="title"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Tema da Discussão</FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder="Ex: A importância da oração" 
                                            data-testid="input-discussion-title"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={discussionForm.control}
                                    name="description"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Descrição (opcional)</FormLabel>
                                        <FormControl>
                                          <Textarea 
                                            placeholder="Breve contexto para a discussão..."
                                            rows={2}
                                            data-testid="input-discussion-description"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={discussionForm.control}
                                    name="verseReference"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Referência Bíblica</FormLabel>
                                        <FormControl>
                                          <Input 
                                            placeholder="Ex: Mateus 6:5-15" 
                                            data-testid="input-discussion-verse"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={discussionForm.control}
                                    name="verseText"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Texto do Versículo (opcional)</FormLabel>
                                        <FormControl>
                                          <Textarea 
                                            placeholder="Cole aqui o texto do versículo..."
                                            rows={3}
                                            data-testid="input-discussion-verse-text"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={discussionForm.control}
                                    name="useAI"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center gap-3 space-y-0 p-3 bg-muted rounded-lg">
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            data-testid="switch-use-ai"
                                          />
                                        </FormControl>
                                        <div className="flex-1">
                                          <FormLabel className="flex items-center gap-2 cursor-pointer">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            Gerar pergunta com IA
                                          </FormLabel>
                                          <p className="text-xs text-muted-foreground">
                                            A IA criará uma pergunta reflexiva baseada no tema
                                          </p>
                                        </div>
                                      </FormItem>
                                    )}
                                  />
                                  {!discussionForm.watch("useAI") && (
                                    <FormField
                                      control={discussionForm.control}
                                      name="question"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Sua Pergunta</FormLabel>
                                          <FormControl>
                                            <Textarea 
                                              placeholder="Digite a pergunta para discussão..."
                                              rows={2}
                                              data-testid="input-discussion-question"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                  <DialogFooter>
                                    <Button 
                                      type="submit" 
                                      disabled={createDiscussionMutation.isPending}
                                      data-testid="button-create-discussion"
                                    >
                                      {createDiscussionMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Sparkles className="h-4 w-4 mr-2" />
                                      )}
                                      Criar Discussão
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}

                      {loadingDiscussions ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : groupDiscussions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Nenhuma discussão ainda</p>
                          <p className="text-sm">
                            {isLeaderOrMod 
                              ? "Crie uma discussão estruturada com IA" 
                              : "O líder do grupo pode criar discussões"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {groupDiscussions.map((discussion) => (
                            <Card 
                              key={discussion.id} 
                              className="cursor-pointer hover-elevate"
                              onClick={() => setSelectedDiscussion(discussion)}
                              data-testid={`discussion-${discussion.id}`}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                  <CardTitle className="text-base">{discussion.title}</CardTitle>
                                  <Badge variant={discussion.status === "open" ? "default" : discussion.status === "synthesized" ? "secondary" : "outline"}>
                                    {discussion.status === "open" ? "Aberta" : discussion.status === "synthesized" ? "Sintetizada" : "Encerrada"}
                                  </Badge>
                                </div>
                                {discussion.verseReference && (
                                  <p className="text-sm text-primary flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {discussion.verseReference}
                                  </p>
                                )}
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-2">{discussion.question}</p>
                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    {discussion.answers?.length || 0} respostas
                                  </span>
                                  <span>
                                    {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true, locale: ptBR })}
                                  </span>
                                  {discussion.aiSynthesis && (
                                    <span className="flex items-center gap-1 text-primary">
                                      <Sparkles className="h-3 w-3" />
                                      Síntese disponível
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
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
