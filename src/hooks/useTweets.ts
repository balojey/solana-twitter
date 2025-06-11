import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useAnchorProgram } from './useAnchorProgram';
import { Tweet } from '../types/tweet';

export function useTweets() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const program = useAnchorProgram();
  const { connection } = useConnection();

  const fetchTweets = async () => {
    if (!program) return;

    try {
      setLoading(true);
      setError(null);

      const tweetAccounts = await program.account.tweet.all();
      
      const tweetsData: Tweet[] = tweetAccounts.map((account) => ({
        authority: account.account.authority,
        content: account.account.content,
        timestamp: account.account.timestamp.toNumber(),
        publicKey: account.publicKey,
      }));

      // Sort by timestamp (newest first)
      tweetsData.sort((a, b) => b.timestamp - a.timestamp);
      
      setTweets(tweetsData);
    } catch (err) {
      console.error('Error fetching tweets:', err);
      setError('Failed to fetch tweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [program]);

  return { tweets, loading, error, refetch: fetchTweets };
}
