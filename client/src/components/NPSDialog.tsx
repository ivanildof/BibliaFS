import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

export function NPSDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleOpenWithScore = (e: any) => {
      setScore(e.detail.score);
      setOpen(true);
    };

    window.addEventListener('open-nps-dialog', handleOpen);
    window.addEventListener('open-nps-score', handleOpenWithScore);

    return () => {
      window.removeEventListener('open-nps-dialog', handleOpen);
      window.removeEventListener('open-nps-score', handleOpenWithScore);
    };
  }, []);

  const feedbackMutation = useMutation({
    mutationFn: async (data: { type: string; score?: number; comment?: string }) => {
      // If user is not logged in, we still want to allow feedback
      // The backend endpoint might require authentication, let's check
      return await apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      toast({
        title: "Obrigado pelo seu feedback!",
        description: "Sua opinião nos ajuda a melhorar o BíbliaFS.",
      });
      if (user) {
        localStorage.setItem(`nps_responded_${user.id}`, "true");
      } else {
        localStorage.setItem(`nps_responded_anonymous`, "true");
      }
      setOpen(false);
      setScore(null);
      setComment("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar feedback",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (score === null) return;
    feedbackMutation.mutate({
      type: "nps",
      score,
      comment,
    });
  };

  const scoreButtons = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Como está sua experiência?</DialogTitle>
          <DialogDescription>
            Em uma escala de 0 a 10, o quanto você recomendaria o BíbliaFS para um amigo?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between gap-1 flex-wrap">
            {scoreButtons.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setScore(num)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all transform hover:scale-110 ${
                  score === num
                    ? "bg-primary text-primary-foreground shadow-md scale-110"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Conte-nos mais (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="O que você mais gosta ou o que poderíamos melhorar?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Depois</Button>
          <Button onClick={handleSubmit} disabled={score === null || feedbackMutation.isPending}>
            Enviar Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
