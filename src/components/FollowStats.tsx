import { PublicKey } from '@solana/web3.js';
import { useFollows } from '../hooks/useFollows';
import { Users, UserCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Props {
  userPubkey: PublicKey;
  className?: string;
}

export function FollowStats({ userPubkey, className = '' }: Props) {
  const { getFollowerCount, getFollowingCount } = useFollows();

  const followerCount = getFollowerCount(userPubkey);
  const followingCount = getFollowingCount(userPubkey);

  return (
    <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <UserCheck className="h-4 w-4" />
        <span className="font-medium text-foreground">{followingCount}</span>
        <span>Following</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4" />
        <span className="font-medium text-foreground">{followerCount}</span>
        <span>{followerCount === 1 ? 'Follower' : 'Followers'}</span>
      </div>
    </div>
  );
}