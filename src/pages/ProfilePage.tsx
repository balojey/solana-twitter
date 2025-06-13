import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicKey } from '@solana/web3.js';
import { useProfile } from '../hooks/useProfile';
import { TweetFeed } from '../components/TweetFeed';
import { UserProfile } from '../types/profile';
import { ArrowLeft, User, Calendar, Edit } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';

export function ProfilePage() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchProfile } = useProfile();

  useEffect(() => {
    const loadProfile = async () => {
      if (!pubkey) return;

      try {
        setLoading(true);
        setError(null);
        
        const publicKey = new PublicKey(pubkey);
        const userProfile = await fetchProfile(publicKey);
        
        if (!userProfile) {
          setError('Profile not found');
        } else {
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Invalid profile address');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [pubkey, fetchProfile]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse mx-auto mb-4"></div>
        <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3 mx-auto"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
        <p className="text-gray-400 mb-4">
          {error || 'This user hasn\'t created a profile yet.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">
              {profile.username.slice(0, 2).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
            </div>
            
            <p className="text-gray-400 text-sm font-mono mb-3">
              {truncateAddress(profile.authority.toString())}
            </p>
            
            {profile.bio && (
              <p className="text-gray-300 mb-3">{profile.bio}</p>
            )}
            
          </div>
        </div>
      </div>

      {/* User's Tweets */}
      <TweetFeed 
        authorFilter={profile.authority}
        title={`${profile.username}'s Tweets`}
      />
    </div>
  );
}