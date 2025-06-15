import { MessageCircle, Sparkles, TrendingUp } from 'lucide-react';
import { TweetForm } from '../components/TweetForm';
import { TweetFeed } from '../components/TweetFeed';
import { EmptyState } from '../components/EmptyState';
import { ComposeDialog } from '../components/ComposeDialog';
import { useTweets } from '../hooks/useTweets';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProfile } from '../hooks/useProfile';
import { Card, CardContent } from '@/src/components/ui/card';

export function HomePage() {
  const { refetch, tweets, loading } = useTweets(null);
  const { publicKey } = useWallet();
  const { hasProfile } = useProfile();

  const showTweetForm = publicKey && hasProfile;

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Welcome Banner */}
      {showTweetForm && (
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome to Solana Social</h2>
                <p className="text-muted-foreground text-lg">Share your thoughts with the decentralized community</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tweet Form */}
      {showTweetForm && (
        <TweetForm onTweetPosted={refetch} />
      )}

      {/* Tweet Feed */}
      {!loading && tweets.length === 0 ? (
        <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-dashed border-2 border-muted/50">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No tweets yet</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Be the first to share something with the community! Connect your wallet and create a profile to get started.
            </p>
            {!publicKey && (
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-medium">
                <TrendingUp className="w-4 h-4" />
                Connect wallet to begin
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <TweetFeed 
          parentTweet={null} 
          expandReplies={false}
        />
      )}
    </div>
  );
}