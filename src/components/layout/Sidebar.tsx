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
  Twitter
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
    { icon: User, label: 'Profile', path: publicKey ? `/profile/${publicKey.toString()}` : '/profile', count: null },
  ];

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Logo */}
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Twitter className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Solana Social</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 transition-transform group-hover:scale-110",
                isActive && "text-primary-foreground"
              )} />
              <span className="flex-1">{item.label}</span>
              {item.count && (
                <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Compose Button */}
        <div className="pt-4">
          <ComposeDialog>
            <Button size="lg" className="w-full rounded-xl font-semibold text-lg py-6">
              <Edit3 className="w-5 h-5 mr-2" />
              Compose
            </Button>
          </ComposeDialog>
        </div>
      </nav>

      <Separator className="my-6" />

      {/* User Section */}
      {publicKey ? (
        <div className="space-y-4">
          <Link 
            to={`/profile/${publicKey.toString()}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
          >
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {profile?.username ? profile.username.slice(0, 2).toUpperCase() : publicKey.toString().slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {profile?.username || truncateAddress(publicKey.toString())}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {truncateAddress(publicKey.toString())}
              </p>
            </div>
          </Link>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => disconnect()}
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <WalletButton />
          <p className="text-sm text-muted-foreground text-center">
            Connect your wallet to get started
          </p>
        </div>
      )}
    </div>
  );
}