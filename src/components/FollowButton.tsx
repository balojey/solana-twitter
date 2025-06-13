import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFollows } from '../hooks/useFollows';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface Props {
  userPubkey: PublicKey;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FollowButton({ userPubkey, className = '', size = 'md' }: Props) {
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

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`
        flex items-center gap-2 font-medium rounded-lg transition-colors
        disabled:cursor-not-allowed disabled:opacity-50
        ${isFollowing
          ? 'bg-gray-600 hover:bg-red-600 text-white'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
        }
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className={`${iconSize[size]} animate-spin`} />
      ) : isFollowing ? (
        <UserMinus className={iconSize[size]} />
      ) : (
        <UserPlus className={iconSize[size]} />
      )}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}