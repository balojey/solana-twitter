import { useState, useEffect } from 'react';
import { Tweet } from '../types/tweet';
import { UserProfile } from '../types/profile';
import { useProfile } from '../hooks/useProfile';
import { useTweets } from '../hooks/useTweets';
import { useRetweets } from '../hooks/useRetweets';
import { formatDistanceToNow } from '../utils/dateUtils';
import { MessageCircle, ChevronDown, ChevronUp, MoreHorizontal, Repeat } from 'lucide-react';
import { ComposeDialog } from './ComposeDialog';
import { LikeButton } from './LikeButton';
import { RetweetButton } from './RetweetButton';
import { BookmarkButton } from './BookmarkButton';
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
  retweetedBy?: { username?: string; publicKey: string } | null;
}

export function TweetCard({ 
  tweet, 
  onReplyPosted, 
  showReplies = true, 
  isReply = false,
  showReplyCount = true,
  expandReplies = false,
  retweetedBy = null
}: Props) {
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);
  const [showRepliesExpanded, setShowRepliesExpanded] = useState(expandReplies);
  const [replies, setReplies] = useState<Tweet[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { fetchProfile } = useProfile();
  const { getReplyCount, fetchRepliesForTweet } = useTweets();
  const { getRetweetedBy } = useRetweets();

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
      "transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:bg-card/80 backdrop-blur-sm border-border/50 group",
      isReply && "ml-12 mt-3 border-l-4 border-l-primary/30 rounded-l-none"
    )}>
      <CardContent className="p-8">
        {/* Retweet indicator */}
        {retweetedBy && (
          <div className="flex items-center gap-3 mb-4 text-muted-foreground text-sm">
            <Repeat className="w-4 h-4 text-green-500" />
            <span>
              Retweeted by{' '}
              <Link 
                to={`/profile/${retweetedBy.publicKey}`}
                className="font-medium hover:text-foreground transition-colors duration-300"
              >
                @{retweetedBy.username || truncateAddress(retweetedBy.publicKey)}
              </Link>
            </span>
          </div>
        )}

        <div className="flex items-start gap-5">
          <Link 
            to={`/profile/${tweet.authority.toString()}`}
            className="flex-shrink-0"
          >
            <UserAvatar 
              publicKey={tweet.authority}
              username={authorProfile?.username}
              className="hover:ring-4 hover:ring-primary/20 transition-all duration-300 hover:scale-105"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <Link 
                to={`/profile/${tweet.authority.toString()}`}
                className="font-bold text-lg text-foreground hover:text-primary transition-colors duration-300"
              >
                {displayName}
              </Link>
              {!authorProfile && (
                <span className="text-muted-foreground text-sm font-mono bg-muted/50 px-2 py-1 rounded-lg">
                  {truncateAddress(tweet.authority.toString())}
                </span>
              )}
              <span className="text-muted-foreground">·</span>
              <Link 
                to={`/tweet/${tweet.publicKey.toString()}`}
                className="text-muted-foreground text-sm hover:text-foreground transition-colors duration-300 hover:underline"
              >
                {formatDistanceToNow(tweet.timestamp)}
              </Link>
              
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-accent/80 transition-all duration-300">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-border/50">
                    <DropdownMenuItem className="hover:bg-accent/80 transition-colors duration-200">Copy link</DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-accent/80 transition-colors duration-200">Share tweet</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Link 
              to={`/tweet/${tweet.publicKey.toString()}`}
              className="block"
            >
              <p className="text-foreground leading-relaxed mb-6 whitespace-pre-wrap hover:text-foreground/90 transition-colors duration-300 text-lg">
                {tweet.content}
              </p>
            </Link>

            {showReplies && (
              <div className="flex items-center gap-2 pt-4">
                <ComposeDialog 
                  parentTweet={tweet.publicKey}
                  onTweetPosted={handleReplyPosted}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-3 gap-3 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Reply</span>
                  </Button>
                </ComposeDialog>

                <RetweetButton tweetPubkey={tweet.publicKey} />

                <LikeButton tweetPubkey={tweet.publicKey} />

                <BookmarkButton tweetPubkey={tweet.publicKey} />

                {showReplyCount && replyCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleReplies}
                    className="h-auto p-3 gap-3 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all duration-300 hover:scale-105"
                  >
                    {showRepliesExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium">
                      {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  </Button>
                )}

                {replyCount > 0 && (
                  <Link
                    to={`/tweet/${tweet.publicKey.toString()}`}
                    className="text-muted-foreground hover:text-blue-500 transition-colors duration-300 text-sm px-3 py-2 rounded-2xl hover:bg-blue-500/10 font-medium"
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
          <Separator className="bg-border/30" />
          <div className="p-8 pt-0">
            {loadingReplies ? (
              <div className="text-center py-12">
                <LoadingSpinner className="mx-auto mb-6" />
                <p className="text-muted-foreground text-sm">Loading replies...</p>
              </div>
            ) : (
              <div className="space-y-6 mt-6">
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