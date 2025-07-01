export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  bio: string;
  verified?: boolean;
  followersCount?: number;
  followingCount?: number;
  followers?: User[];
  following?: User[];
  createdAt?: string;
}

export interface Tweet {
  _id: string;
  id: string;
  content: string;
  author: User;
  likes: string[];
  retweets: Array<{
    user: string;
    retweetedAt: string;
  }>;
  replies: string[];
  isReply: boolean;
  replyTo?: string;
  images?: string[];
  hashtags?: string[];
  mentions?: string[];
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface TweetResponse {
  tweets: Tweet[];
  page: number;
  limit: number;
}

export interface UserProfileResponse {
  user: User;
  tweets: Tweet[];
}
