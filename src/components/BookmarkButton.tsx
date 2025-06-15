import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

interface Props {
  tweetPubkey: PublicKey;
  className?: string;
}

export function BookmarkButton({ tweetPubkey, className = '' }: Props) {
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const { isBookmarkedByUser, toggleBookmark } = useBookmarks();

  const isBookmarked = isBookmarkedByUser(tweetPubkey);

  const handleBookmark = async () => {
    if (!publicKey || loading) return;

    try {
      setLoading(true);
      await toggleBookmark(tweetPubkey);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBookmark}
      disabled={loading}
      className={cn(
        "h-auto p-3 transition-all duration-300 rounded-2xl hover:scale-105 group",
        isBookmarked
          ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 bg-yellow-500/5"
          : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="h-5 w-5 transition-all duration-300 group-hover:scale-110 fill-current drop-shadow-sm" />
      ) : (
        <Bookmark className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
      )}
    </Button>
  );
}