import { PublicKey } from '@solana/web3.js';

export interface Tweet {
  authority: PublicKey;
  content: string;
  timestamp: number;
  publicKey: PublicKey;
}
