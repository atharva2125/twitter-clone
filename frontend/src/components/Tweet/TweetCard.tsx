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
    <div className="twitter-card border-b border-gray-800">
      <div className="flex gap-4 p-4">
        <div className="flex-shrink-0">
          {tweet.author.avatar ? (
            <img src={tweet.author.avatar} alt={tweet.author.displayName} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
              {tweet.author.displayName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${tweet.author.username}`} className="hover:underline">
                <span className="font-bold text-white">
                  {tweet.author.displayName}
                  {tweet.author.verified && <span className="text-blue-500 ml-1">✓</span>}
                </span>
                <span className="text-gray-400 ml-2">@{tweet.author.username}</span>
              </Link>
              <span className="text-gray-400">·</span>
              <span className="text-gray-400">{formatDate(tweet.createdAt)}</span>
            </div>
            
            {user?.id === tweet.author.id && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-400 text-xl font-bold"
                disabled={loading}
                title="Delete tweet"
              >
                ×
              </button>
            )}
          </div>

          <div className="mt-2">
            <p className="text-white whitespace-pre-wrap">{renderContent(tweet.content)}</p>
          </div>

          {showActions && (
            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={() => {/* TODO: Handle reply */}}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                title="Reply"
              >
                <span>💬</span>
                <span className="text-sm">{tweet.replyCount || 0}</span>
              </button>

              <button
                onClick={handleRetweet}
                className={`flex items-center gap-2 transition-colors ${
                  isRetweeted ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                }`}
                disabled={loading}
                title="Retweet"
              >
                <span>🔄</span>
                <span className="text-sm">{retweetCount}</span>
              </button>

              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${
                  isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
                disabled={loading}
                title="Like"
              >
                <span>{isLiked ? '❤️' : '🤍'}</span>
                <span className="text-sm">{likeCount}</span>
              </button>

              <button
                onClick={() => {/* TODO: Handle share */}}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                title="Share"
              >
                <span>📤</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
