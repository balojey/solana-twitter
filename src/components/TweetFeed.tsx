import { useTweets } from '../hooks/useTweets';
import { TweetCard } from './TweetCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { RefreshCw, MessageCircle } from 'lucide-react';

interface Props {
  parentTweet?: PublicKey | null;
  authorFilter?: PublicKey;
  title?: string;
  showReplies?: boolean;
  expandReplies?: boolean;
}

export function TweetFeed({ 
  parentTweet, 
  authorFilter, 
  title, 
  showReplies = true,
  expandReplies = false
}: Props) {
  const { tweets, loading, error, refetch } = useTweets(parentTweet, authorFilter);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tweets...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const feedTitle = title || (parentTweet ? 'Replies' : 'Tweet Feed');

  return (
    <div className="space-y-4">
      {title !== "" && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{feedTitle}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            className="text-muted-foreground hover:text-foreground rounded-full"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      )}

      {tweets.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="w-full h-full" />}
          title={parentTweet ? 'No replies yet' : 'No tweets yet'}
          description={parentTweet ? 'Be the first to reply to this tweet!' : 'Be the first to post something!'}
        />
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <TweetCard 
              key={tweet.publicKey.toString()} 
              tweet={tweet} 
              onReplyPosted={refetch}
              showReplies={showReplies}
              isReply={!!parentTweet}
              showReplyCount={!parentTweet}
              expandReplies={expandReplies}
            />
          ))}
        </div>
      )}
    </div>
  );
}