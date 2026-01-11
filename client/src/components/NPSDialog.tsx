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
    if (!user) return;

    // Check if user has been registered for at least 7 days
    const createdAt = new Date(user.createdAt || new Date());
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const hasResponded = localStorage.getItem(`nps_responded_${user.id}`);

    if (diffDays >= 7 && !hasResponded) {
      setOpen(true);
    }
  }, [user]);

  const feedbackMutation = useMutation({
    mutationFn: async (data: { type: string; score?: number; comment?: string }) => {
      return await apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      toast({
        title: "Obrigado pelo seu feedback!",
        description: "Sua opinião nos ajuda a melhorar o BíbliaFS.",
      });
      localStorage.setItem(`nps_responded_${user?.id}`, "true");
      setOpen(false);
    },
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
