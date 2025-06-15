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
      <Card className="border-2 border-dashed border-muted/50 bg-gradient-to-br from-muted/20 to-muted/5 backdrop-blur-sm">
        <CardContent className="pt-8 text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground text-lg">Connect your wallet to start tweeting and join the conversation</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasProfile) {
    return (
      <Card className="border-2 border-dashed border-muted/50 bg-gradient-to-br from-muted/20 to-muted/5 backdrop-blur-sm">
        <CardContent className="pt-8 text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
          <p className="text-muted-foreground text-lg">Create a profile to start posting tweets and engaging with the community</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:border-primary/30 transition-all duration-300 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-5">
            <Avatar className="w-14 h-14 flex-shrink-0 ring-2 ring-border/50 hover:ring-primary/50 transition-all duration-300">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg">
                {profile?.username ? profile.username.slice(0, 2).toUpperCase() : publicKey.toString().slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">
                    {profile?.username || truncateAddress(publicKey.toString())}
                  </span>
                  <span className="text-muted-foreground text-sm font-mono bg-muted/50 px-2 py-1 rounded-lg">
                    {truncateAddress(publicKey.toString())}
                  </span>
                </div>
                
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={placeholder || (isReply ? "Tweet your reply..." : "What's happening?")}
                  rows={isReply ? 4 : 5}
                  maxLength={maxLength}
                  disabled={loading}
                  className="resize-none text-lg border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-muted-foreground/70"
                />
              </div>

              {/* Tweet Options */}
              <div className="flex items-center gap-2 text-primary">
                <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                  <Image className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                  <Smile className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 hover:bg-primary/10 transition-all duration-300 hover:scale-105">
                  <MapPin className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-border/30" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className={`text-sm font-bold ${
                remainingChars < 20 
                  ? remainingChars < 0 
                    ? 'text-destructive' 
                    : 'text-orange-500'
                  : 'text-muted-foreground'
              }`}>
                {remainingChars}
              </span>
              {remainingChars < 20 && (
                <div className="w-8 h-8 relative">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - (maxLength - content.length) / maxLength)}`}
                      className={remainingChars < 0 ? 'text-destructive' : remainingChars < 20 ? 'text-orange-500' : 'text-primary'}
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="rounded-2xl px-6 hover:bg-accent/80 transition-all duration-300"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={!content.trim() || loading || content.length > maxLength}
                className="rounded-2xl px-8 font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    {isReply ? 'Replying...' : 'Posting...'}
                  </>
                ) : (
                  <>
                    <Send className="mr-3 h-5 w-5" />
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