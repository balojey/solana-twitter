import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Separator } from '@/src/components/ui/separator';
import { TrendingUp, Users, MessageCircle, Heart, Sparkles } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useTweets } from '../../hooks/useTweets';
import { FollowButton } from '../FollowButton';

export function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<Array<{ pubkey: PublicKey; username?: string }>>([]);
  const { fetchProfile } = useProfile();
  const { tweets } = useTweets();

  // Mock trending topics for now
  const trendingTopics = [
    { tag: '#Solana', posts: '12.5K', growth: '+15%' },
    { tag: '#DeFi', posts: '8.2K', growth: '+8%' },
    { tag: '#Web3', posts: '6.1K', growth: '+12%' },
    { tag: '#NFT', posts: '4.8K', growth: '+5%' },
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
    <div className="py-8 space-y-8">
      {/* Platform Stats */}
      <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            Platform Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between group hover:bg-accent/30 p-3 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-blue-500" />
              </div>
              <span className="font-medium">Total Tweets</span>
            </div>
            <span className="font-bold text-lg">{totalTweets.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between group hover:bg-accent/30 p-3 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <span className="font-medium">Total Likes</span>
            </div>
            <span className="font-bold text-lg">{totalLikes.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between group hover:bg-accent/30 p-3 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <span className="font-medium">Active Users</span>
            </div>
            <span className="font-bold text-lg">{Math.max(1, Math.floor(totalTweets / 3)).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            What's happening
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <div key={topic.tag} className="hover:bg-accent/50 p-4 rounded-xl cursor-pointer transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-lg text-primary group-hover:text-primary/80 transition-colors duration-300">
                    {topic.tag}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground font-medium">{topic.posts} posts</p>
                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold">
                      {topic.growth}
                    </span>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Who to follow */}
      {suggestedUsers.length > 0 && (
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              Who to follow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {suggestedUsers.map((user, index) => (
              <div key={user.pubkey.toString()} className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/30 transition-all duration-300 group">
                <Link to={`/profile/${user.pubkey.toString()}`}>
                  <Avatar className="w-12 h-12 hover:ring-4 hover:ring-primary/20 transition-all duration-300 hover:scale-105">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                      {user.username ? user.username.slice(0, 2).toUpperCase() : user.pubkey.toString().slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/profile/${user.pubkey.toString()}`}
                    className="font-bold text-lg hover:text-primary transition-colors duration-300 block truncate"
                  >
                    {user.username || truncateAddress(user.pubkey.toString())}
                  </Link>
                  <p className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-lg inline-block">
                    {truncateAddress(user.pubkey.toString())}
                  </p>
                </div>
                <FollowButton userPubkey={user.pubkey} size="sm" />
              </div>
            ))}
            <Separator className="bg-border/30" />
            <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]">
              Show more
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}