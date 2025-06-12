import { useState, useEffect } from 'react';
import { Tweet } from '../types/tweet';
import { UserProfile } from '../types/profile';
import { useProfile } from '../hooks/useProfile';
import { useTweets } from '../hooks/useTweets';
import { formatDistanceToNow } from '../utils/dateUtils';
import { MessageCircle, User, ChevronDown, ChevronUp } from 'lucide-react';
import { TweetForm } from './TweetForm';
import { Link } from 'react-router-dom';

interface Props {
  tweet: Tweet;
  onReplyPosted?: () => void;
  showReplies?: boolean;
  isReply?: boolean;
  showReplyCount?: boolean;
  expandReplies?: boolean;
}

export function TweetCard({ 
  tweet, 
  onReplyPosted, 
  showReplies = true, 
  isReply = false,
  showReplyCount = true,
  expandReplies = false
}: Props) {
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showRepliesExpanded, setShowRepliesExpanded] = useState(expandReplies);
  const [replies, setReplies] = useState<Tweet[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { fetchProfile } = useProfile();
  const { getReplyCount, fetchRepliesForTweet } = useTweets();

  const replyCount = getReplyCount(tweet.publicKey);

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

  useEffect(() => {
    if (showRepliesExpanded && replyCount > 0) {
      loadReplies();
    }
  }, [showRepliesExpanded, replyCount]);

  const loadReplies = async () => {
    if (loadingReplies) return;
    
    setLoadingReplies(true);
    try {
      const tweetReplies = await fetchRepliesForTweet(tweet.publicKey);
      setReplies(tweetReplies);
    } catch (err) {
      console.error('Error loading replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleReplyPosted = () => {
    setShowReplyForm(false);
    if (onReplyPosted) onReplyPosted();
    // Reload replies if they're currently shown
    if (showRepliesExpanded) {
      loadReplies();
    }
  };

  const toggleReplies = () => {
    setShowRepliesExpanded(!showRepliesExpanded);
  };

  const displayName = authorProfile?.username || truncateAddress(tweet.authority.toString());
  const avatarText = authorProfile?.username 
    ? authorProfile.username.slice(0, 2).toUpperCase()
    : tweet.authority.toString().slice(0, 2).toUpperCase();

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${isReply ? 'ml-8 mt-2 border-l-4 border-l-purple-500' : ''}`}>
      <div className="p-4">
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

                {showReplyCount && replyCount > 0 && (
                  <button
                    onClick={toggleReplies}
                    className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {showRepliesExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  </button>
                )}

                {replyCount > 0 && (
                  <Link
                    to={`/tweet/${tweet.publicKey.toString()}`}
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    View thread
                  </Link>
                )}
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

      {/* Expanded Replies */}
      {showRepliesExpanded && replyCount > 0 && (
        <div className="border-t border-gray-700">
          {loadingReplies ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 text-sm mt-2">Loading replies...</p>
            </div>
          ) : (
            <div className="space-y-0">
              {replies.map((reply) => (
                <TweetCard
                  key={reply.publicKey.toString()}
                  tweet={reply}
                  onReplyPosted={handleReplyPosted}
                  showReplies={true}
                  isReply={true}
                  showReplyCount={true}
                  expandReplies={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}