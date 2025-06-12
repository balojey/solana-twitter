import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useAnchorProgram } from './useAnchorProgram';
import { UserProfile } from '../types/profile';
import { BN } from '@coral-xyz/anchor';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const program = useAnchorProgram();

  const getProfilePDA = async (authority: PublicKey) => {
    if (!program) return null;
    
    const [profilePDA] = await PublicKey.findProgramAddress(
      [Buffer.from("profile"), authority.toBuffer()],
      program.programId
    );
    return profilePDA;
  };

  const fetchProfile = async (authority?: PublicKey) => {
    const targetAuthority = authority || publicKey;
    if (!program || !targetAuthority) return null;

    try {
      const profilePDA = await getProfilePDA(targetAuthority);
      if (!profilePDA) return null;

      const profileAccount = await program.account.userProfile.fetch(profilePDA);
      
      return {
        authority: profileAccount.authority,
        username: profileAccount.username,
        bio: profileAccount.bio,
        createdAt: profileAccount.createdAt.toNumber(),
        publicKey: profilePDA,
      } as UserProfile;
    } catch (err) {
      console.log('Profile not found for:', targetAuthority.toBase58());
      return null;
    }
  };

  const createProfile = async (username: string, bio: string) => {
    if (!program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const profilePDA = await getProfilePDA(publicKey);
      if (!profilePDA) throw new Error('Failed to derive profile PDA');

      await program.methods
        .createOrUpdateProfile(username, bio)
        .accounts({
          profile: profilePDA,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

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
  }, [publicKey, program]);

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