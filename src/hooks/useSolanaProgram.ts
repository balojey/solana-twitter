import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  sendAndConfirmTransaction,
  Commitment
} from '@solana/web3.js';

export function useSolanaProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;

    return {
      connection,
      wallet,
      async sendTransaction(
        instructions: TransactionInstruction[],
        commitment: Commitment = 'confirmed'
      ): Promise<string> {
        if (!wallet.publicKey || !wallet.signTransaction) {
          throw new Error('Wallet not connected');
        }

        const transaction = new Transaction();
        instructions.forEach(ix => transaction.add(ix));
        
        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash(commitment);
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        // Sign transaction
        const signedTransaction = await wallet.signTransaction(transaction);
        
        // Send transaction
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          { skipPreflight: false, preflightCommitment: commitment }
        );

        // Confirm transaction
        await connection.confirmTransaction(signature, commitment);
        
        return signature;
      }
    };
  }, [connection, wallet]);

  return program;
}