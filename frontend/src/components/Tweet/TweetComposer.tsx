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
    <div className="tweet-composer">
      <div className="tweet-composer-header">
        <div className="user-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.displayName} />
          ) : (
            <div className="avatar-placeholder">
              {user?.displayName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="composer-content">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className={`tweet-input ${isOverLimit ? 'over-limit' : ''}`}
              disabled={loading}
              rows={3}
            />
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="composer-footer">
              <div className="char-counter">
                <span className={isOverLimit ? 'over-limit' : ''}>
                  {remainingChars}
                </span>
              </div>
              
              <button
                type="submit"
                className="tweet-button"
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
