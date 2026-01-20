import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Crown } from "lucide-react";
import { Link } from "wouter";

export function UserProfile() {
  const { user, session } = useAuth();

  if (!user) return null;

  const displayName = user.displayName || user.fullName || user.email || "Usuário";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      // Logout from Supabase (this clears the session from localStorage)
      await supabase.auth.signOut();
      // Then notify backend (optional, for audit purposes)
      if (session?.access_token) {
        await apiFetch("/api/auth/logout", { 
          method: "POST",
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {}); // Ignore backend logout errors
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10" data-testid="button-user-profile">
          <Avatar className="h-9 w-9">
            {user.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={displayName} />}
            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {user.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={displayName} />}
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/perfil">
          <DropdownMenuItem data-testid="menu-item-profile">
            <User className="h-4 w-4 mr-2 text-blue-500" />
            <span>Meu Perfil</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/pricing">
          <DropdownMenuItem data-testid="menu-item-pricing">
            <Crown className="h-4 w-4 mr-2 text-yellow-500" />
            <span>Assinaturas</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/configurações">
          <DropdownMenuItem data-testid="menu-item-settings">
            <Settings className="h-4 w-4 mr-2 text-primary" />
            <span>Configurações</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} data-testid="menu-item-logout">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
