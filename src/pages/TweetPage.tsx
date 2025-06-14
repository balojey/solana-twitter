import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useTweets } from '../hooks/useTweets';
import { TweetCard } from '../components/TweetCard';
import { TweetFeed } from '../components/TweetFeed';
import { ComposeDialog } from '../components/ComposeDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Tweet } from '../types/tweet';
import { MessageCircle, Edit3 } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';

export function TweetPage() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchSingleTweet, refetch, getReplyCount } = useTweets();

  useEffect(() => {
    const loadTweet = async () => {
      if (!pubkey) return;

      try {
        setLoading(true);
        setError(null);
        
        const publicKey = new PublicKey(pubkey);
        const tweetData = await fetchSingleTweet(publicKey);
        
        if (!tweetData) {
          setError('Tweet not found');
        } else {
          setTweet(tweetData);
        }
      } catch (err) {
        console.error('Error loading tweet:', err);
        setError('Invalid tweet address');
      } finally {
        setLoading(false);
      }
    };

    loadTweet();
  }, [pubkey, fetchSingleTweet]);

  const handleReplyPosted = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tweet...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !tweet) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<MessageCircle className="w-full h-full" />}
          title="Tweet Not Found"
          description={error || "This tweet doesn't exist or has been deleted."}
          action={{
            label: "Back to Home",
            onClick: () => window.history.back()
          }}
        />
      </div>
    );
  }

  const replyCount = getReplyCount(tweet.publicKey);

  return (
    <div className="space-y-6">
      {/* Main Tweet */}
      <div className="border-b border-border">
        <TweetCard 
          tweet={tweet} 
          onReplyPosted={handleReplyPosted}
          showReplies={false}
          showReplyCount={false}
        />
        
        {/* Reply Stats & Action */}
        <div className="px-6 py-4 space-y-4">
          {replyCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
          )}
          
          <ComposeDialog 
            parentTweet={tweet.publicKey}
            onTweetPosted={handleReplyPosted}
          >
            <Button size="lg" className="w-full rounded-xl">
              <Edit3 className="w-5 h-5 mr-2" />
              Reply to this tweet
            </Button>
          </ComposeDialog>
        </div>
      </div>

      {/* Replies Thread */}
      <div className="px-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Replies
          </h3>
          <TweetFeed 
            parentTweet={tweet.publicKey}
            title=""
            showReplies={true}
            expandReplies={true}
          />
        </div>
      </div>
    </div>
  );
}