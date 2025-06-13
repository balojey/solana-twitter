import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFollows } from '../hooks/useFollows';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface Props {
  userPubkey: PublicKey;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function FollowButton({ userPubkey, className = '', size = 'default' }: Props) {
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const { isFollowingUser, toggleFollow } = useFollows();

  const isFollowing = isFollowingUser(userPubkey);
  const isOwnProfile = publicKey && publicKey.equals(userPubkey);

  const handleFollow = async () => {
    if (!publicKey || loading || isOwnProfile) return;

    try {
      setLoading(true);
      await toggleFollow(userPubkey);
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey || isOwnProfile) {
    return null;
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size={size}
      className={className}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="mr-2 h-4 w-4" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}