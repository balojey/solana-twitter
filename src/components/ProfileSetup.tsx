import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { User, FileText, Loader2 } from 'lucide-react';

interface Props {
  onProfileCreated: () => void;
}

export function ProfileSetup({ onProfileCreated }: Props) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const { createProfile, loading, error } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    try {
      await createProfile(username.trim(), bio.trim());
      onProfileCreated();
    } catch (err) {
      console.error('Failed to create profile:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Your Profile</h2>
          <p className="text-gray-400">Set up your profile to start tweeting and interacting with others.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username *
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={50}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full bg-gray-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              maxLength={200}
              disabled={loading}
            />
            <div className="text-right mt-1">
              <span className="text-sm text-gray-400">{bio.length}/200</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Create Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}