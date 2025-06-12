import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaProgram } from './useSolanaProgram';
import { Tweet } from '../types/tweet';
import {
  deriveTweetPDA,
  postTweetInstruction,
  decodeTweet,
  isTweetAccount,
  getAllProgramAccounts
} from '../utils/solana';

export function useTweets(parentTweet?: PublicKey | null, authorFilter?: PublicKey) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyCountsCache, setReplyCountsCache] = useState<Map<string, number>>(new Map());
  const program = useSolanaProgram();
  const { connection } = useConnection();

  const fetchTweets = async () => {
    if (!program) return;

    try {
      setLoading(true);
      setError(null);

      const tweetAccounts = await getAllProgramAccounts(connection, 'tweet');
      
      let tweetsData: (Tweet & { publicKey: PublicKey })[] = tweetAccounts.map((account) => {
        const tweetData = decodeTweet(account.account);
        return {
          ...tweetData,
          publicKey: account.pubkey,
        };
      });

      // Calculate reply counts for all tweets
      const replyCounts = new Map<string, number>();
      tweetsData.forEach(tweet => {
        if (tweet.parent) {
          const parentKey = tweet.parent.toString();
          replyCounts.set(parentKey, (replyCounts.get(parentKey) || 0) + 1);
        }
      });
      setReplyCountsCache(replyCounts);

      // Apply filters
      if (parentTweet) {
        // Filter for replies to a specific tweet
        tweetsData = tweetsData.filter(tweet => 
          tweet.parent && tweet.parent.equals(parentTweet)
        );
      } else if (parentTweet === null) {
        // Filter for top-level tweets only (no parent)
        tweetsData = tweetsData.filter(tweet => !tweet.parent);
      }

      if (authorFilter) {
        // Filter by author
        tweetsData = tweetsData.filter(tweet => 
          tweet.authority.equals(authorFilter)
        );
      }

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

  const fetchSingleTweet = async (tweetPubkey: PublicKey): Promise<(Tweet & { publicKey: PublicKey }) | null> => {
    if (!program) return null;

    try {
      const accountInfo = await program.connection.getAccountInfo(tweetPubkey);
      
      if (!accountInfo || !isTweetAccount(accountInfo)) {
        return null;
      }

      const tweetData = decodeTweet(accountInfo);
      
      return {
        ...tweetData,
        publicKey: tweetPubkey,
      };
    } catch (err) {
      console.error('Error fetching single tweet:', err);
      return null;
    }
  };

  const postTweet = async (content: string, parentTweet?: PublicKey | null): Promise<string> => {
    if (!program || !program.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const [tweetPDA] = await deriveTweetPDA(program.wallet.publicKey, timestamp);

    const instruction = postTweetInstruction(
      tweetPDA,
      program.wallet.publicKey,
      content,
      timestamp,
      parentTweet || null
    );

    return await program.sendTransaction([instruction]);
  };

  const getReplyCount = (tweetPubkey: PublicKey): number => {
    return replyCountsCache.get(tweetPubkey.toString()) || 0;
  };

  const fetchRepliesForTweet = async (tweetPubkey: PublicKey): Promise<(Tweet & { publicKey: PublicKey })[]> => {
    if (!program) return [];

    try {
      const tweetAccounts = await getAllProgramAccounts(connection, 'tweet');
      
      const replies: (Tweet & { publicKey: PublicKey })[] = tweetAccounts
        .filter(account => {
          const tweetData = decodeTweet(account.account);
          return tweetData.parent && tweetData.parent.equals(tweetPubkey);
        })
        .map((account) => {
          const tweetData = decodeTweet(account.account);
          return {
            ...tweetData,
            publicKey: account.pubkey,
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp); // Oldest first for replies

      return replies;
    } catch (err) {
      console.error('Error fetching replies:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [program, parentTweet, authorFilter]);

  return { 
    tweets, 
    loading, 
    error, 
    refetch: fetchTweets,
    fetchSingleTweet,
    getReplyCount,
    fetchRepliesForTweet,
    postTweet
  };
}