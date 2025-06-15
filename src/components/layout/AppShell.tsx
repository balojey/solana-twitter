import { ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { RightSidebar } from './RightSidebar';
import { TopBar } from './TopBar';
import { ProfileSetup } from '../ProfileSetup';
import { useProfile } from '../../hooks/useProfile';
import { cn } from '@/src/lib/utils';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { publicKey } = useWallet();
  const { hasProfile, loading } = useProfile();

  const showProfileSetup = publicKey && !loading && !hasProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <ProfileSetup onProfileCreated={() => window.location.reload()} />
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="w-64 xl:w-80 flex-shrink-0">
          <div className="fixed h-screen w-64 xl:w-80 border-r border-border/50 bg-card/30 backdrop-blur-xl">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto border-x border-border/50 min-h-screen bg-card/20 backdrop-blur-sm">
            <TopBar />
            <main className="pb-24">
              {children}
            </main>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0 hidden xl:block">
          <div className="fixed h-screen w-80 pl-8 bg-card/20 backdrop-blur-sm">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
        <TopBar />
        <main className="pb-24 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}