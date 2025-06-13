import { PublicKey } from '@solana/web3.js';

export interface Follow {
  follower: PublicKey;
  following: PublicKey;
  publicKey: PublicKey;
}