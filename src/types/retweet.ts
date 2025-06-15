import { PublicKey } from '@solana/web3.js';

export interface Retweet {
  user: PublicKey;
  originalTweet: PublicKey;
  timestamp: number;
  publicKey: PublicKey;
}