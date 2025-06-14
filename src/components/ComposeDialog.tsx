import { useState, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Separator } from '@/src/components/ui/separator';
import { Send, Loader2, X, Image, Smile, MapPin } from 'lucide-react';
import { useTweets } from '../hooks/useTweets';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../hooks/use-toast';

interface ComposeDialogProps {
  children: ReactNode;
  parentTweet?: PublicKey | null;
  onTweetPosted?: () => void;
}

export function ComposeDialog({ children, parentTweet, onTweetPosted }: ComposeDialogProps) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      if (onTweetPosted) onTweetPosted();
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

  if (!publicKey || !hasProfile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {isReply ? 'Reply to tweet' : 'Compose tweet'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 px-6 py-4">
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
                    placeholder={isReply ? "Tweet your reply..." : "What's happening?"}
                    className="min-h-32 text-lg border-none p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    maxLength={maxLength}
                    disabled={loading}
                  />
                </div>

                {/* Tweet Options */}
                <div className="flex items-center gap-4 text-primary">
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Image className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <MapPin className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="px-6 py-4">
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
                  <div className="w-8 h-8 relative">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-muted-foreground/20"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 14}`}
                        strokeDashoffset={`${2 * Math.PI * 14 * (1 - (maxLength - content.length) / maxLength)}`}
                        className={remainingChars < 0 ? 'text-destructive' : remainingChars < 20 ? 'text-orange-500' : 'text-primary'}
                      />
                    </svg>
                  </div>
                )}
              </div>

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
      </DialogContent>
    </Dialog>
  );
}