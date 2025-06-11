import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  return (
    <WalletMultiButton 
      style={{
        backgroundColor: '#512da8',
        borderRadius: '8px',
        fontSize: '14px',
        height: '40px',
      }}
    />
  );
}
