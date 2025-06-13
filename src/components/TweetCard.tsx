import { useState, useEffect } from 'react';
import { Tweet } from '../types/tweet';
import { UserProfile } from '../types/profile';
import { useProfile } from '../hooks/useProfile';
import { useTweets } from '../hooks/useTweets';
import { formatDistanceToNow } from '../utils/dateUtils';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { TweetForm } from './TweetForm';
import { LikeButton } from './LikeButton';
import { UserAvatar } from './UserAvatar';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { cn } from '@/src/lib/utils';

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
    if (showRepliesExpanded) {
      loadReplies();
    }
  };

  const toggleReplies = () => {
    setShowRepliesExpanded(!showRepliesExpanded);
  };

  const displayName = authorProfile?.username || truncateAddress(tweet.authority.toString());

  return (
    <Card className={cn(
      "transition-colors hover:bg-accent/50",
      isReply && "ml-8 mt-2 border-l-4 border-l-primary"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Link 
            to={`/profile/${tweet.authority.toString()}`}
            className="flex-shrink-0"
          >
            <UserAvatar 
              publicKey={tweet.authority}
              username={authorProfile?.username}
              className="hover:ring-2 hover:ring-primary/20 transition-all"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Link 
                to={`/profile/${tweet.authority.toString()}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {displayName}
              </Link>
              {!authorProfile && (
                <span className="text-muted-foreground text-sm font-mono">
                  {truncateAddress(tweet.authority.toString())}
                </span>
              )}
              <span className="text-muted-foreground">·</span>
              <Link 
                to={`/tweet/${tweet.publicKey.toString()}`}
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                {formatDistanceToNow(tweet.timestamp)}
              </Link>
            </div>
            
            <p className="text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
              {tweet.content}
            </p>

            {showReplies && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-auto p-1 gap-1 text-muted-foreground hover:text-primary"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">Reply</span>
                </Button>

                <LikeButton tweetPubkey={tweet.publicKey} />

                {showReplyCount && replyCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleReplies}
                    className="h-auto p-1 gap-1 text-muted-foreground hover:text-blue-400"
                  >
                    {showRepliesExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  </Button>
                )}

                {replyCount > 0 && (
                  <Link
                    to={`/tweet/${tweet.publicKey.toString()}`}
                    className="text-muted-foreground hover:text-blue-400 transition-colors text-sm px-1"
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
      </CardContent>

      {/* Expanded Replies */}
      {showRepliesExpanded && replyCount > 0 && (
        <>
          <Separator />
          <div className="p-4 pt-0">
            {loadingReplies ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground text-sm mt-2">Loading replies...</p>
              </div>
            ) : (
              <div className="space-y-4">
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
        </>
      )}
    </Card>
  );
}