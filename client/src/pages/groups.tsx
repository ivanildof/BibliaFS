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
  FileText,
  ChevronRight
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
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
    retry: 0,
  });

  const { data: myGroups = [], isLoading: loadingMy } = useQuery<Group[]>({
    queryKey: ["/api/groups/my"],
    retry: 0,
    enabled: !!user,
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl flex-wrap">
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
                    <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="flex flex-col sm:flex-row gap-2">
                      <FormField
                        control={messageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-0">
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
                        <div className="space-y-3">
                          {groupInvites.map((invite) => (
                            <div 
                              key={invite.id} 
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-2xl border bg-card/50 shadow-sm"
                              data-testid={`invite-${invite.id}`}
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                  {invite.invitedEmail && (
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                      <Mail className="h-4 w-4 text-primary/70" />
                                      <span className="truncate max-w-[180px] xs:max-w-none">{invite.invitedEmail}</span>
                                    </div>
                                  )}
                                  {invite.invitedPhone && (
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                      <Phone className="h-4 w-4 text-primary/70" />
                                      <span>{invite.invitedPhone}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-md">
                                    Código: <span className="font-mono text-primary">{invite.inviteCode}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={invite.status === "pending" ? "outline" : invite.status === "accepted" ? "default" : "secondary"}
                                    className="capitalize font-bold text-[10px] tracking-tight"
                                  >
                                    {invite.status === "pending" ? "Pendente" : invite.status === "accepted" ? "Aceito" : "Expirado"}
                                  </Badge>
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary transition-all"
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

  if (isLoading && allGroups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse tracking-wide">Preparando seus grupos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
        <div className="flex flex-col items-center justify-center mb-8">
          <Users className="h-24 w-24 text-primary mb-6" />
          <h1 className="text-4xl font-extrabold text-center tracking-tight">Grupos de Estudo</h1>
          <p className="text-lg text-muted-foreground text-center max-w-md mt-2 font-medium">Compartilhe sua jornada de fé e estudo bíblico com sua comunidade.</p>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight" data-testid="text-page-title">
              Grupos de <span className="text-primary relative inline-block">
                Estudo
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-primary/20 rounded-full" />
              </span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Compartilhe sua fé e cresça em conhecimento bíblico com sua comunidade.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setIsJoinByCodeDialogOpen(true)}
              className="rounded-2xl h-14 px-8 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all font-bold flex-1 sm:flex-none shadow-sm" 
              data-testid="button-use-code"
            >
              <UserPlus className="h-5 w-5 mr-2.5 text-primary" />
              Usar Código
            </Button>

            <Button 
              size="lg" 
              onClick={() => setIsCreateDialogOpen(true)}
              className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex-1 sm:flex-none" 
              data-testid="button-create-group"
            >
              <Plus className="h-5 w-5 mr-2.5" />
              Criar Grupo
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="my-groups" className="space-y-8">
          <TabsList className="bg-muted/30 p-1.5 rounded-2xl border border-primary/5">
            <TabsTrigger 
              value="my-groups" 
              className="rounded-xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold transition-all"
              data-testid="tab-my-groups"
            >
              Meus Grupos ({myGroups.length})
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="rounded-xl px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold transition-all"
              data-testid="tab-discover"
            >
              Descobrir ({publicGroups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="mt-0">
            {myGroups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-none bg-card/40 backdrop-blur-sm shadow-xl rounded-3xl">
                  <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 mb-6 rotate-3">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-2xl text-foreground mb-3">Sua jornada começa aqui</h3>
                    <p className="text-muted-foreground mb-8 max-w-sm font-medium">
                      Você ainda não participa de nenhum grupo. Comece criando o seu ou explorando comunidades existentes.
                    </p>
                    <Button 
                      size="lg"
                      className="rounded-2xl h-14 px-10 font-bold shadow-lg shadow-primary/20"
                      onClick={() => setIsCreateDialogOpen(true)} 
                      data-testid="button-create-first-group"
                    >
                      <Plus className="h-5 w-5 mr-2.5" />
                      Criar Primeiro Grupo
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="group relative overflow-hidden border-none bg-card/40 backdrop-blur-sm hover:bg-card/60 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl cursor-pointer"
                      onClick={() => setSelectedGroup(group)} 
                      data-testid={`card-group-${group.id}`}
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/80 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3.5 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                            <Users className="h-7 w-7 text-primary" />
                          </div>
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-none rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider">
                            {group.role === "leader" ? (
                              <><Crown className="h-3 w-3 mr-1.5 text-amber-500" /> Líder</>
                            ) : "Membro"}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                          {group.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm font-medium leading-relaxed mt-2 text-muted-foreground/80">
                          {group.description || "Nenhuma descrição fornecida para este grupo."}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-4 border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary/60 uppercase tracking-widest">
                          {group.isPublic ? (
                            <><Globe className="h-3.5 w-3.5" /> Público</>
                          ) : (
                            <><Lock className="h-3.5 w-3.5" /> Privado</>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                          Acessar <ChevronRight className="h-4 w-4" />
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group border-none bg-card/40 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="p-3.5 rounded-2xl bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors w-fit mb-4">
                        <Globe className="h-7 w-7 text-blue-500" />
                      </div>
                      <CardTitle className="text-2xl font-bold">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[3rem] mt-2 text-sm font-medium text-muted-foreground/80">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="bg-primary/5 p-5 group-hover:bg-primary/10 transition-colors">
                      {!user ? (
                        <Link href="/login">
                          <Button className="w-full rounded-2xl font-bold h-12 shadow-md shadow-primary/10">
                            Entrar para participar
                          </Button>
                        </Link>
                      ) : myGroupIds.has(group.id) ? (
                        <Button 
                          className="w-full rounded-2xl font-bold h-12 shadow-md shadow-primary/10"
                          variant="outline"
                          onClick={() => setSelectedGroup(group)}
                        >
                          <CheckCircle2 className="mr-2 h-5 w-5" /> Já é membro
                        </Button>
                      ) : (
                        <Button 
                          className="w-full rounded-2xl font-bold h-12 shadow-md shadow-primary/10"
                          onClick={() => joinMutation.mutate(group.id)}
                          disabled={joinMutation.isPending}
                        >
                          {joinMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Participar agora"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Join by Code Dialog */}
      <Dialog open={isJoinByCodeDialogOpen} onOpenChange={setIsJoinByCodeDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <div className="p-3 rounded-2xl bg-primary/10 w-fit mb-4">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">Usar Código de Convite</DialogTitle>
            <DialogDescription className="text-base">
              Digite o código que você recebeu para entrar em um grupo privado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input 
              placeholder="Digite o código (ex: ABC12345)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="h-14 font-mono text-center text-xl rounded-2xl bg-muted/50 border-primary/10 focus-visible:ring-primary tracking-widest"
              data-testid="input-invite-code"
            />
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              className="rounded-xl"
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
              className="rounded-xl font-bold shadow-lg shadow-primary/20"
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

      {/* Create Group Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl max-w-xl">
          <DialogHeader>
            <div className="p-3 rounded-2xl bg-primary/10 w-fit mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-bold">Novo Grupo</DialogTitle>
            <DialogDescription className="text-base">
              Crie um ambiente seguro para compartilhar conhecimento bíblico.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-sm">Nome do Grupo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Jovens em Cristo" 
                        className="h-14 rounded-2xl bg-muted/50 border-primary/10 focus-visible:ring-primary text-lg"
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
                    <FormLabel className="font-bold text-sm">Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Qual o objetivo principal deste grupo?" 
                        rows={3}
                        className="rounded-2xl bg-muted/50 border-primary/10 focus-visible:ring-primary resize-none p-4"
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
                  <FormItem className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-primary/5">
                    <div className="space-y-0.5">
                      <FormLabel className="font-bold text-base flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        Grupo Público
                      </FormLabel>
                      <p className="text-xs text-muted-foreground font-medium">Outras pessoas poderão encontrar e entrar no grupo</p>
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
              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20"
                  data-testid="button-save-group"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5 mr-2" />
                  )}
                  Criar Comunidade
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
