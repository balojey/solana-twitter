import { PublicKey } from '@solana/web3.js';

export interface UserProfile {
  authority: PublicKey;
  username: string;
  bio: string;
  publicKey: PublicKey;
}