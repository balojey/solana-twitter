import { useTweets } from '../hooks/useTweets';
import { TweetCard } from './TweetCard';
import { Loader2, RefreshCw } from 'lucide-react';

export function TweetFeed() {
  const { tweets, loading, error, refetch } = useTweets();

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
        <p className="text-gray-400">Loading tweets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Tweet Feed</h2>
        <button
          onClick={refetch}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh tweets"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {tweets.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">No tweets yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.publicKey.toString()} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
}
