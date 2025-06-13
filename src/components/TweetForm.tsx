import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useTweets } from '../hooks/useTweets';
import { useProfile } from '../hooks/useProfile';
import { Send, Loader2, X, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { useToast } from '@/src/hooks/use-toast';

interface Props {
  onTweetPosted: () => void;
  parentTweet?: PublicKey | null;
  onCancel?: () => void;
  placeholder?: string;
}

export function TweetForm({ onTweetPosted, parentTweet, onCancel, placeholder }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const { hasProfile } = useProfile();
  const { postTweet } = useTweets();
  const { toast } = useToast();

  const isReply = !!parentTweet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !publicKey || !hasProfile) return;

    try {
      setLoading(true);

      await postTweet(content.trim(), parentTweet);

      toast({
        title: isReply ? "Reply Posted!" : "Tweet Posted!",
        description: isReply ? "Your reply has been posted." : "Your tweet has been posted.",
      });

      setContent('');
      onTweetPosted();
      if (onCancel) onCancel();
    } catch (err) {
      console.error('Error posting tweet:', err);
      toast({
        title: "Error",
        description: "Failed to post tweet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Connect your wallet to post tweets</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Create a profile to start posting tweets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {isReply && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Replying to tweet</span>
            </div>
            {onCancel && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={isReply ? "pt-0" : "pt-6"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder || (isReply ? "Tweet your reply..." : "What's happening?")}
              rows={isReply ? 2 : 3}
              maxLength={280}
              disabled={loading}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {content.length}/280
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!content.trim() || loading || content.length > 280}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isReply ? 'Replying...' : 'Posting...'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {isReply ? 'Reply' : 'Post Tweet'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}