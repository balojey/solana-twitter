import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Commitment,
  PublicKey,
  Connection
} from '@solana/web3.js';

export function useSolanaProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    const { publicKey, signTransaction } = wallet;

    if (!publicKey || !signTransaction) return null;

    return {
      connection,
      wallet,
      async sendTransaction(
        instructions: TransactionInstruction[],
        commitment: Commitment = 'confirmed'
      ): Promise<string> {
        if (!publicKey || !signTransaction) {
          throw new Error('Wallet does not support signing');
        }

        const transaction = new Transaction().add(...instructions);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash(commitment);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signedTransaction = await signTransaction(transaction);

        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          { skipPreflight: false, preflightCommitment: commitment }
        );

        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          commitment
        );

        return signature;
      }
    };
  }, [connection, wallet]);

  return program;
}
