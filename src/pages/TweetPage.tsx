import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useTweets } from '../hooks/useTweets';
import { TweetCard } from '../components/TweetCard';
import { TweetFeed } from '../components/TweetFeed';
import { TweetForm } from '../components/TweetForm';
import { Tweet } from '../types/tweet';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';

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
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
        <p className="text-gray-400">Loading tweet...</p>
      </div>
    );
  }

  if (error || !tweet) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Tweet Not Found</h2>
        <p className="text-gray-400 mb-4">{error || 'This tweet doesn\'t exist.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const replyCount = getReplyCount(tweet.publicKey);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Main Tweet */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <TweetCard 
          tweet={tweet} 
          onReplyPosted={handleReplyPosted}
          showReplies={false} // Don't show reply button in main tweet on thread page
          showReplyCount={false} // Don't show reply count in main tweet
        />
        
        {/* Reply Stats */}
        {replyCount > 0 && (
          <div className="px-4 pb-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-gray-400 text-sm pt-3">
              <MessageCircle className="w-4 h-4" />
              <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reply Form */}
      <div className="bg-gray-800 rounded-lg">
        <TweetForm
          parentTweet={tweet.publicKey}
          onTweetPosted={handleReplyPosted}
          placeholder="Tweet your reply..."
        />
      </div>

      {/* Replies Thread */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Replies
        </h3>
        <TweetFeed 
          parentTweet={tweet.publicKey}
          title=""
          showReplies={true}
          expandReplies={true} // Auto-expand nested replies in thread view
        />
      </div>
    </div>
  );
}