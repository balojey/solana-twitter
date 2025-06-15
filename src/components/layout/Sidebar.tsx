import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Home, 
  User, 
  Search, 
  Bell, 
  Edit3,
  Settings,
  LogOut,
  Twitter,
  Bookmark
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Separator } from '@/src/components/ui/separator';
import { WalletButton } from '../WalletButton';
import { useProfile } from '../../hooks/useProfile';
import { ComposeDialog } from '../ComposeDialog';
import { cn } from '@/src/lib/utils';

export function Sidebar() {
  const location = useLocation();
  const { publicKey, disconnect } = useWallet();
  const { profile } = useProfile();

  const navItems = [
    { icon: Home, label: 'Home', path: '/', count: null },
    { icon: Search, label: 'Explore', path: '/explore', count: null },
    { icon: Bell, label: 'Notifications', path: '/notifications', count: 3 },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks', count: null },
    { icon: User, label: 'Profile', path: publicKey ? `/profile/${publicKey.toString()}` : '/profile', count: null },
  ];

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col h-full p-8">
      {/* Logo */}
      <div className="mb-12">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <Twitter className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Solana Social
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-5 px-6 py-4 rounded-2xl text-lg font-medium transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-foreground hover:bg-gradient-to-r hover:from-accent hover:to-accent/80 hover:text-accent-foreground hover:shadow-md"
              )}
            >
              <Icon className={cn(
                "w-7 h-7 transition-all duration-300 group-hover:scale-110",
                isActive && "text-primary-foreground drop-shadow-sm"
              )} />
              <span className="flex-1 font-semibold">{item.label}</span>
              {item.count && (
                <span className="bg-destructive text-destructive-foreground text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                  {item.count}
                </span>
              )}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl" />
              )}
            </Link>
          );
        })}

        {/* Compose Button */}
        <div className="pt-6">
          <ComposeDialog>
            <Button size="lg" className="w-full rounded-2xl font-bold text-lg py-7 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <Edit3 className="w-6 h-6 mr-3" />
              Compose
            </Button>
          </ComposeDialog>
        </div>
      </nav>

      <Separator className="my-8 bg-border/50" />

      {/* User Section */}
      {publicKey ? (
        <div className="space-y-6">
          <Link 
            to={`/profile/${publicKey.toString()}`}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent/50 transition-all duration-300 group"
          >
            <Avatar className="w-12 h-12 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-300 group-hover:scale-105">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg">
                {profile?.username ? profile.username.slice(0, 2).toUpperCase() : publicKey.toString().slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg truncate group-hover:text-primary transition-colors duration-300">
                {profile?.username || truncateAddress(publicKey.toString())}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {truncateAddress(publicKey.toString())}
              </p>
            </div>
          </Link>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="flex-1 rounded-xl hover:bg-accent/80 transition-all duration-300">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => disconnect()}
              className="flex-1 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <WalletButton />
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Connect your wallet to get started with Solana Social
          </p>
        </div>
      )}
    </div>
  );
}