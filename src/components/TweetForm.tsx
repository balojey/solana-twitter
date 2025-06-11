import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { useAnchorProgram } from '../hooks/useAnchorProgram';
import { Send, Loader2 } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

interface Props {
  onTweetPosted: () => void;
}

export function TweetForm({ onTweetPosted }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey } = useWallet();
  const program = useAnchorProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !publicKey || !program) return;

    try {
      setLoading(true);
      setError(null);

      const tweetKeypair = Keypair.generate();

      // Inside handleSubmit:
      const timestamp = Math.floor(Date.now() / 1000);
      const [tweetPDA, bump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("tweet"),
          publicKey.toBuffer(),
          Buffer.from(new BN(timestamp).toArrayLike(Buffer, "le", 8)),
        ],
        program.programId
      );

      await program.methods
        .postTweet(content.trim(), new BN(timestamp))
        .accounts({
          tweet: tweetPDA,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setContent('');
      onTweetPosted();
    } catch (err) {
      console.error('Error posting tweet:', err);
      setError('Failed to post tweet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Connect your wallet to post tweets</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full bg-gray-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          maxLength={280}
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-400">
            {content.length}/280
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!content.trim() || loading || content.length > 280}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Posting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Post Tweet
          </>
        )}
      </button>
    </form>
  );
}
