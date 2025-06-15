import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRetweets } from '../hooks/useRetweets';
import { Repeat, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

interface Props {
  tweetPubkey: PublicKey;
  className?: string;
}

export function RetweetButton({ tweetPubkey, className = '' }: Props) {
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const { getRetweetCount, isRetweetedByUser, retweetTweet } = useRetweets();

  const retweetCount = getRetweetCount(tweetPubkey);
  const isRetweeted = isRetweetedByUser(tweetPubkey);

  const handleRetweet = async () => {
    if (!publicKey || loading || isRetweeted) return;

    try {
      setLoading(true);
      await retweetTweet(tweetPubkey);
    } catch (err) {
      console.error('Error retweeting:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className={cn("flex items-center gap-3 text-muted-foreground", className)}>
        <Repeat className="h-5 w-5" />
        <span className="text-sm font-medium">{retweetCount}</span>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRetweet}
      disabled={loading || isRetweeted}
      className={cn(
        "h-auto p-3 gap-3 transition-all duration-300 rounded-2xl hover:scale-105 group",
        isRetweeted
          ? "text-green-500 hover:text-green-600 hover:bg-green-500/10 bg-green-500/5"
          : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Repeat className={cn(
          "h-5 w-5 transition-all duration-300 group-hover:scale-110",
          isRetweeted && "drop-shadow-sm"
        )} />
      )}
      <span className="text-sm font-medium">{retweetCount}</span>
    </Button>
  );
}