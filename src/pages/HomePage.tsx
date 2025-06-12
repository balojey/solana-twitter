import { TweetForm } from '../components/TweetForm';
import { TweetFeed } from '../components/TweetFeed';
import { useTweets } from '../hooks/useTweets';

export function HomePage() {
  const { refetch } = useTweets(null); // Only top-level tweets

  return (
    <div className="space-y-8">
      {/* Tweet Form */}
      <TweetForm onTweetPosted={refetch} />

      {/* Tweet Feed - only top-level tweets with expandable replies */}
      <TweetFeed 
        parentTweet={null} 
        expandReplies={false} // Don't auto-expand replies on home page
      />
    </div>
  );
}