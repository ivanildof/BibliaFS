import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const languages = [
  { code: 'pt' as Language, name: 'Português', flag: '🇧🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'nl' as Language, name: 'Nederlands', flag: '🇳🇱' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          data-testid="button-language-selector"
          className="h-10 w-10 rounded-xl bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all shadow-sm active-elevate-2 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Globe className="h-5 w-5 relative z-10" />
          <span className="sr-only">Select Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="flex items-center gap-2"
            data-testid={`menu-item-language-${lang.code}`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
