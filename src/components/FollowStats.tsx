import { PublicKey } from '@solana/web3.js';
import { useFollows } from '../hooks/useFollows';
import { Users, UserCheck } from 'lucide-react';

interface Props {
  userPubkey: PublicKey;
  className?: string;
}

export function FollowStats({ userPubkey, className = '' }: Props) {
  const { getFollowerCount, getFollowingCount } = useFollows();

  const followerCount = getFollowerCount(userPubkey);
  const followingCount = getFollowingCount(userPubkey);

  return (
    <div className={`flex items-center gap-4 text-sm text-gray-400 ${className}`}>
      <div className="flex items-center gap-1">
        <UserCheck className="w-4 h-4" />
        <span className="font-medium text-white">{followingCount}</span>
        <span>Following</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4" />
        <span className="font-medium text-white">{followerCount}</span>
        <span>{followerCount === 1 ? 'Follower' : 'Followers'}</span>
      </div>
    </div>
  );
}