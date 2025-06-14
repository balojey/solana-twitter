import { useLocation } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
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
    return 'Solana Social';
  };

  const showBackButton = location.pathname !== '/';

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold">{getPageTitle()}</h1>
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}