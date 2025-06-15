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
import { User, Calendar, MapPin, Link as LinkIcon, Sparkles } from 'lucide-react';
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
      <div className="p-6 sm:p-8">
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
          <CardContent className="p-16 text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">Loading profile...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the profile data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-dashed border-2 border-muted/50">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-3xl flex items-center justify-center">
              <User className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Profile Not Found</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              {error || "This user hasn't created a profile yet."}
            </p>
            <Button 
              onClick={() => window.history.back()}
              className="rounded-2xl px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute top-6 right-6">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        
        {/* Profile Info */}
        <Card className="relative -mt-20 mx-6 sm:mx-8 border-2 border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <UserAvatar 
                publicKey={profile.authority}
                username={profile.username}
                size="xl"
                className="w-32 h-32 border-4 border-background -mt-16 sm:-mt-20 shadow-2xl ring-4 ring-primary/20"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {profile.username}
                    </h1>
                    <p className="text-muted-foreground text-sm font-mono bg-muted/50 px-3 py-2 rounded-xl inline-block mt-2">
                      {truncateAddress(profile.authority.toString())}
                    </p>
                  </div>
                  <FollowButton userPubkey={profile.authority} size="lg" />
                </div>
                
                {profile.bio && (
                  <div className="mt-6 p-4 bg-accent/30 rounded-2xl">
                    <p className="text-foreground text-lg leading-relaxed">{profile.bio}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-8 mt-6 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="font-medium">Joined recently</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="font-medium">Solana Network</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <FollowStats userPubkey={profile.authority} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Tabs */}
      <div className="px-6 sm:px-8">
        <Tabs defaultValue="tweets" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2">
            <TabsTrigger value="tweets" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
              Tweets
            </TabsTrigger>
            <TabsTrigger value="replies" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
              Replies
            </TabsTrigger>
            <TabsTrigger value="likes" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
              Likes
            </TabsTrigger>
            <TabsTrigger value="media" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
              Media
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tweets" className="mt-8">
            <TweetFeed 
              authorFilter={profile.authority}
              title=""
            />
          </TabsContent>
          
          <TabsContent value="replies" className="mt-8">
            <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-dashed border-2 border-muted/50">
              <CardContent className="p-16 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">No replies yet</h3>
                <p className="text-muted-foreground">Replies will appear here when this user responds to tweets.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="likes" className="mt-8">
            <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-dashed border-2 border-muted/50">
              <CardContent className="p-16 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">No likes yet</h3>
                <p className="text-muted-foreground">Tweets this user has liked will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media" className="mt-8">
            <Card className="bg-gradient-to-br from-muted/20 to-muted/5 border-dashed border-2 border-muted/50">
              <CardContent className="p-16 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">No media yet</h3>
                <p className="text-muted-foreground">Photos and videos shared by this user will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}