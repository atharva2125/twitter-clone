import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tweetService } from '../../services/tweetService';
import { Tweet } from '../../types';
import './Tweet.css';

interface TweetComposerProps {
  onTweetCreated?: (tweet: Tweet) => void;
  placeholder?: string;
  maxLength?: number;
}

const TweetComposer: React.FC<TweetComposerProps> = ({
  onTweetCreated,
  placeholder = "What's happening?",
  maxLength = 280
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    if (content.length > maxLength) return;

    setLoading(true);
    setError('');

    try {
      const response = await tweetService.createTweet(content);
      setContent('');
      if (onTweetCreated) {
        onTweetCreated(response.tweet);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tweet');
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-4 mb-5">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
              {user?.displayName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className={`twitter-textarea ${isOverLimit ? 'border-red-500' : ''}`}
              disabled={loading}
              rows={3}
            />
            
            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-400">
                <span className={isOverLimit ? 'text-red-400' : ''}>
                  {remainingChars} characters remaining
                </span>
              </div>
              
              <button
                type="submit"
                className="twitter-btn-primary"
                disabled={loading || !content.trim() || isOverLimit}
              >
                {loading ? 'Tweeting...' : 'Tweet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TweetComposer;
