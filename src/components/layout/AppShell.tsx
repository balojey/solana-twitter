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
    <div className="min-h-screen bg-background">
      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <ProfileSetup onProfileCreated={() => window.location.reload()} />
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="w-64 xl:w-80 flex-shrink-0">
          <div className="fixed h-screen w-64 xl:w-80 border-r border-border">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto border-x border-border min-h-screen">
            <TopBar />
            <main className="pb-20">
              {children}
            </main>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0 hidden xl:block">
          <div className="fixed h-screen w-80 pl-6">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
        <TopBar />
        <main className="pb-20 px-4">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}