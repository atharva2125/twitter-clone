import React, { useState, useEffect } from 'react';
import TweetComposer from '../Tweet/TweetComposer';
import TweetCard from '../Tweet/TweetCard';
import { tweetService } from '../../services/tweetService';
import { Tweet } from '../../types';
import './Home.css';

const Home: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTweets();
  }, []);

  const loadTweets = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await tweetService.getAllTweets(pageNum, 10);
      
      if (pageNum === 1) {
        setTweets(response.tweets);
      } else {
        setTweets(prev => [...prev, ...response.tweets]);
      }
      
      setHasMore(response.tweets.length === 10);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tweets');
    } finally {
      setLoading(false);
    }
  };

  const handleTweetCreated = (newTweet: Tweet) => {
    setTweets(prev => [newTweet, ...prev]);
  };

  const handleTweetUpdate = (updatedTweet: Tweet) => {
    setTweets(prev => 
      prev.map(tweet => 
        tweet._id === updatedTweet._id ? updatedTweet : tweet
      )
    );
  };

  const handleTweetDelete = (tweetId: string) => {
    setTweets(prev => prev.filter(tweet => tweet._id !== tweetId));
  };

  const loadMoreTweets = () => {
    if (!loading && hasMore) {
      loadTweets(page + 1);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Home</h1>
      </div>
      
      <TweetComposer onTweetCreated={handleTweetCreated} />
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => loadTweets(1)} className="retry-button">
            Retry
          </button>
        </div>
      )}
      
      <div className="tweets-container">
        {tweets.map(tweet => (
          <TweetCard
            key={tweet._id}
            tweet={tweet}
            onTweetUpdate={handleTweetUpdate}
            onTweetDelete={handleTweetDelete}
          />
        ))}
        
        {loading && page === 1 && (
          <div className="loading-message">Loading tweets...</div>
        )}
        
        {tweets.length === 0 && !loading && (
          <div className="empty-message">
            <h3>No tweets yet</h3>
            <p>Be the first to share what's happening!</p>
          </div>
        )}
        
        {hasMore && tweets.length > 0 && (
          <button 
            onClick={loadMoreTweets} 
            disabled={loading}
            className="load-more-button"
          >
            {loading ? 'Loading...' : 'Load more tweets'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
