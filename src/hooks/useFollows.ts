import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaProgram } from './useSolanaProgram';
import { Follow } from '../types/follow';
import {
  deriveFollowPDA,
  followUserInstruction,
  unfollowUserInstruction,
  decodeFollow,
  isFollowAccount,
  getAllProgramAccounts
} from '../utils/solana';

export function useFollows() {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [userFollowing, setUserFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const program = useSolanaProgram();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const fetchFollows = async () => {
    if (!program) return;

    try {
      setLoading(true);
      setError(null);

      const followAccounts = await getAllProgramAccounts(connection, 'follow');
      
      const followsData: (Follow & { publicKey: PublicKey })[] = followAccounts.map((account) => {
        const followData = decodeFollow(account.account);
        return {
          ...followData,
          publicKey: account.pubkey,
        };
      });

      setFollows(followsData);

      // Track current user's following
      if (publicKey) {
        const currentUserFollowing = new Set<string>();
        followsData.forEach(follow => {
          if (follow.follower.equals(publicKey)) {
            currentUserFollowing.add(follow.following.toString());
          }
        });
        setUserFollowing(currentUserFollowing);
      }
    } catch (err) {
      console.error('Error fetching follows:', err);
      setError('Failed to fetch follows');
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (followingPubkey: PublicKey): Promise<string> => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    if (publicKey.equals(followingPubkey)) {
      throw new Error('Cannot follow yourself');
    }

    const [followPDA] = await deriveFollowPDA(publicKey, followingPubkey);

    const instruction = followUserInstruction(
      followPDA,
      publicKey,
      followingPubkey
    );

    const signature = await program.sendTransaction([instruction]);
    
    // Optimistically update local state
    const followingKey = followingPubkey.toString();
    setUserFollowing(prev => new Set(prev).add(followingKey));
    
    // Refresh follows after transaction
    setTimeout(() => fetchFollows(), 1000);
    
    return signature;
  };

  const unfollowUser = async (followingPubkey: PublicKey): Promise<string> => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const [followPDA] = await deriveFollowPDA(publicKey, followingPubkey);

    const instruction = unfollowUserInstruction(
      followPDA,
      publicKey,
      followingPubkey
    );

    const signature = await program.sendTransaction([instruction]);
    
    // Optimistically update local state
    const followingKey = followingPubkey.toString();
    setUserFollowing(prev => {
      const newSet = new Set(prev);
      newSet.delete(followingKey);
      return newSet;
    });
    
    // Refresh follows after transaction
    setTimeout(() => fetchFollows(), 1000);
    
    return signature;
  };

  const getFollowerCount = (userPubkey: PublicKey): number => {
    return follows.filter(follow => follow.following.equals(userPubkey)).length;
  };

  const getFollowingCount = (userPubkey: PublicKey): number => {
    return follows.filter(follow => follow.follower.equals(userPubkey)).length;
  };

  const isFollowingUser = (userPubkey: PublicKey): boolean => {
    return userFollowing.has(userPubkey.toString());
  };

  const toggleFollow = async (userPubkey: PublicKey): Promise<string> => {
    if (isFollowingUser(userPubkey)) {
      return await unfollowUser(userPubkey);
    } else {
      return await followUser(userPubkey);
    }
  };

  const getFollowers = (userPubkey: PublicKey): Follow[] => {
    return follows.filter(follow => follow.following.equals(userPubkey));
  };

  const getFollowing = (userPubkey: PublicKey): Follow[] => {
    return follows.filter(follow => follow.follower.equals(userPubkey));
  };

  useEffect(() => {
    fetchFollows();
  }, [program, publicKey]);

  return {
    follows,
    loading,
    error,
    refetch: fetchFollows,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowerCount,
    getFollowingCount,
    isFollowingUser,
    getFollowers,
    getFollowing
  };
}