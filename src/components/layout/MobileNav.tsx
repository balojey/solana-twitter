import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Home, User, Edit3, Search, Bookmark } from 'lucide-react';
import { ComposeDialog } from '../ComposeDialog';
import { cn } from '@/src/lib/utils';

export function MobileNav() {
  const location = useLocation();
  const { publicKey } = useWallet();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: User, label: 'Profile', path: publicKey ? `/profile/${publicKey.toString()}` : '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl">
      <div className="flex items-center justify-around px-6 py-3 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 min-w-0 group",
                isActive 
                  ? "text-primary bg-primary/10 shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className={cn(
                "w-7 h-7 transition-all duration-300 group-hover:scale-110",
                isActive && "drop-shadow-sm"
              )} />
              <span className={cn(
                "text-xs font-bold truncate transition-all duration-300",
                isActive && "text-primary"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
        
        {/* Compose Button */}
        <ComposeDialog>
          <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl text-primary group transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Edit3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xs font-bold">Tweet</span>
          </div>
        </ComposeDialog>
      </div>
    </div>
  );
}