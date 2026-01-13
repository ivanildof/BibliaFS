import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/config";

interface ProfileImageUploadProps {
  currentImage?: string | null;
  userName: string;
}

export function ProfileImageUpload({ currentImage, userName }: ProfileImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter menos de 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);

        // Upload to server
        try {
          const response = await apiFetch("/api/profile/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData: base64 }),
          });

          if (!response.ok) {
            throw new Error("Falha ao fazer upload");
          }

          const data = await response.json();

          // Invalidate auth query to refresh user data
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

          toast({
            title: "Sucesso",
            description: "Foto de perfil atualizada com sucesso!",
          });

          setPreview(null);
        } catch (error) {
          console.error("Upload error:", error);
          toast({
            title: "Erro",
            description: "Falha ao fazer upload da imagem",
            variant: "destructive",
          });
        }
      };

      reader.readAsDataURL(file);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const displayImage = preview || currentImage;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24 ring-4 ring-primary/20">
        <AvatarImage src={displayImage || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-profile-image"
      />

      <Button
        size="sm"
        variant="default"
        className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0 shadow-lg"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        data-testid="button-upload-image"
      >
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
        ) : preview ? (
          <X className="h-5 w-5" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
