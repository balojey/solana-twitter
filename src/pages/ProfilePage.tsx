import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useProfile } from '../hooks/useProfile';
import { TweetFeed } from '../components/TweetFeed';
import { FollowButton } from '../components/FollowButton';
import { FollowStats } from '../components/FollowStats';
import { UserAvatar } from '../components/UserAvatar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { UserProfile } from '../types/profile';
import { User, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';

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
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<User className="w-full h-full" />}
          title="Profile Not Found"
          description={error || "This user hasn't created a profile yet."}
          action={{
            label: "Back to Home",
            onClick: () => window.history.back()
          }}
        />
      </div>
    );
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-t-xl" />
        
        {/* Profile Info */}
        <Card className="relative -mt-16 mx-6 border-2">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <UserAvatar 
                publicKey={profile.authority}
                username={profile.username}
                size="xl"
                className="w-24 h-24 border-4 border-background -mt-12 sm:-mt-16"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.username}</h1>
                    <p className="text-muted-foreground text-sm font-mono">
                      {truncateAddress(profile.authority.toString())}
                    </p>
                  </div>
                  <FollowButton userPubkey={profile.authority} size="lg" />
                </div>
                
                {profile.bio && (
                  <p className="text-foreground mt-4 text-lg leading-relaxed">{profile.bio}</p>
                )}
                
                <div className="flex items-center gap-6 mt-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined recently</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Solana Network</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <FollowStats userPubkey={profile.authority} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Tabs */}
      <div className="px-6">
        <Tabs defaultValue="tweets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tweets">Tweets</TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
            <TabsTrigger value="likes">Likes</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tweets" className="mt-6">
            <TweetFeed 
              authorFilter={profile.authority}
              title=""
            />
          </TabsContent>
          
          <TabsContent value="replies" className="mt-6">
            <EmptyState
              icon={<User className="w-full h-full" />}
              title="No replies yet"
              description="Replies will appear here when this user responds to tweets."
            />
          </TabsContent>
          
          <TabsContent value="likes" className="mt-6">
            <EmptyState
              icon={<User className="w-full h-full" />}
              title="No likes yet"
              description="Tweets this user has liked will appear here."
            />
          </TabsContent>
          
          <TabsContent value="media" className="mt-6">
            <EmptyState
              icon={<User className="w-full h-full" />}
              title="No media yet"
              description="Photos and videos shared by this user will appear here."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}