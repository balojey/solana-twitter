import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaProgram } from './useSolanaProgram';
import { Retweet } from '../types/retweet';
import {
  deriveRetweetPDA,
  retweetInstruction,
  decodeRetweet,
  isRetweetAccount,
  getAllProgramAccounts
} from '../utils/solana';
import { time } from 'console';

export function useRetweets() {
  const [retweets, setRetweets] = useState<Map<string, Retweet[]>>(new Map());
  const [userRetweets, setUserRetweets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const program = useSolanaProgram();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const fetchRetweets = useCallback(async () => {
    if (!program) return;

    try {
      setLoading(true);
      setError(null);

      const retweetAccounts = await getAllProgramAccounts(connection, 'retweet');
      
      const retweetsData: (Retweet & { publicKey: PublicKey })[] = retweetAccounts.map((account) => {
        const retweetData = decodeRetweet(account.account);
        return {
          ...retweetData,
          publicKey: account.pubkey,
        };
      });

      // Group retweets by original tweet
      const retweetsByTweet = new Map<string, Retweet[]>();
      const currentUserRetweets = new Set<string>();

      retweetsData.forEach(retweet => {
        const tweetKey = retweet.originalTweet.toString();
        
        if (!retweetsByTweet.has(tweetKey)) {
          retweetsByTweet.set(tweetKey, []);
        }
        retweetsByTweet.get(tweetKey)!.push(retweet);

        // Track current user's retweets
        if (publicKey && retweet.user.equals(publicKey)) {
          currentUserRetweets.add(tweetKey);
        }
      });

      setRetweets(retweetsByTweet);
      setUserRetweets(currentUserRetweets);
    } catch (err) {
      console.error('Error fetching retweets:', err);
      setError('Failed to fetch retweets');
    } finally {
      setLoading(false);
    }
  }, [program, connection, publicKey]);

  const retweetTweet = async (tweetPubkey: PublicKey): Promise<string> => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const [retweetPDA] = await deriveRetweetPDA(publicKey, tweetPubkey);
    console.log('Passed here!')

    const instruction = retweetInstruction(
      retweetPDA,
      publicKey,
      tweetPubkey,
      timestamp
    );

    const signature = await program.sendTransaction([instruction]);
    
    // Optimistically update local state
    const tweetKey = tweetPubkey.toString();
    setUserRetweets(prev => new Set(prev).add(tweetKey));
    
    // Refresh retweets after transaction
    setTimeout(() => fetchRetweets(), 1000);
    
    return signature;
  };

  const getRetweetCount = useCallback((tweetPubkey: PublicKey): number => {
    const tweetKey = tweetPubkey.toString();
    return retweets.get(tweetKey)?.length || 0;
  }, [retweets]);

  const isRetweetedByUser = (tweetPubkey: PublicKey): boolean => {
    const tweetKey = tweetPubkey.toString();
    return userRetweets.has(tweetKey);
  };

  const getRetweetedBy = useCallback((tweetPubkey: PublicKey): Retweet[] => {
    const tweetKey = tweetPubkey.toString();
    return retweets.get(tweetKey) || [];
  }, [retweets]);

  useEffect(() => {
    fetchRetweets();
  }, [fetchRetweets]);

  return {
    retweets,
    loading,
    error,
    refetch: fetchRetweets,
    retweetTweet,
    getRetweetCount,
    isRetweetedByUser,
    getRetweetedBy
  };
}