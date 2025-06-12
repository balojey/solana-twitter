import { useState, useEffect } from 'react';
import { Tweet } from '../types/tweet';
import { UserProfile } from '../types/profile';
import { useProfile } from '../hooks/useProfile';
import { formatDistanceToNow } from '../utils/dateUtils';
import { MessageCircle, User } from 'lucide-react';
import { TweetForm } from './TweetForm';
import { Link } from 'react-router-dom';

interface Props {
  tweet: Tweet;
  onReplyPosted?: () => void;
  showReplies?: boolean;
  isReply?: boolean;
}

export function TweetCard({ tweet, onReplyPosted, showReplies = true, isReply = false }: Props) {
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { fetchProfile } = useProfile();

  useEffect(() => {
    const loadAuthorProfile = async () => {
      try {
        const profile = await fetchProfile(tweet.authority);
        setAuthorProfile(profile);
      } catch (err) {
        console.error('Error loading author profile:', err);
      }
    };

    loadAuthorProfile();
  }, [tweet.authority, fetchProfile]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleReplyPosted = () => {
    setShowReplyForm(false);
    if (onReplyPosted) onReplyPosted();
  };

  const displayName = authorProfile?.username || truncateAddress(tweet.authority.toString());
  const avatarText = authorProfile?.username 
    ? authorProfile.username.slice(0, 2).toUpperCase()
    : tweet.authority.toString().slice(0, 2).toUpperCase();

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${isReply ? 'ml-8 mt-2' : ''}`}>
      <div className="flex items-start gap-3">
        <Link 
          to={`/profile/${tweet.authority.toString()}`}
          className="flex-shrink-0"
        >
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
            <span className="text-white text-sm font-medium">
              {avatarText}
            </span>
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={`/profile/${tweet.authority.toString()}`}
              className="font-medium text-white hover:text-purple-400 transition-colors"
            >
              {displayName}
            </Link>
            {!authorProfile && (
              <span className="text-gray-500 text-sm font-mono">
                {truncateAddress(tweet.authority.toString())}
              </span>
            )}
            <span className="text-gray-500 text-sm">·</span>
            <Link 
              to={`/tweet/${tweet.publicKey.toString()}`}
              className="text-gray-500 text-sm hover:text-gray-400 transition-colors"
            >
              {formatDistanceToNow(tweet.timestamp)}
            </Link>
          </div>
          
          <p className="text-white leading-relaxed mb-3">{tweet.content}</p>

          {showReplies && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-4">
          <TweetForm
            parentTweet={tweet.publicKey}
            onTweetPosted={handleReplyPosted}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Tweet your reply..."
          />
        </div>
      )}
    </div>
  );
}