import axios from 'axios';
import { Tweet, TweetResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tweetService = {
  // Get all tweets
  getAllTweets: async (page = 1, limit = 10): Promise<TweetResponse> => {
    const response = await api.get(`/tweets?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create a new tweet
  createTweet: async (content: string): Promise<{ tweet: Tweet }> => {
    const response = await api.post('/tweets', { content });
    return response.data;
  },

  // Get a specific tweet
  getTweet: async (id: string): Promise<{ tweet: Tweet }> => {
    const response = await api.get(`/tweets/${id}`);
    return response.data;
  },

  // Like/Unlike a tweet
  likeTweet: async (id: string): Promise<{ tweet: Tweet; isLiked: boolean }> => {
    const response = await api.post(`/tweets/${id}/like`);
    return response.data;
  },

  // Retweet
  retweetTweet: async (id: string): Promise<{ tweet: Tweet; hasRetweeted: boolean }> => {
    const response = await api.post(`/tweets/${id}/retweet`);
    return response.data;
  },

  // Reply to a tweet
  replyToTweet: async (id: string, content: string): Promise<{ tweet: Tweet }> => {
    const response = await api.post(`/tweets/${id}/reply`, { content });
    return response.data;
  },

  // Delete a tweet
  deleteTweet: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tweets/${id}`);
    return response.data;
  }
};
