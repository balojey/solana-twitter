import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppWalletProvider } from './components/WalletProvider';
import { Navigation } from './components/Navigation';
import { ProfileSetup } from './components/ProfileSetup';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { useProfile } from './hooks/useProfile';
import { useWallet } from '@solana/wallet-adapter-react';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { TweetPage } from './pages/TweetPage';

function TwitterApp() {
  const { publicKey } = useWallet();
  const { hasProfile, loading } = useProfile();

  const showProfileSetup = publicKey && !loading && !hasProfile;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container max-w-3xl mx-auto px-4 py-6">
        {/* Profile Setup Modal */}
        {showProfileSetup && (
          <ProfileSetup onProfileCreated={() => window.location.reload()} />
        )}

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile/:pubkey" element={<ProfilePage />} />
          <Route path="/tweet/:pubkey" element={<TweetPage />} />
        </Routes>
      </main>
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AppWalletProvider>
      <TooltipProvider>
        <Router>
          <TwitterApp />
        </Router>
      </TooltipProvider>
    </AppWalletProvider>
  );
}

export default App;