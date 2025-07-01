import axios from 'axios';
import { User, UserProfileResponse } from '../types';

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

export const userService = {
  // Get user profile
  getUserProfile: async (username: string): Promise<UserProfileResponse> => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Follow/Unfollow user
  followUser: async (username: string): Promise<{ 
    message: string; 
    isFollowing: boolean; 
    followersCount: number;
  }> => {
    const response = await api.post(`/users/${username}/follow`);
    return response.data;
  },

  // Get user followers
  getFollowers: async (username: string, page = 1, limit = 20): Promise<{
    followers: User[];
    totalCount: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get(`/users/${username}/followers?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get user following
  getFollowing: async (username: string, page = 1, limit = 20): Promise<{
    following: User[];
    totalCount: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get(`/users/${username}/following?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search users
  searchUsers: async (query: string, page = 1, limit = 10): Promise<{
    users: User[];
    query: string;
    page: number;
    limit: number;
  }> => {
    const response = await api.get(`/users/search/${query}?page=${page}&limit=${limit}`);
    return response.data;
  }
};
