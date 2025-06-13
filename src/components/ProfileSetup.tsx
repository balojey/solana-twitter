import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { User, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Label } from '@/src/components/ui/label';
import { useToast } from '@/src/hooks/use-toast';

interface Props {
  onProfileCreated: () => void;
}

export function ProfileSetup({ onProfileCreated }: Props) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const { createProfile, loading, error } = useProfile();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    try {
      await createProfile(username.trim(), bio.trim());
      toast({
        title: "Profile Created!",
        description: "Your profile has been successfully created.",
      });
      onProfileCreated();
    } catch (err) {
      console.error('Failed to create profile:', err);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl">Create Your Profile</DialogTitle>
          <DialogDescription>
            Set up your profile to start tweeting and interacting with others.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={50}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={200}
              disabled={loading}
            />
            <div className="text-right">
              <span className="text-sm text-muted-foreground">{bio.length}/200</span>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={!username.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}