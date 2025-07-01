import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tweetService } from '../../services/tweetService';
import { Tweet } from '../../types';
import './Tweet.css';

interface TweetCardProps {
  tweet: Tweet;
  onTweetUpdate?: (tweet: Tweet) => void;
  onTweetDelete?: (tweetId: string) => void;
  showActions?: boolean;
}

const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  onTweetUpdate,
  onTweetDelete,
  showActions = true
}) => {
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [likeCount, setLikeCount] = useState(tweet.likeCount || 0);
  const [retweetCount, setRetweetCount] = useState(tweet.retweetCount || 0);
  const { user } = useAuth();

  React.useEffect(() => {
    if (user && tweet.likes) {
      setIsLiked(tweet.likes.includes(user.id));
    }
    if (user && tweet.retweets) {
      setIsRetweeted(tweet.retweets.some(rt => rt.user === user.id));
    }
  }, [user, tweet]);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await tweetService.likeTweet(tweet._id);
      setIsLiked(response.isLiked);
      setLikeCount(response.tweet.likeCount);
      
      if (onTweetUpdate) {
        onTweetUpdate(response.tweet);
      }
    } catch (error) {
      console.error('Error liking tweet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetweet = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await tweetService.retweetTweet(tweet._id);
      setIsRetweeted(response.hasRetweeted);
      setRetweetCount(response.tweet.retweetCount);
      
      if (onTweetUpdate) {
        onTweetUpdate(response.tweet);
      }
    } catch (error) {
      console.error('Error retweeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) {
      return;
    }

    setLoading(true);
    try {
      await tweetService.deleteTweet(tweet._id);
      if (onTweetDelete) {
        onTweetDelete(tweet._id);
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString();
  };

  const renderContent = (content: string) => {
    // Simple hashtag and mention highlighting
    return content
      .split(' ')
      .map((word, index) => {
        if (word.startsWith('#')) {
          return (
            <span key={index} className="hashtag">
              {word}{' '}
            </span>
          );
        }
        if (word.startsWith('@')) {
          return (
            <span key={index} className="mention">
              {word}{' '}
            </span>
          );
        }
        return word + ' ';
      });
  };

  return (
    <div className="tweet-card">
      <div className="tweet-header">
        <div className="user-avatar">
          {tweet.author.avatar ? (
            <img src={tweet.author.avatar} alt={tweet.author.displayName} />
          ) : (
            <div className="avatar-placeholder">
              {tweet.author.displayName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="tweet-info">
          <div className="user-info">
            <Link to={`/profile/${tweet.author.username}`} className="user-link">
              <span className="display-name">
                {tweet.author.displayName}
                {tweet.author.verified && <span className="verified">✓</span>}
              </span>
              <span className="username">@{tweet.author.username}</span>
            </Link>
            <span className="tweet-date">{formatDate(tweet.createdAt)}</span>
          </div>
          
          {user?.id === tweet.author.id && (
            <button
              onClick={handleDelete}
              className="delete-button"
              disabled={loading}
              title="Delete tweet"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="tweet-content">
        <p>{renderContent(tweet.content)}</p>
      </div>

      {showActions && (
        <div className="tweet-actions">
          <button
            onClick={() => {/* TODO: Handle reply */}}
            className="action-button reply-button"
            title="Reply"
          >
            <span className="action-icon">💬</span>
            <span className="action-count">{tweet.replyCount || 0}</span>
          </button>

          <button
            onClick={handleRetweet}
            className={`action-button retweet-button ${isRetweeted ? 'active' : ''}`}
            disabled={loading}
            title="Retweet"
          >
            <span className="action-icon">🔄</span>
            <span className="action-count">{retweetCount}</span>
          </button>

          <button
            onClick={handleLike}
            className={`action-button like-button ${isLiked ? 'active' : ''}`}
            disabled={loading}
            title="Like"
          >
            <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
            <span className="action-count">{likeCount}</span>
          </button>

          <button
            onClick={() => {/* TODO: Handle share */}}
            className="action-button share-button"
            title="Share"
          >
            <span className="action-icon">📤</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TweetCard;
