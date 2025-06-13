import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/src/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet } from 'lucide-react';

export function WalletButton() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="wallet-adapter-button-trigger">
      <WalletMultiButton 
        style={{
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: 'calc(var(--radius) - 2px)',
          fontSize: '14px',
          height: '40px',
          fontWeight: '500',
          border: 'none',
          transition: 'all 0.2s',
        }}
      />
    </div>
  );
}