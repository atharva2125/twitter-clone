import React, { useState, useEffect } from 'react';
import TweetComposer from '../Tweet/TweetComposer';
import TweetCard from '../Tweet/TweetCard';
import TailwindTest from '../Test/TailwindTest';
import { tweetService } from '../../services/tweetService';
import { Tweet } from '../../types';
import './Home.css';

const tweets = [
  {
    id: 1,
    user: {
      name: 'Elon Musk',
      username: 'elonmusk',
      avatar: '/elon-avatar.png',
    },
    content: 'Just launched something cool 🚀',
    createdAt: '2h',
  },
  // ...more tweets
];

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
    <div className="ml-20 md:ml-64 max-w-2xl mx-auto pt-8 bg-black min-h-screen">
      <div className="bg-black border-b border-gray-800 p-5 mb-5 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-white m-0">Home</h1>
      </div>
      
      <TailwindTest />
      
      <TweetComposer onTweetCreated={handleTweetCreated} />
      
      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded-xl mb-5 flex justify-between items-center border border-red-800">
          {error}
          <button onClick={() => loadTweets(1)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      )}
      
      <div className="flex flex-col">
        {tweets.map(tweet => (
          <TweetCard
            key={tweet._id}
            tweet={tweet}
            onTweetUpdate={handleTweetUpdate}
            onTweetDelete={handleTweetDelete}
          />
        ))}
        
        {loading && page === 1 && (
          <div className="text-center p-10 bg-black rounded-xl border border-gray-800 mb-5 text-gray-400">Loading tweets...</div>
        )}
        
        {tweets.length === 0 && !loading && (
          <div className="text-center p-10 bg-black rounded-xl border border-gray-800 mb-5">
            <h3 className="text-xl font-semibold text-white mb-2">No tweets yet</h3>
            <p className="text-gray-400 m-0">Be the first to share what's happening!</p>
          </div>
        )}
        
        {hasMore && tweets.length > 0 && (
          <button 
            onClick={loadMoreTweets} 
            disabled={loading}
            className="bg-black text-blue-500 border-2 border-blue-500 py-3 px-6 rounded-full font-semibold mx-auto block my-5 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load more tweets'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
