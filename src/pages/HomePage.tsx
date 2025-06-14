import { MessageCircle } from 'lucide-react';
import { TweetForm } from '../components/TweetForm';
import { TweetFeed } from '../components/TweetFeed';
import { EmptyState } from '../components/EmptyState';
import { ComposeDialog } from '../components/ComposeDialog';
import { useTweets } from '../hooks/useTweets';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProfile } from '../hooks/useProfile';

export function HomePage() {
  const { refetch, tweets, loading } = useTweets(null);
  const { publicKey } = useWallet();
  const { hasProfile } = useProfile();

  const showTweetForm = publicKey && hasProfile;

  return (
    <div className="space-y-6 p-6">
      {/* Tweet Form */}
      {showTweetForm && (
        <TweetForm onTweetPosted={refetch} />
      )}

      {/* Tweet Feed */}
      {!loading && tweets.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="w-full h-full" />}
          title="No tweets yet"
          description="Be the first to share something with the community! Connect your wallet and create a profile to get started."
          action={!publicKey ? undefined : {
            label: "Compose Tweet",
            onClick: () => {}
          }}
        />
      ) : (
        <TweetFeed 
          parentTweet={null} 
          expandReplies={false}
        />
      )}
    </div>
  );
}