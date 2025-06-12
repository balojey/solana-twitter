import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppWalletProvider } from './components/WalletProvider';
import { WalletButton } from './components/WalletButton';
import { ProfileSetup } from './components/ProfileSetup';
import { useProfile } from './hooks/useProfile';
import { useWallet } from '@solana/wallet-adapter-react';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { TweetPage } from './pages/TweetPage';
import { Link } from 'react-router-dom';

function TwitterApp() {
  const { publicKey } = useWallet();
  const { hasProfile, loading } = useProfile();

  const showProfileSetup = publicKey && !loading && !hasProfile;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-3xl font-bold text-white hover:text-purple-400 transition-colors">
            Solana Twitter
          </Link>
          <WalletButton />
        </div>

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
      </div>
    </div>
  );
}

function App() {
  return (
    <AppWalletProvider>
      <Router>
        <TwitterApp />
      </Router>
    </AppWalletProvider>
  );
}

export default App;