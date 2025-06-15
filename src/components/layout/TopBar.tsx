import { useLocation } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ModeToggle } from '@/src/components/ui/mode-toggle';
import { useRouter } from '../../hooks/useRouter';

export function TopBar() {
  const location = useLocation();
  const router = useRouter();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path.startsWith('/profile/')) return 'Profile';
    if (path.startsWith('/tweet/')) return 'Tweet';
    if (path === '/explore') return 'Explore';
    if (path === '/notifications') return 'Notifications';
    if (path === '/bookmarks') return 'Bookmarks';
    return 'Solana Social';
  };

  const showBackButton = location.pathname !== '/';

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-5">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-2xl hover:bg-accent/80 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {getPageTitle()}
            </h1>
            {location.pathname === '/' && (
              <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-2xl hover:bg-accent/80 transition-all duration-300 hover:scale-105"
          >
            <MoreHorizontal className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}