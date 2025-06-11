import { Tweet } from '../types/tweet';
import { formatDistanceToNow } from '../utils/dateUtils';

interface Props {
  tweet: Tweet;
}

export function TweetCard({ tweet }: Props) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {tweet.authority.toString().slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-gray-400 text-sm font-mono">
            {truncateAddress(tweet.authority.toString())}
          </span>
        </div>
        <span className="text-gray-500 text-sm">
          {formatDistanceToNow(tweet.timestamp)}
        </span>
      </div>
      
      <p className="text-white leading-relaxed">{tweet.content}</p>
    </div>
  );
}
