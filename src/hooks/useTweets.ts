import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useAnchorProgram } from './useAnchorProgram';
import { Tweet } from '../types/tweet';

export function useTweets(parentTweet?: PublicKey | null, authorFilter?: PublicKey) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyCountsCache, setReplyCountsCache] = useState<Map<string, number>>(new Map());
  const program = useAnchorProgram();
  const { connection } = useConnection();

  const fetchTweets = async () => {
    if (!program) return;

    try {
      setLoading(true);
      setError(null);

      const tweetAccounts = await program.account.tweet.all();
      
      let tweetsData: Tweet[] = tweetAccounts.map((account) => ({
        authority: account.account.authority,
        content: account.account.content,
        timestamp: account.account.timestamp.toNumber(),
        parent: account.account.parent || null,
        publicKey: account.publicKey,
      }));

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

  const fetchSingleTweet = async (tweetPubkey: PublicKey): Promise<Tweet | null> => {
    if (!program) return null;

    try {
      const tweetAccount = await program.account.tweet.fetch(tweetPubkey);
      
      return {
        authority: tweetAccount.authority,
        content: tweetAccount.content,
        timestamp: tweetAccount.timestamp.toNumber(),
        parent: tweetAccount.parent || null,
        publicKey: tweetPubkey,
      };
    } catch (err) {
      console.error('Error fetching single tweet:', err);
      return null;
    }
  };

  const getReplyCount = (tweetPubkey: PublicKey): number => {
    return replyCountsCache.get(tweetPubkey.toString()) || 0;
  };

  const fetchRepliesForTweet = async (tweetPubkey: PublicKey): Promise<Tweet[]> => {
    if (!program) return [];

    try {
      const tweetAccounts = await program.account.tweet.all();
      
      const replies: Tweet[] = tweetAccounts
        .filter(account => 
          account.account.parent && 
          account.account.parent.equals(tweetPubkey)
        )
        .map((account) => ({
          authority: account.account.authority,
          content: account.account.content,
          timestamp: account.account.timestamp.toNumber(),
          parent: account.account.parent || null,
          publicKey: account.publicKey,
        }))
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
    fetchRepliesForTweet
  };
}