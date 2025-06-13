import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useTweets } from '../hooks/useTweets';
import { TweetCard } from '../components/TweetCard';
import { TweetFeed } from '../components/TweetFeed';
import { TweetForm } from '../components/TweetForm';
import { Tweet } from '../types/tweet';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
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
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading tweet...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !tweet) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Tweet Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'This tweet doesn\'t exist.'}</p>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const replyCount = getReplyCount(tweet.publicKey);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost">
        <Link to="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </Button>

      {/* Main Tweet */}
      <Card>
        <TweetCard 
          tweet={tweet} 
          onReplyPosted={handleReplyPosted}
          showReplies={false}
          showReplyCount={false}
        />
        
        {/* Reply Stats */}
        {replyCount > 0 && (
          <>
            <Separator />
            <CardContent className="pt-3 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Reply Form */}
      <TweetForm
        parentTweet={tweet.publicKey}
        onTweetPosted={handleReplyPosted}
        placeholder="Tweet your reply..."
      />

      {/* Replies Thread */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
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
  );
}