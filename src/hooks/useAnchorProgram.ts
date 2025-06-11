import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { IDL, Twitter } from '../idl/twitter';

const PROGRAM_ID = new PublicKey('5S7sfpY15KPmL5SfQ3PM81mzeoig8uXWtdwEL2sLq67X');

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !wallet.signAllTransactions
    ) return null;

    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      { commitment: 'confirmed' }
    );

    return new Program<Twitter>(IDL, PROGRAM_ID, provider);
  }, [connection, wallet]);

  return program;
}
