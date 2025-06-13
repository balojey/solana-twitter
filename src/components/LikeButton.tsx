import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLikes } from '../hooks/useLikes';
import { Heart, Loader2 } from 'lucide-react';

interface Props {
  tweetPubkey: PublicKey;
  className?: string;
}

export function LikeButton({ tweetPubkey, className = '' }: Props) {
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const { getLikeCount, isLikedByUser, toggleLike } = useLikes();

  const likeCount = getLikeCount(tweetPubkey);
  const isLiked = isLikedByUser(tweetPubkey);

  const handleLike = async () => {
    if (!publicKey || loading) return;

    try {
      setLoading(true);
      await toggleLike(tweetPubkey);
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className={`flex items-center gap-1 text-gray-500 ${className}`}>
        <Heart className="w-4 h-4" />
        <span className="text-sm">{likeCount}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 transition-colors disabled:cursor-not-allowed ${
        isLiked
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-400'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      )}
      <span className="text-sm">{likeCount}</span>
    </button>
  );
}