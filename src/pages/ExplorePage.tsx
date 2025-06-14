import { Search, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { TweetFeed } from '../components/TweetFeed';
import { EmptyState } from '../components/EmptyState';

export function ExplorePage() {
  return (
    <div className="space-y-6 p-6">
      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tweets, users, or topics..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<TrendingUp className="w-full h-full" />}
            title="No trending topics yet"
            description="As the community grows, trending topics and hashtags will appear here."
          />
        </CardContent>
      </Card>

      {/* All Tweets */}
      <div>
        <h2 className="text-xl font-bold mb-4">Latest from everyone</h2>
        <TweetFeed parentTweet={null} expandReplies={false} />
      </div>
    </div>
  );
}