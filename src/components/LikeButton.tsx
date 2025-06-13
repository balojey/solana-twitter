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
      <div className={cn("flex items-center gap-1 text-muted-foreground", className)}>
        <Heart className="h-4 w-4" />
        <span className="text-sm">{likeCount}</span>
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
        "h-auto p-1 gap-1 transition-colors",
        isLiked
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-red-400",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
      )}
      <span className="text-sm">{likeCount}</span>
    </Button>
  );
}