import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaProgram } from './useSolanaProgram';
import { UserProfile } from '../types/profile';
import {
  deriveProfilePDA,
  createOrUpdateProfileInstruction,
  decodeUserProfile,
  isUserProfileAccount
} from '../utils/solana';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const program = useSolanaProgram();

  const fetchProfile = useCallback(async (authority?: PublicKey) => {
    const targetAuthority = authority || publicKey;
    if (!program || !targetAuthority) return null;

    try {
      const [profilePDA] = await deriveProfilePDA(targetAuthority);
      const accountInfo = await program.connection.getAccountInfo(profilePDA);
      
      if (!accountInfo || !isUserProfileAccount(accountInfo)) {
        return null;
      }

      const profileData = decodeUserProfile(accountInfo);
      
      return {
        ...profileData,
        publicKey: profilePDA,
      } as UserProfile;
    } catch (err) {
      console.log('Profile not found for:', targetAuthority.toBase58());
      return null;
    }
  }, [program, publicKey]);

  const createProfile = async (username: string, bio: string) => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const [profilePDA] = await deriveProfilePDA(publicKey);
      
      const instruction = createOrUpdateProfileInstruction(
        profilePDA,
        publicKey,
        username,
        bio
      );

      await program.sendTransaction([instruction]);

      // Fetch the updated profile
      const updatedProfile = await fetchProfile();
      setProfile(updatedProfile);
      
      return updatedProfile;
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (username: string, bio: string) => {
    return createProfile(username, bio); // Same method handles both create and update
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!publicKey || !program) {
        setProfile(null);
        return;
      }

      setLoading(true);
      try {
        const userProfile = await fetchProfile();
        setProfile(userProfile);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [publicKey, program, fetchProfile]);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    fetchProfile,
    hasProfile: !!profile,
  };
}