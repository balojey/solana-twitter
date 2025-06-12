import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useTweets } from '../hooks/useTweets';
import { TweetCard } from '../components/TweetCard';
import { TweetFeed } from '../components/TweetFeed';
import { Tweet } from '../types/tweet';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function TweetPage() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchSingleTweet, refetch } = useTweets();

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
      <TweetCard 
        tweet={tweet} 
        onReplyPosted={refetch}
        showReplies={true}
      />

      {/* Replies */}
      <TweetFeed 
        parentTweet={tweet.publicKey}
        title="Replies"
        showReplies={false}
      />
    </div>
  );
}