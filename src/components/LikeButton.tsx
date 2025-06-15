import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLikes } from '../hooks/useLikes';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

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
      <div className={cn("flex items-center gap-3 text-muted-foreground", className)}>
        <Heart className="h-5 w-5" />
        <span className="text-sm font-medium">{likeCount}</span>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className={cn(
        "h-auto p-3 gap-3 transition-all duration-300 rounded-2xl hover:scale-105 group",
        isLiked
          ? "text-red-500 hover:text-red-600 hover:bg-red-500/10 bg-red-500/5"
          : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={cn(
          "h-5 w-5 transition-all duration-300 group-hover:scale-110",
          isLiked && "fill-current drop-shadow-sm"
        )} />
      )}
      <span className="text-sm font-medium">{likeCount}</span>
    </Button>
  );
}