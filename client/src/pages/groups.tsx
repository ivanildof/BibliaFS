import { useState, useEffect, useRef, useCallback } from "react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  ChevronRight,
  Trash2,
  Settings,
  MoreVertical,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Video
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from "date-fns";
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
  replyToId?: string | null;
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

interface GroupMeeting {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  meetingDate: string;
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  createdBy: string;
  createdAt: string;
}

interface GroupResource {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  resourceType: string;
  url?: string;
  lessonId?: string;
  createdBy: string;
  createdAt: string;
}


export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "members" | "invites" | "discussions" | "calendar" | "resources">("chat");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupForAction, setGroupForAction] = useState<Group | null>(null);
  const [isGridEditDialogOpen, setIsGridEditDialogOpen] = useState(false);
  const [isGridDeleteDialogOpen, setIsGridDeleteDialogOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const res = await apiRequest("PATCH", `/api/groups/${selectedGroup?.id}`, data);
      return res.json();
    },
    onSuccess: (updatedGroup: Group) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      setSelectedGroup({ ...selectedGroup!, ...updatedGroup });
      setIsEditDialogOpen(false);
      toast({
        title: "Grupo atualizado!",
        description: "As informações do grupo foram salvas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/groups/${selectedGroup?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      setSelectedGroup(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Grupo excluído",
        description: "O grupo foi removido permanentemente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const gridUpdateMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const res = await apiRequest("PATCH", `/api/groups/${groupForAction?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      setIsGridEditDialogOpen(false);
      setGroupForAction(null);
      toast({
        title: "Grupo atualizado!",
        description: "As informações do grupo foram salvas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const gridDeleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/groups/${groupForAction?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      setIsGridDeleteDialogOpen(false);
      setGroupForAction(null);
      toast({
        title: "Grupo excluído",
        description: "O grupo foi removido permanentemente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir grupo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [isJoinByCodeDialogOpen, setIsJoinByCodeDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDiscussionDialogOpen, setIsDiscussionDialogOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<GroupDiscussion | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);

  const { data: allGroups = [], isLoading: loadingAll } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    retry: 0,
  });

  const { data: myGroups = [], isLoading: loadingMy } = useQuery<Group[]>({
    queryKey: ["/api/groups/my"],
    retry: 0,
    enabled: !!user,
  });

  // Helper to check if user is the leader of the current group
  const isLeaderGlobal = selectedGroup ? (selectedGroup.leaderId === user?.id || selectedGroup.role === "leader") : false;

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

  const { data: groupMeetings = [] } = useQuery<GroupMeeting[]>({
    queryKey: ["/api/groups", selectedGroup?.id, "meetings"],
    enabled: !!selectedGroup,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: groupResources = [] } = useQuery<GroupResource[]>({
    queryKey: ["/api/groups", selectedGroup?.id, "resources"],
    enabled: !!selectedGroup,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isMessageDeleteDialogOpen, setIsMessageDeleteDialogOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest("DELETE", `/api/groups/${selectedGroup?.id}/messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "messages"] });
      setIsMessageDeleteDialogOpen(false);
      setMessageToDelete(null);
      toast({ title: "Mensagem apagada" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao apagar mensagem", description: error?.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (groupMessages.length > 0 && groupMessages.length !== prevMessageCountRef.current) {
      prevMessageCountRef.current = groupMessages.length;
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [groupMessages.length]);

  const [editingMeeting, setEditingMeeting] = useState<GroupMeeting | null>(null);

  const updateMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/groups/${selectedGroup?.id}/meetings/${editingMeeting?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "meetings"] });
      setEditingMeeting(null);
      setIsMeetingDialogOpen(false);
      meetingForm.reset();
      toast({ title: "Reunião atualizada!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar reunião", description: error?.message, variant: "destructive" });
    }
  });

  const [isMeetingDeleteDialogOpen, setIsMeetingDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);

  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      await apiRequest("DELETE", `/api/groups/${selectedGroup?.id}/meetings/${meetingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "meetings"] });
      toast({ title: "Reunião removida" });
      setIsMeetingDeleteDialogOpen(false);
      setMeetingToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: "Erro ao remover reunião", description: error?.message, variant: "destructive" });
    }
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

  const editForm = useForm<GroupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedGroup?.name || "",
      description: selectedGroup?.description || "",
      isPublic: selectedGroup?.isPublic || false,
    },
  });

  const gridEditForm = useForm<GroupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  // Update edit form values when group changes
  useEffect(() => {
    if (selectedGroup) {
      editForm.reset({
        name: selectedGroup.name,
        description: selectedGroup.description || "",
        isPublic: selectedGroup.isPublic,
      });
    }
  }, [selectedGroup, editForm]);

  // Update grid edit form when groupForAction changes
  useEffect(() => {
    if (groupForAction) {
      gridEditForm.reset({
        name: groupForAction.name,
        description: groupForAction.description || "",
        isPublic: groupForAction.isPublic,
      });
    }
  }, [groupForAction, gridEditForm]);

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

  const meetingForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      meetingDate: new Date().toISOString().slice(0, 16),
      location: "",
      isOnline: false,
      meetingLink: "",
    }
  });

  const resourceForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      resourceType: "link",
      url: "",
    }
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/groups/${selectedGroup?.id}/meetings`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "meetings"] });
      setIsMeetingDialogOpen(false);
      meetingForm.reset();
      toast({ title: "Reunião agendada!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao agendar reunião", description: error?.message || "Tente novamente.", variant: "destructive" });
    }
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/groups/${selectedGroup?.id}/resources`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "resources"] });
      setIsResourceDialogOpen(false);
      resourceForm.reset();
      toast({ title: "Recurso adicionado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao adicionar recurso", description: error?.message || "Tente novamente.", variant: "destructive" });
    }
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
      const payload: any = { ...data };
      if (replyingTo) {
        payload.replyToId = replyingTo.id;
      }
      return await apiRequest("POST", `/api/groups/${selectedGroup?.id}/messages`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "messages"] });
      messageForm.reset();
      setReplyingTo(null);
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
      
      const inviteUrl = `${window.location.origin}/groups?code=${invite.inviteCode}`;
      const whatsappMessage = `Olá! Você foi convidado para o grupo "${selectedGroup?.name}" no BíbliaFS. Use o código: ${invite.inviteCode} ou acesse: ${inviteUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
      
      toast({
        title: "Convite criado! 🎉",
        description: (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-sm">Código: <span className="font-mono font-bold text-primary">{invite.inviteCode}</span></p>
            <div className="flex gap-2">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <SiWhatsapp className="h-4 w-4" />
                Enviar via WhatsApp
              </a>
            </div>
          </div>
        ),
        duration: 15000,
      });
      
      // Auto copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inviteUrl).catch(err => {
          console.warn("Failed to copy invite URL:", err);
        });
      }
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

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await apiRequest("DELETE", `/api/groups/${selectedGroup?.id}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "members"] });
      toast({ title: "Membro removido" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover membro", description: error.message, variant: "destructive" });
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/groups/${selectedGroup?.id}/members/${memberId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", selectedGroup?.id, "members"] });
      toast({ title: "Cargo atualizado" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar cargo", description: error.message, variant: "destructive" });
    },
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (data: DiscussionFormData): Promise<GroupDiscussion> => {
      console.log("Creating discussion for group:", selectedGroup?.id, "with data:", data);
      const res = await apiRequest("POST", `/api/groups/${selectedGroup?.id}/discussions`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao criar discussão");
      }
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
    console.log("Creating invite with data:", data);
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
    const isLeaderOrMod = selectedGroup.role === "leader" || selectedGroup.role === "moderator" || selectedGroup.leaderId === user?.id;
    const isLeader = isLeaderGlobal;
    
    return (
      <div className="min-h-screen bg-background relative mesh-primary">
        <div className="max-w-4xl mx-auto p-2 sm:p-6 md:p-8 relative z-10 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedGroup(null)}
              className="rounded-full hover-elevate w-full sm:w-auto justify-start sm:justify-center"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos grupos
            </Button>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="rounded-[2rem] border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display font-bold">Editar Grupo</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Grupo</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-name" className="rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea {...field} data-testid="input-edit-description" className="rounded-xl min-h-[100px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-muted/30">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Grupo Público</FormLabel>
                            <FormDescription>Visível para toda a comunidade.</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-edit-public" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-group" className="rounded-xl w-full font-bold">
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Salvar Alterações
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent className="rounded-[2rem] border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display font-bold text-destructive">Excluir Grupo?</DialogTitle>
                  <DialogDescription className="text-base pt-2">
                    Esta ação não pode ser desfeita. Todas as mensagens e dados do grupo serão perdidos para sempre.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} data-testid="button-cancel-delete" className="rounded-xl flex-1 order-2 sm:order-1">Cancelar</Button>
                  <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} data-testid="button-confirm-delete" className="rounded-xl flex-1 order-1 sm:order-2 font-bold">
                    {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Confirmar Exclusão
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-none glass-premium hover-premium rounded-[2.5rem] ring-2 ring-primary/15">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-3 text-xl sm:text-3xl font-display font-bold text-foreground flex-wrap">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                      <Users className="h-6 w-6" />
                    </div>
                    {selectedGroup.name}
                    {selectedGroup.role === "leader" && (
                      <div className="p-1 rounded-full bg-amber-500/10" title="Líder">
                        <Crown className="h-5 w-5 text-amber-500" />
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base font-medium">
                    {selectedGroup.description || "Grupo de estudo bíblico"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-4 py-1.5 bg-primary/10 text-primary border-0 font-bold">
                    {selectedGroup.isPublic ? (
                      <><Globe className="h-3.5 w-3.5 mr-1.5" /> Público</>
                    ) : (
                      <><Lock className="h-3.5 w-3.5 mr-1.5" /> Privado</>
                    )}
                  </Badge>
                  {isLeader && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-group-menu">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => setIsEditDialogOpen(true)}
                          data-testid="menu-edit-group"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Editar Grupo
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive cursor-pointer"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          data-testid="menu-delete-group"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Grupo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-2 sm:p-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full p-1 bg-muted/50 rounded-xl gap-1 h-auto mb-4">
                  <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-[11px] px-2 py-2" data-testid="tab-chat">
                    <MessageCircle className="h-3.5 w-3.5 mr-1" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-[11px] px-2 py-2" data-testid="tab-calendar">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                    Agenda
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-[11px] px-2 py-2" data-testid="tab-resources">
                    <LinkIcon className="h-3.5 w-3.5 mr-1" />
                    Arquivos
                  </TabsTrigger>
                  <TabsTrigger value="discussions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-[11px] px-2 py-2" data-testid="tab-discussions">
                    <GraduationCap className="h-3.5 w-3.5 mr-1" />
                    Estudos
                  </TabsTrigger>
                  <TabsTrigger value="members" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-[11px] px-2 py-2" data-testid="tab-members">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Membros
                  </TabsTrigger>
                  {isLeaderOrMod && (
                    <TabsTrigger value="invites" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold text-[11px] px-2 py-2" data-testid="tab-invites">
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      Convites
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Próximas Reuniões</h3>
                    {isLeaderOrMod && (
                      <Button onClick={() => setIsMeetingDialogOpen(true)} size="sm" className="rounded-xl">
                        <Plus className="h-4 w-4 mr-2" />
                        Agendar
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    {groupMeetings.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma reunião agendada</p>
                      </div>
                    ) : (
                      groupMeetings.map((meeting) => (
                        <Card key={meeting.id} className="hover-elevate">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base sm:text-lg">{meeting.title}</h4>
                                {meeting.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{meeting.description}</p>
                                )}
                                <div className="flex flex-wrap gap-3 mt-3 text-xs font-semibold text-primary">
                                  <span className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-md">
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    {new Date(meeting.meetingDate).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })} {new Date(meeting.meetingDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}
                                  </span>
                                  {meeting.location && (
                                    <span className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-foreground/70">
                                      <Globe className="h-3.5 w-3.5" />
                                      {meeting.location}
                                    </span>
                                  )}
                                  {meeting.isOnline && (
                                    <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 px-2 py-1 rounded-md">
                                      <Video className="h-3.5 w-3.5" />
                                      Online
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                {meeting.isOnline && meeting.meetingLink && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="gap-2 rounded-lg"
                                    asChild
                                  >
                                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                      <Video className="h-3.5 w-3.5" />
                                      Entrar
                                    </a>
                                  </Button>
                                )}
                                
                                {isLeader && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingMeeting(meeting);
                                        meetingForm.reset({
                                          title: meeting.title,
                                          description: meeting.description || "",
                                          meetingDate: new Date(meeting.meetingDate).toISOString().slice(0, 16),
                                          location: meeting.location || "",
                                          isOnline: meeting.isOnline,
                                          meetingLink: meeting.meetingLink || "",
                                        });
                                        setIsMeetingDialogOpen(true);
                                      }}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => {
                                        setMeetingToDelete(meeting.id);
                                        setIsMeetingDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Materiais e Links</h3>
                    <Button onClick={() => setIsResourceDialogOpen(true)} size="sm" className="rounded-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupResources.length === 0 ? (
                      <div className="col-span-full text-center py-12 border-2 border-dashed rounded-2xl">
                        <LinkIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum recurso disponível</p>
                      </div>
                    ) : (
                      groupResources.map((resource) => (
                        <Card key={resource.id} className="hover-elevate">
                          <CardContent className="p-4">
                            <Badge variant="secondary" className="mb-2">
                              {resource.resourceType === 'link' ? 'Link' : 'Arquivo'}
                            </Badge>
                            <h4 className="font-bold text-sm">{resource.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{resource.description}</p>
                            {resource.url && (
                              <Button asChild size="sm" variant="ghost" className="w-full mt-3 rounded-xl border border-primary/10">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <Globe className="h-3.5 w-3.5 mr-2" />
                                  Acessar
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="chat" className="space-y-0 flex flex-col h-[calc(100vh-420px)] min-h-[300px]">
                  <div 
                    ref={chatScrollRef}
                    className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-1"
                    data-testid="chat-scroll-area"
                  >
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : groupMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium">Nenhuma mensagem ainda</p>
                        <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a iniciar a conversa!</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {(() => {
                          const sorted = [...groupMessages].sort((a, b) => 
                            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                          );
                          let lastDate: string | null = null;
                          return sorted.map((message) => {
                            const msgDate = new Date(message.createdAt);
                            const dateKey = format(msgDate, "yyyy-MM-dd");
                            let showDateSeparator = false;
                            if (dateKey !== lastDate) {
                              showDateSeparator = true;
                              lastDate = dateKey;
                            }
                            const isOwn = (message as any).user?.id === user?.id || message.userId === user?.id;
                            const displayName = (message as any).user?.displayName || "Membro";
                            const profileImg = (message as any).user?.profileImageUrl || "";
                            const replyMsg = message.replyToId ? sorted.find(m => m.id === message.replyToId) : null;

                            return (
                              <div key={message.id}>
                                {showDateSeparator && (
                                  <div className="flex items-center justify-center my-3" data-testid={`date-separator-${dateKey}`}>
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="px-3 text-xs text-muted-foreground font-medium">
                                      {isToday(msgDate) ? "Hoje" : isYesterday(msgDate) ? "Ontem" : format(msgDate, "dd 'de' MMMM", { locale: ptBR })}
                                    </span>
                                    <div className="flex-1 h-px bg-border" />
                                  </div>
                                )}
                                <div 
                                  className={`group flex gap-2 py-1 ${isOwn ? "flex-row-reverse" : ""}`}
                                  data-testid={`message-${message.id}`}
                                >
                                  {!isOwn && (
                                    <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                                      <AvatarImage src={profileImg} />
                                      <AvatarFallback className="text-xs">
                                        {displayName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                                    {!isOwn && (
                                      <span className="text-xs font-medium text-muted-foreground ml-1 mb-0.5">
                                        {displayName}
                                      </span>
                                    )}
                                    <div className={`rounded-2xl px-3 py-2 relative ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                                      {replyMsg && (
                                        <div className={`text-xs mb-1 pb-1 border-b ${isOwn ? "border-primary-foreground/20" : "border-border"} opacity-70`}>
                                          <span className="font-medium">{(replyMsg as any).user?.displayName || "Membro"}</span>
                                          <p className="truncate max-w-[200px]">{replyMsg.content}</p>
                                        </div>
                                      )}
                                      {message.verseReference && (
                                        <div className="text-xs opacity-80 mb-1 flex items-center gap-1">
                                          <BookOpen className="h-3 w-3" />
                                          {message.verseReference}
                                        </div>
                                      )}
                                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                      <span className={`text-[10px] mt-0.5 block ${isOwn ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
                                        {format(msgDate, "HH:mm")}
                                      </span>
                                    </div>
                                    <div className={`flex gap-1 mt-0.5 invisible group-hover:visible ${isOwn ? "flex-row-reverse" : ""}`}>
                                      <button
                                        onClick={() => setReplyingTo(message)}
                                        className="text-xs text-muted-foreground hover:text-foreground px-1"
                                        data-testid={`reply-message-${message.id}`}
                                      >
                                        Responder
                                      </button>
                                      {isOwn && (
                                        <button
                                          onClick={() => {
                                            setMessageToDelete(message.id);
                                            setIsMessageDeleteDialogOpen(true);
                                          }}
                                          className="text-xs text-destructive hover:text-destructive/80 px-1"
                                          data-testid={`delete-message-${message.id}`}
                                        >
                                          Apagar
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {replyingTo && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-l-2 border-primary rounded-md mt-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary">
                          Respondendo a {(replyingTo as any).user?.displayName || "Membro"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setReplyingTo(null)}
                        data-testid="cancel-reply"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Form {...messageForm}>
                    <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="flex gap-2 mt-2">
                      <FormField
                        control={messageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-0">
                            <FormControl>
                              <Input 
                                placeholder={replyingTo ? "Digite sua resposta..." : "Digite sua mensagem..."}
                                className="rounded-full"
                                data-testid="input-message"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={sendMessageMutation.isPending}
                        className="rounded-full flex-shrink-0"
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

                  <Dialog open={isMessageDeleteDialogOpen} onOpenChange={setIsMessageDeleteDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apagar mensagem</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja apagar esta mensagem? Esta ação não pode ser desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsMessageDeleteDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => messageToDelete && deleteMessageMutation.mutate(messageToDelete)}
                          disabled={deleteMessageMutation.isPending}
                        >
                          {deleteMessageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                          Apagar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                <TabsContent value="members">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <h3 className="text-lg font-bold">Membros</h3>
                    {isLeader && (
                      <Button onClick={() => setActiveTab("invites")} size="sm" className="rounded-xl">
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        Convidar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-muted/50"
                        data-testid={`member-${member.id}`}
                      >
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                          <AvatarImage src={member.userImage || ""} />
                          <AvatarFallback>
                            {member.userName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{member.userName || "Usuário"}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <Badge variant={member.role === "leader" ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                            {member.role === "leader" && <Crown className="h-3 w-3 mr-1" />}
                            {member.role === "leader" ? "Líder" : member.role === "moderator" ? "Mod" : "Membro"}
                          </Badge>
                          
                          {isLeader && member.userId !== user?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`manage-member-${member.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem 
                                  className="cursor-pointer"
                                  onClick={() => updateMemberRoleMutation.mutate({ memberId: member.id, role: member.role === "moderator" ? "member" : "moderator" })}
                                >
                                  <Crown className="h-4 w-4 mr-2" />
                                  {member.role === "moderator" ? "Remover Moderador" : "Tornar Moderador"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive cursor-pointer"
                                  onClick={() => removeMemberMutation.mutate(member.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remover do Grupo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{groupMembers.length} membro{groupMembers.length !== 1 ? 's' : ''}</p>
                </TabsContent>

                {isLeaderOrMod && (
                  <TabsContent value="invites">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center gap-2">
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
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                  {invite.invitedEmail && (
                                    <div className="flex items-center gap-2 text-sm font-semibold min-w-0">
                                      <Mail className="h-4 w-4 text-primary/70 flex-shrink-0" />
                                      <span className="truncate">{invite.invitedEmail}</span>
                                    </div>
                                  )}
                                  {invite.invitedPhone && (
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                      <Phone className="h-4 w-4 text-primary/70 flex-shrink-0" />
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
                              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                                <Badge 
                                  variant={invite.status === "pending" ? "outline" : invite.status === "accepted" ? "default" : "secondary"}
                                  className="capitalize font-bold text-[10px] tracking-tight"
                                >
                                  {invite.status === "pending" ? "Pendente" : invite.status === "accepted" ? "Aceito" : "Expirado"}
                                </Badge>
                                <div className="flex items-center gap-1 ml-auto">
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
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    className="text-green-600"
                                    onClick={() => {
                                      const inviteUrl = `${window.location.origin}/groups?code=${invite.inviteCode}`;
                                      const message = `Olá! Você foi convidado para o grupo "${selectedGroup?.name}" no BíbliaFS. Use o código: ${invite.inviteCode} ou acesse: ${inviteUrl}`;
                                      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    data-testid={`button-whatsapp-${invite.id}`}
                                  >
                                    <SiWhatsapp className="h-4 w-4" />
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
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

        {/* Modal Nova/Editar Reunião - dentro do grupo */}
        <Dialog open={isMeetingDialogOpen} onOpenChange={(open) => {
          setIsMeetingDialogOpen(open);
          if (!open) setEditingMeeting(null);
        }}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingMeeting ? "Editar Reunião" : "Agendar Reunião"}</DialogTitle>
              <DialogDescription>
                {editingMeeting ? "Altere os detalhes da reunião selecionada." : "Defina os detalhes do próximo encontro do grupo."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Título</label>
                <Input {...meetingForm.register("title")} placeholder="Ex: Estudo de Romanos" className="rounded-xl" data-testid="input-meeting-title" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Data e Hora</label>
                <Input {...meetingForm.register("meetingDate")} type="datetime-local" className="rounded-xl" data-testid="input-meeting-date" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Local/Plataforma</label>
                <Input {...meetingForm.register("location")} placeholder="Ex: Casa do João ou Google Meet" className="rounded-xl" data-testid="input-meeting-location" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={meetingForm.watch("isOnline")} 
                  onCheckedChange={(checked) => meetingForm.setValue("isOnline", checked)} 
                  data-testid="switch-meeting-online"
                />
                <label className="text-sm font-medium">Reunião Online</label>
              </div>
              {meetingForm.watch("isOnline") && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Link da Reunião</label>
                  <Input {...meetingForm.register("meetingLink")} placeholder="https://meet.google.com/..." className="rounded-xl" data-testid="input-meeting-link" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={meetingForm.handleSubmit((data) => {
                  if (editingMeeting) {
                    updateMeetingMutation.mutate(data);
                  } else {
                    createMeetingMutation.mutate(data);
                  }
                })} 
                className="rounded-xl w-full"
                disabled={createMeetingMutation.isPending || updateMeetingMutation.isPending}
                data-testid="button-save-meeting"
              >
                {(createMeetingMutation.isPending || updateMeetingMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  editingMeeting ? <Check className="h-4 w-4 mr-2" /> : <CalendarIcon className="h-4 w-4 mr-2" />
                )}
                {editingMeeting ? "Salvar Alterações" : "Agendar Reunião"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Confirmação de Exclusão de Reunião */}
        <Dialog open={isMeetingDeleteDialogOpen} onOpenChange={setIsMeetingDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-destructive">Excluir Reunião?</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. A reunião será removida permanentemente da agenda do grupo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsMeetingDeleteDialogOpen(false)}
                className="rounded-xl flex-1"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => meetingToDelete && deleteMeetingMutation.mutate(meetingToDelete)}
                disabled={deleteMeetingMutation.isPending}
                className="rounded-xl flex-1"
              >
                {deleteMeetingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Confirmar Exclusão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Novo Recurso - dentro do grupo */}
        <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Recurso</DialogTitle>
              <DialogDescription>Compartilhe materiais úteis com o grupo.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Título</label>
                <Input {...resourceForm.register("title")} placeholder="Ex: PDF do Estudo" className="rounded-xl" data-testid="input-resource-title" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Descrição</label>
                <Textarea {...resourceForm.register("description")} placeholder="Do que se trata este material?" className="rounded-xl" data-testid="input-resource-description" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">URL / Link</label>
                <Input {...resourceForm.register("url")} placeholder="https://..." className="rounded-xl" data-testid="input-resource-url" />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={resourceForm.handleSubmit((data) => createResourceMutation.mutate(data))} 
                className="rounded-xl w-full"
                disabled={createResourceMutation.isPending}
                data-testid="button-save-resource"
              >
                {createResourceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                Adicionar Recurso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
    <div className="min-h-screen bg-background relative mesh-primary">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-muted/50 dark:bg-muted/30 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <p className="text-[10px] font-semibold text-primary uppercase tracking-[0.2em]">COMUNIDADE</p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground" data-testid="text-page-title">
            Grupos de Estudo
          </h1>
          <p className="text-sm text-muted-foreground">
            Compartilhe sua fé e cresça em conhecimento bíblico com sua comunidade
          </p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setIsJoinByCodeDialogOpen(true)}
              className="rounded-2xl h-14 px-8 border-primary/20  hover:border-primary/40 transition-all font-bold flex-1 sm:flex-none shadow-sm" 
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

        <Tabs defaultValue="my-groups" className="space-y-8">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full bg-muted/30 p-1.5 rounded-2xl border border-primary/5">
              <TabsTrigger 
                value="my-groups" 
                className="rounded-xl px-4 sm:px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold transition-all whitespace-nowrap text-sm"
                data-testid="tab-my-groups"
              >
                Meus Grupos ({myGroups.length})
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="rounded-xl px-4 sm:px-8 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold transition-all whitespace-nowrap text-sm"
                data-testid="tab-discover"
              >
                Descobrir Novos Grupos ({publicGroups.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="my-groups" className="mt-0">
            {myGroups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-none glass-premium hover-premium rounded-3xl ring-2 ring-primary/10">
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
                      onClick={(e) => {
                        // Prevent navigation if clicking the menu
                        if ((e.target as HTMLElement).closest('[data-group-menu]')) return;
                        setSelectedGroup(group);
                      }} 
                      data-testid={`card-group-${group.id}`}
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/80 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start gap-2 mb-4 flex-wrap">
                          <div className="p-3.5 rounded-2xl bg-primary/5 group- transition-colors">
                            <Users className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex flex-col items-end gap-2" data-group-menu>
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-200 rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                              {group.role === "leader" ? (
                                <><Crown className="h-3 w-3 mr-1 text-amber-500" /> Líder</>
                              ) : "Membro"}
                            </Badge>
                            <div className="relative">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    data-testid="button-group-options"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl border-0 shadow-2xl">
                                  {group.role === "leader" && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setGroupForAction(group);
                                          setIsGridEditDialogOpen(true);
                                        }}
                                        className="gap-2 cursor-pointer focus:bg-primary/5 rounded-lg"
                                      >
                                        <Settings className="h-4 w-4" />
                                        Editar Grupo
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setGroupForAction(group);
                                          setIsGridDeleteDialogOpen(true);
                                        }}
                                        className="gap-2 cursor-pointer focus:bg-destructive/5 text-destructive focus:text-destructive rounded-lg"
                                      >
                                        <LogOut className="h-4 w-4" />
                                        Excluir Grupo
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedGroup(group);
                                    }}
                                    className="gap-2 cursor-pointer focus:bg-primary/5 rounded-lg"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                    Ver Grupo
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
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
                  <Card className="group border-none glass-premium hover-premium rounded-3xl ring-2 ring-primary/10 hover:ring-primary/30 transition-all duration-500 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="p-3.5 rounded-2xl bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors w-fit mb-4">
                        <Globe className="h-7 w-7 text-blue-500" />
                      </div>
                      <CardTitle className="text-2xl font-bold">{group.name}</CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[3rem] mt-2 text-sm font-medium text-muted-foreground/80">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="bg-primary/5 p-5 group- transition-colors">
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

      {/* Grid Edit Dialog */}
      <Dialog open={isGridEditDialogOpen} onOpenChange={(open) => {
        setIsGridEditDialogOpen(open);
        if (!open) setGroupForAction(null);
      }}>
        <DialogContent className="rounded-[2rem] border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold">Editar Grupo</DialogTitle>
          </DialogHeader>
          <Form {...gridEditForm}>
            <form onSubmit={gridEditForm.handleSubmit((data) => gridUpdateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={gridEditForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Grupo</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-grid-edit-name" className="rounded-xl h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={gridEditForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="input-grid-edit-description" className="rounded-xl min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={gridEditForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-muted/30">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Grupo Público</FormLabel>
                      <FormDescription>Visível para toda a comunidade.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-grid-edit-public" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={gridUpdateMutation.isPending} data-testid="button-grid-save-group" className="rounded-xl h-12 w-full font-bold">
                  {gridUpdateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Grid Delete Dialog */}
      <Dialog open={isGridDeleteDialogOpen} onOpenChange={(open) => {
        setIsGridDeleteDialogOpen(open);
        if (!open) setGroupForAction(null);
      }}>
        <DialogContent className="rounded-[2rem] border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-destructive">Excluir Grupo?</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Esta ação não pode ser desfeita. Todas as mensagens e dados do grupo "{groupForAction?.name}" serão perdidos para sempre.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsGridDeleteDialogOpen(false)} data-testid="button-grid-cancel-delete" className="rounded-xl h-12 flex-1 order-2 sm:order-1">Cancelar</Button>
            <Button variant="destructive" onClick={() => gridDeleteMutation.mutate()} disabled={gridDeleteMutation.isPending} data-testid="button-grid-confirm-delete" className="rounded-xl h-12 flex-1 order-1 sm:order-2 font-bold">
              {gridDeleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
