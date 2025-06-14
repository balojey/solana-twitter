import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaProgram } from './useSolanaProgram';
import { Like } from '../types/like';
import {
  deriveLikePDA,
  likeTweetInstruction,
  unlikeTweetInstruction,
  decodeLike,
  isLikeAccount,
  getAllProgramAccounts
} from '../utils/solana';

export function useLikes() {
  const [likes, setLikes] = useState<Map<string, Like[]>>(new Map());
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const program = useSolanaProgram();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const fetchLikes = useCallback(async () => {
    if (!program) return;

    try {
      setLoading(true);
      setError(null);

      const likeAccounts = await getAllProgramAccounts(connection, 'like');
      
      const likesData: (Like & { publicKey: PublicKey })[] = likeAccounts.map((account) => {
        const likeData = decodeLike(account.account);
        return {
          ...likeData,
          publicKey: account.pubkey,
        };
      });

      // Group likes by tweet
      const likesByTweet = new Map<string, Like[]>();
      const currentUserLikes = new Set<string>();

      likesData.forEach(like => {
        const tweetKey = like.tweet.toString();
        
        if (!likesByTweet.has(tweetKey)) {
          likesByTweet.set(tweetKey, []);
        }
        likesByTweet.get(tweetKey)!.push(like);

        // Track current user's likes
        if (publicKey && like.user.equals(publicKey)) {
          currentUserLikes.add(tweetKey);
        }
      });

      setLikes(likesByTweet);
      setUserLikes(currentUserLikes);
    } catch (err) {
      console.error('Error fetching likes:', err);
      setError('Failed to fetch likes');
    } finally {
      setLoading(false);
    }
  }, [program, connection, publicKey]);

  const likeTweet = async (tweetPubkey: PublicKey): Promise<string> => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const [likePDA] = await deriveLikePDA(publicKey, tweetPubkey);

    const instruction = likeTweetInstruction(
      likePDA,
      publicKey,
      tweetPubkey
    );

    const signature = await program.sendTransaction([instruction]);
    
    // Optimistically update local state
    const tweetKey = tweetPubkey.toString();
    setUserLikes(prev => new Set(prev).add(tweetKey));
    
    // Refresh likes after transaction
    setTimeout(() => fetchLikes(), 1000);
    
    return signature;
  };

  const unlikeTweet = async (tweetPubkey: PublicKey): Promise<string> => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const [likePDA] = await deriveLikePDA(publicKey, tweetPubkey);

    const instruction = unlikeTweetInstruction(
      likePDA,
      publicKey,
      tweetPubkey
    );

    const signature = await program.sendTransaction([instruction]);
    
    // Optimistically update local state
    const tweetKey = tweetPubkey.toString();
    setUserLikes(prev => {
      const newSet = new Set(prev);
      newSet.delete(tweetKey);
      return newSet;
    });
    
    // Refresh likes after transaction
    setTimeout(() => fetchLikes(), 1000);
    
    return signature;
  };

  const getLikeCount = useCallback((tweetPubkey: PublicKey): number => {
    const tweetKey = tweetPubkey.toString();
    return likes.get(tweetKey)?.length || 0;
  }, [likes]);

  const isLikedByUser = (tweetPubkey: PublicKey): boolean => {
    const tweetKey = tweetPubkey.toString();
    return userLikes.has(tweetKey);
  };

  const toggleLike = useCallback(async (tweetPubkey: PublicKey): Promise<string> => {
    if (isLikedByUser(tweetPubkey)) {
      return await unlikeTweet(tweetPubkey);
    } else {
      return await likeTweet(tweetPubkey);
    }
  }, [isLikedByUser, likeTweet, unlikeTweet]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  return {
    likes,
    loading,
    error,
    refetch: fetchLikes,
    likeTweet,
    unlikeTweet,
    toggleLike,
    getLikeCount,
    isLikedByUser
  };
}