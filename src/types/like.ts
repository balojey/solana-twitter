import { PublicKey } from '@solana/web3.js';

export interface Like {
  user: PublicKey;
  tweet: PublicKey;
  publicKey: PublicKey;
}