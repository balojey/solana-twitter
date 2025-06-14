import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Home, User, Edit3, Search } from 'lucide-react';
import { ComposeDialog } from '../ComposeDialog';
import { cn } from '@/src/lib/utils';

export function MobileNav() {
  const location = useLocation();
  const { publicKey } = useWallet();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: User, label: 'Profile', path: publicKey ? `/profile/${publicKey.toString()}` : '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Compose Button */}
        <ComposeDialog>
          <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-primary">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium">Tweet</span>
          </div>
        </ComposeDialog>
      </div>
    </div>
  );
}