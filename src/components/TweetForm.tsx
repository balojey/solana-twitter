import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useTweets } from '../hooks/useTweets';
import { useProfile } from '../hooks/useProfile';
import { Send, Loader2, Image, Smile, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Separator } from '@/src/components/ui/separator';
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
  const { profile, hasProfile } = useProfile();
  const { postTweet } = useTweets();
  const { toast } = useToast();

  const isReply = !!parentTweet;
  const maxLength = 280;
  const remainingChars = maxLength - content.length;

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

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!publicKey) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground text-lg">Connect your wallet to start tweeting</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground text-lg">Create a profile to start posting tweets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {profile?.username ? profile.username.slice(0, 2).toUpperCase() : publicKey.toString().slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {profile?.username || truncateAddress(publicKey.toString())}
                  </span>
                  <span className="text-muted-foreground text-sm font-mono">
                    {truncateAddress(publicKey.toString())}
                  </span>
                </div>
                
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={placeholder || (isReply ? "Tweet your reply..." : "What's happening?")}
                  rows={isReply ? 3 : 4}
                  maxLength={maxLength}
                  disabled={loading}
                  className="resize-none text-lg border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* Tweet Options */}
              <div className="flex items-center gap-4 text-primary">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-primary/10">
                  <Image className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-primary/10">
                  <Smile className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-primary/10">
                  <MapPin className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${
                remainingChars < 20 
                  ? remainingChars < 0 
                    ? 'text-destructive' 
                    : 'text-orange-500'
                  : 'text-muted-foreground'
              }`}>
                {remainingChars}
              </span>
              {remainingChars < 20 && (
                <div className="w-6 h-6 relative">
                  <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 10}`}
                      strokeDashoffset={`${2 * Math.PI * 10 * (1 - (maxLength - content.length) / maxLength)}`}
                      className={remainingChars < 0 ? 'text-destructive' : remainingChars < 20 ? 'text-orange-500' : 'text-primary'}
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="rounded-full"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={!content.trim() || loading || content.length > maxLength}
                className="rounded-full px-6 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isReply ? 'Replying...' : 'Posting...'}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {isReply ? 'Reply' : 'Tweet'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}