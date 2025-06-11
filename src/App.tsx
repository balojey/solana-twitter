import { AppWalletProvider } from './components/WalletProvider';
import { WalletButton } from './components/WalletButton';
import { TweetForm } from './components/TweetForm';
import { TweetFeed } from './components/TweetFeed';
import { useTweets } from './hooks/useTweets';

function TwitterApp() {
  const { refetch } = useTweets();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Solana Twitter</h1>
          <WalletButton />
        </div>

        {/* Tweet Form */}
        <div className="mb-8">
          <TweetForm onTweetPosted={refetch} />
        </div>

        {/* Tweet Feed */}
        <TweetFeed />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppWalletProvider>
      <TwitterApp />
    </AppWalletProvider>
  );
}

export default App;
