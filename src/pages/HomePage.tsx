import { TweetForm } from '../components/TweetForm';
import { TweetFeed } from '../components/TweetFeed';
import { useTweets } from '../hooks/useTweets';

export function HomePage() {
  const { refetch } = useTweets(null);

  return (
    <div className="space-y-6">
      <TweetForm onTweetPosted={refetch} />
      <TweetFeed 
        parentTweet={null} 
        expandReplies={false}
      />
    </div>
  );
}