import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="h-10 w-10 rounded-xl bg-background/50 dark:bg-card/40 backdrop-blur-sm border-primary/20 dark:border-primary/30 hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-all shadow-sm active-elevate-2 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 dark:from-primary/20 dark:to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex items-center justify-center">
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </div>
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
