import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: React.ReactNode;
}

export function AppWalletProvider({ children }: Props) {
  const network = WalletAdapterNetwork.Devnet;
  
  // Use a more robust RPC endpoint to avoid rate limiting
  const endpoint = useMemo(() => {
    // You can replace this with your own RPC endpoint from services like:
    // - Helius: https://rpc.helius.xyz/?api-key=YOUR_API_KEY
    // - QuickNode: https://your-endpoint.solana-devnet.quiknode.pro/YOUR_API_KEY/
    // - Alchemy: https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY
    
    // For now, we'll use the default but with better error handling
    // In production, replace this with a dedicated RPC endpoint
    return process.env.VITE_SOLANA_RPC_URL || clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}