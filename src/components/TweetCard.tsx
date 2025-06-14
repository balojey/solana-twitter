import { useState, useEffect } from 'react';
import { Tweet } from '../types/tweet';
import { UserProfile } from '../types/profile';
import { useProfile } from '../hooks/useProfile';
import { useTweets } from '../hooks/useTweets';
import { formatDistanceToNow } from '../utils/dateUtils';
import { MessageCircle, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { ComposeDialog } from './ComposeDialog';
import { LikeButton } from './LikeButton';
import { UserAvatar } from './UserAvatar';
import { LoadingSpinner } from './LoadingSpinner';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
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
      "transition-all duration-200 hover:shadow-md hover:bg-accent/30",
      isReply && "ml-8 mt-2 border-l-4 border-l-primary/50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Link 
            to={`/profile/${tweet.authority.toString()}`}
            className="flex-shrink-0"
          >
            <UserAvatar 
              publicKey={tweet.authority}
              username={authorProfile?.username}
              className="hover:ring-2 hover:ring-primary/20 transition-all duration-200"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
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
              
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Copy link</DropdownMenuItem>
                    <DropdownMenuItem>Share tweet</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Link 
              to={`/tweet/${tweet.publicKey.toString()}`}
              className="block"
            >
              <p className="text-foreground leading-relaxed mb-4 whitespace-pre-wrap hover:text-foreground/80 transition-colors">
                {tweet.content}
              </p>
            </Link>

            {showReplies && (
              <div className="flex items-center gap-1 pt-2">
                <ComposeDialog 
                  parentTweet={tweet.publicKey}
                  onTweetPosted={handleReplyPosted}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-2 gap-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Reply</span>
                  </Button>
                </ComposeDialog>

                <LikeButton tweetPubkey={tweet.publicKey} />

                {showReplyCount && replyCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleReplies}
                    className="h-auto p-2 gap-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-all"
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
                    className="text-muted-foreground hover:text-blue-500 transition-colors text-sm px-2 py-1 rounded-full hover:bg-blue-500/10"
                  >
                    View thread
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Expanded Replies */}
      {showRepliesExpanded && replyCount > 0 && (
        <>
          <Separator />
          <div className="p-6 pt-0">
            {loadingReplies ? (
              <div className="text-center py-8">
                <LoadingSpinner className="mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Loading replies...</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
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