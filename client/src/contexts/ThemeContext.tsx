import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isNative } from "@/lib/config";

type Theme = "light" | "dark";
type ReadingTheme = "default" | "sepia" | "paper" | "night";

interface ThemeContextType {
  theme: Theme;
  readingTheme: ReadingTheme;
  setTheme: (theme: Theme) => void;
  setReadingTheme: (theme: ReadingTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const readingThemeStyles: Record<ReadingTheme, { bg: string; text: string; name: string; background: string; textColor: string }> = {
  default: { bg: "", text: "", name: "Padrão", background: "", textColor: "" },
  sepia: { bg: "bg-[#f4ecd8]", text: "text-[#5c4b37]", name: "Sépia", background: "#f4ecd8", textColor: "#5c4b37" },
  paper: { bg: "bg-[#faf9f6]", text: "text-[#333333]", name: "Papel", background: "#faf9f6", textColor: "#333333" },
  night: { bg: "bg-[#1a1a2e]", text: "text-[#e8e8e8]", name: "Noturno", background: "#1a1a2e", textColor: "#e8e8e8" },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    // Default to dark mode on native apps for consistent experience
    if (isNative) return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [readingTheme, setReadingThemeState] = useState<ReadingTheme>(() => {
    const stored = localStorage.getItem("readingTheme");
    if (stored === "default" || stored === "sepia" || stored === "paper" || stored === "night") {
      return stored;
    }
    return "default";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("readingTheme", readingTheme);
    
    // Apply reading theme CSS variables to document root
    const root = document.documentElement;
    const themeStyles = readingThemeStyles[readingTheme];
    
    if (readingTheme !== "default") {
      root.style.setProperty("--reading-bg", themeStyles.background);
      root.style.setProperty("--reading-text", themeStyles.textColor);
      root.classList.add("reading-theme-active");
    } else {
      root.style.removeProperty("--reading-bg");
      root.style.removeProperty("--reading-text");
      root.classList.remove("reading-theme-active");
    }
  }, [readingTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setReadingTheme = (newTheme: ReadingTheme) => {
    setReadingThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, readingTheme, setTheme, setReadingTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export function getReadingThemeStyles(readingTheme: ReadingTheme) {
  return readingThemeStyles[readingTheme];
}

export const readingThemes = readingThemeStyles;
