import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useProfile } from '../hooks/useProfile';
import { TweetFeed } from '../components/TweetFeed';
import { FollowButton } from '../components/FollowButton';
import { FollowStats } from '../components/FollowStats';
import { UserAvatar } from '../components/UserAvatar';
import { UserProfile } from '../types/profile';
import { ArrowLeft, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

export function ProfilePage() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchProfile } = useProfile();

  useEffect(() => {
    const loadProfile = async () => {
      if (!pubkey) return;

      try {
        setLoading(true);
        setError(null);
        
        const publicKey = new PublicKey(pubkey);
        const userProfile = await fetchProfile(publicKey);
        
        if (!userProfile) {
          setError('Profile not found');
        } else {
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Invalid profile address');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [pubkey, fetchProfile]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full animate-pulse mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-muted rounded animate-pulse w-2/3 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || 'This user hasn\'t created a profile yet.'}
          </p>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-4">
        <Link to="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <UserAvatar 
              publicKey={profile.authority}
              username={profile.username}
              size="xl"
              className="flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                <FollowButton userPubkey={profile.authority} />
              </div>
              
              <p className="text-muted-foreground text-sm font-mono mb-3">
                {truncateAddress(profile.authority.toString())}
              </p>
              
              {profile.bio && (
                <p className="text-foreground mb-4">{profile.bio}</p>
              )}
              
              <FollowStats userPubkey={profile.authority} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User's Tweets */}
      <TweetFeed 
        authorFilter={profile.authority}
        title={`${profile.username}'s Tweets`}
      />
    </div>
  );
}