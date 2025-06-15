import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTweets } from '../hooks/useTweets';
import { TweetCard } from '../components/TweetCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Tweet } from '../types/tweet';
import { Bookmark, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

export function BookmarksPage() {
  const [bookmarkedTweets, setBookmarkedTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const { fetchBookmarksForUser, refetch } = useBookmarks();
  const { fetchSingleTweet } = useTweets();

  const loadBookmarkedTweets = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);

      const userBookmarks = await fetchBookmarksForUser(publicKey);
      
      // Fetch the actual tweet data for each bookmark
      const tweetPromises = userBookmarks.map(async (bookmark) => {
        const tweet = await fetchSingleTweet(bookmark.tweet);
        return tweet;
      });

      const tweets = await Promise.all(tweetPromises);
      const validTweets = tweets.filter((tweet): tweet is Tweet => tweet !== null);
      
      setBookmarkedTweets(validTweets);
    } catch (err) {
      console.error('Error loading bookmarked tweets:', err);
      setError('Failed to load bookmarked tweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarkedTweets();
  }, [publicKey]);

  const handleRefresh = () => {
    refetch();
    loadBookmarkedTweets();
  };

  if (!publicKey) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-dashed border-2 border-muted/50">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-3xl flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Connect your wallet to view your bookmarked tweets
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
          <CardContent className="p-16 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">Loading bookmarks...</h3>
            <p className="text-muted-foreground">Please wait while we fetch your bookmarked tweets</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-3xl flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-destructive">Error Loading Bookmarks</h3>
            <p className="text-muted-foreground text-lg mb-8">{error}</p>
            <Button onClick={handleRefresh} className="rounded-2xl px-8">
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-2xl flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Bookmarks
            </h1>
            <p className="text-muted-foreground text-lg">
              {bookmarkedTweets.length} {bookmarkedTweets.length === 1 ? 'tweet' : 'tweets'} saved
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="rounded-2xl hover:bg-accent/80 transition-all duration-300 hover:scale-105"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Bookmarked Tweets */}
      {bookmarkedTweets.length === 0 ? (
        <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-dashed border-2 border-muted/50">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-3xl flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No bookmarks yet</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              When you bookmark tweets, they'll appear here so you can easily find them later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookmarkedTweets.map((tweet) => (
            <TweetCard
              key={tweet.publicKey.toString()}
              tweet={tweet}
              onReplyPosted={loadBookmarkedTweets}
              showReplies={true}
              showReplyCount={true}
              expandReplies={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}