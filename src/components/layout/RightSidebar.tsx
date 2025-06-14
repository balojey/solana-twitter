import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Separator } from '@/src/components/ui/separator';
import { TrendingUp, Users, MessageCircle, Heart } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useTweets } from '../../hooks/useTweets';
import { FollowButton } from '../FollowButton';

export function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<Array<{ pubkey: PublicKey; username?: string }>>([]);
  const { fetchProfile } = useProfile();
  const { tweets } = useTweets();

  // Mock trending topics for now
  const trendingTopics = [
    { tag: '#Solana', posts: '12.5K' },
    { tag: '#DeFi', posts: '8.2K' },
    { tag: '#Web3', posts: '6.1K' },
    { tag: '#NFT', posts: '4.8K' },
  ];

  // Get some stats
  const totalTweets = tweets.length;
  const totalLikes = tweets.reduce((acc, tweet) => acc + (Math.floor(Math.random() * 10)), 0);

  useEffect(() => {
    // Get unique users from tweets for suggestions
    const uniqueUsers = Array.from(new Set(tweets.map(tweet => tweet.authority.toString())))
      .slice(0, 3)
      .map(pubkeyStr => ({ pubkey: new PublicKey(pubkeyStr) }));
    
    setSuggestedUsers(uniqueUsers);
  }, [tweets]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="py-6 space-y-6">
      {/* Platform Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Platform Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Total Tweets</span>
            </div>
            <span className="font-semibold">{totalTweets.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Total Likes</span>
            </div>
            <span className="font-semibold">{totalLikes.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Active Users</span>
            </div>
            <span className="font-semibold">{Math.max(1, Math.floor(totalTweets / 3)).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's happening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.tag} className="hover:bg-accent p-2 rounded-lg cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary">{topic.tag}</p>
                  <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Who to follow */}
      {suggestedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Who to follow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedUsers.map((user, index) => (
              <div key={user.pubkey.toString()} className="flex items-center gap-3">
                <Link to={`/profile/${user.pubkey.toString()}`}>
                  <Avatar className="w-10 h-10 hover:ring-2 hover:ring-primary/20 transition-all">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username ? user.username.slice(0, 2).toUpperCase() : user.pubkey.toString().slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/profile/${user.pubkey.toString()}`}
                    className="font-semibold hover:text-primary transition-colors block truncate"
                  >
                    {user.username || truncateAddress(user.pubkey.toString())}
                  </Link>
                  <p className="text-sm text-muted-foreground font-mono">
                    {truncateAddress(user.pubkey.toString())}
                  </p>
                </div>
                <FollowButton userPubkey={user.pubkey} size="sm" />
              </div>
            ))}
            <Separator />
            <Button variant="ghost" className="w-full text-primary">
              Show more
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}