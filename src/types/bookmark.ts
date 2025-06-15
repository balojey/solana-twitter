import { PublicKey } from '@solana/web3.js';

export interface Bookmark {
  user: PublicKey;
  tweet: PublicKey;
  publicKey: PublicKey;
}