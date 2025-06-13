import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useTweets } from '../hooks/useTweets';
import { useProfile } from '../hooks/useProfile';
import { Send, Loader2, X, MessageCircle } from 'lucide-react';

interface Props {
  onTweetPosted: () => void;
  parentTweet?: PublicKey | null;
  onCancel?: () => void;
  placeholder?: string;
}

export function TweetForm({ onTweetPosted, parentTweet, onCancel, placeholder }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const { hasProfile } = useProfile();
  const { postTweet } = useTweets();

  const isReply = !!parentTweet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !publicKey || !hasProfile) return;

    try {
      setLoading(true);
      setError(null);

      await postTweet(content.trim(), parentTweet);

      setContent('');
      onTweetPosted();
      if (onCancel) onCancel();
    } catch (err) {
      console.error('Error posting tweet:', err);
      setError('Failed to post tweet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Connect your wallet to post tweets</p>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Create a profile to start posting tweets</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
      {isReply && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-purple-400">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Replying to tweet</span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || (isReply ? "Tweet your reply..." : "What's happening?")}
          className="w-full bg-gray-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={isReply ? 2 : 3}
          maxLength={280}
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-400">
            {content.length}/280
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || loading || content.length > 280}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isReply ? 'Replying...' : 'Posting...'}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {isReply ? 'Reply' : 'Post Tweet'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}