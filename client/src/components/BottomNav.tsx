import { Home, BookOpen, Book, Trophy, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItem {
  title: string;
  url: string;
  icon: typeof Home;
  testId: string;
}

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { title: t.nav.home, url: '/', icon: Home, testId: 'nav-home' },
    { title: t.nav.bible, url: '/bible-reader', icon: BookOpen, testId: 'nav-bible' },
    { title: t.nav.plans, url: '/plans', icon: Book, testId: 'nav-plans' },
    { title: t.nav.progress, url: '/progress', icon: Trophy, testId: 'nav-progress' },
    { title: t.nav.you, url: '/perfil', icon: User, testId: 'nav-you' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.url;
          
          return (
            <Link 
              key={item.url} 
              href={item.url}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[4rem] transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid={item.testId}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
