import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaProgram } from './useSolanaProgram';
import { Bookmark } from '../types/bookmark';
import {
  deriveBookmarkPDA,
  bookmarkTweetInstruction,
  unbookmarkTweetInstruction,
  decodeBookmark,
  isBookmarkAccount,
  getAllProgramAccounts
} from '../utils/solana';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const program = useSolanaProgram();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const fetchBookmarksForUser = useCallback(async (userPubkey?: PublicKey) => {
    if (!program) return [];

    const targetUser = userPubkey || publicKey;
    if (!targetUser) return [];

    try {
      const bookmarkAccounts = await getAllProgramAccounts(connection, 'bookmark');
      
      const userBookmarksData: (Bookmark & { publicKey: PublicKey })[] = bookmarkAccounts
        .filter(account => {
          const bookmarkData = decodeBookmark(account.account);
          return bookmarkData.user.equals(targetUser);
        })
        .map((account) => {
          const bookmarkData = decodeBookmark(account.account);
          return {
            ...bookmarkData,
            publicKey: account.pubkey,
          };
        });

      return userBookmarksData;
    } catch (err) {
      console.error('Error fetching user bookmarks:', err);
      return [];
    }
  }, [program, connection, publicKey]);

  const fetchBookmarksState = useCallback(async () => {
    if (!program || !publicKey) return;

    try {
      setLoading(true);
      setError(null);

      const bookmarkAccounts = await getAllProgramAccounts(connection, 'bookmark');
      
      const bookmarksData: (Bookmark & { publicKey: PublicKey })[] = bookmarkAccounts.map((account) => {
        const bookmarkData = decodeBookmark(account.account);
        return {
          ...bookmarkData,
          publicKey: account.pubkey,
        };
      });

      setBookmarks(bookmarksData);

      // Track current user's bookmarks
      const currentUserBookmarks = new Set<string>();
      bookmarksData.forEach(bookmark => {
        if (bookmark.user.equals(publicKey)) {
          currentUserBookmarks.add(bookmark.tweet.toString());
        }
      });
      setUserBookmarks(currentUserBookmarks);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  }, [program, connection, publicKey]);

  const bookmarkTweet = async (tweetPubkey: PublicKey): Promise<string> => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const [bookmarkPDA] = await deriveBookmarkPDA(publicKey, tweetPubkey);

    const instruction = bookmarkTweetInstruction(
      bookmarkPDA,
      publicKey,
      tweetPubkey
    );

    const signature = await program.sendTransaction([instruction]);
    
    // Optimistically update local state
    const tweetKey = tweetPubkey.toString();
    setUserBookmarks(prev => new Set(prev).add(tweetKey));
    
    // Refresh bookmarks after transaction
    setTimeout(() => fetchBookmarksState(), 1000);
    
    return signature;
  };

  const unbookmarkTweet = async (tweetPubkey: PublicKey): Promise<string> => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const [bookmarkPDA] = await deriveBookmarkPDA(publicKey, tweetPubkey);

    const instruction = unbookmarkTweetInstruction(
      bookmarkPDA,
      publicKey,
      tweetPubkey
    );

    const signature = await program.sendTransaction([instruction]);
    
    // Optimistically update local state
    const tweetKey = tweetPubkey.toString();
    setUserBookmarks(prev => {
      const newSet = new Set(prev);
      newSet.delete(tweetKey);
      return newSet;
    });
    
    // Refresh bookmarks after transaction
    setTimeout(() => fetchBookmarksState(), 1000);
    
    return signature;
  };

  const isBookmarkedByUser = (tweetPubkey: PublicKey): boolean => {
    const tweetKey = tweetPubkey.toString();
    return userBookmarks.has(tweetKey);
  };

  const toggleBookmark = useCallback(async (tweetPubkey: PublicKey): Promise<string> => {
    if (isBookmarkedByUser(tweetPubkey)) {
      return await unbookmarkTweet(tweetPubkey);
    } else {
      return await bookmarkTweet(tweetPubkey);
    }
  }, [isBookmarkedByUser, bookmarkTweet, unbookmarkTweet]);

  useEffect(() => {
    fetchBookmarksState();
  }, [fetchBookmarksState]);

  return {
    bookmarks,
    loading,
    error,
    refetch: fetchBookmarksState,
    fetchBookmarksForUser,
    bookmarkTweet,
    unbookmarkTweet,
    toggleBookmark,
    isBookmarkedByUser
  };
}