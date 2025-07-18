const Tweet = require('../models/Tweet');
const User = require('../models/User');

class FeedService {
  static async getHomeFeed(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const user = await User.findById(userId).populate('following');
      
      if (!user) {
        throw new Error('User not found');
      }

      // Get following user IDs including the user themselves
      const followingIds = user.following.map(f => f._id);
      followingIds.push(userId);

      // Get tweets from following users and retweets
      const tweets = await Tweet.find({
        $or: [
          { author: { $in: followingIds } },
          { 'retweets.user': { $in: followingIds } }
        ]
      })
        .populate('author', 'username displayName avatar verified')
        .populate('retweets.user', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error fetching home feed: ${error.message}`);
    }
  }

  static async getUserFeed(username, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const user = await User.findOne({ username });
      
      if (!user) {
        throw new Error('User not found');
      }

      const tweets = await Tweet.find({ author: user._id })
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error fetching user feed: ${error.message}`);
    }
  }

  static async getExploreFeed(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const user = await User.findById(userId).populate('following');
      
      if (!user) {
        throw new Error('User not found');
      }

      // Get following user IDs
      const followingIds = user.following.map(f => f._id);
      followingIds.push(userId);

      // Get trending tweets (high engagement from users not followed)
      const tweets = await Tweet.find({
        author: { $nin: followingIds }
      })
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ 
          likeCount: -1,
          retweetCount: -1,
          createdAt: -1 
        })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error fetching explore feed: ${error.message}`);
    }
  }

  static async getTrendingTweets(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const tweets = await Tweet.find({
        createdAt: { $gte: oneDayAgo }
      })
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ 
          likeCount: -1,
          retweetCount: -1,
          createdAt: -1 
        })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error fetching trending tweets: ${error.message}`);
    }
  }

  static async getTweetReplies(tweetId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const tweet = await Tweet.findById(tweetId);
      
      if (!tweet) {
        throw new Error('Tweet not found');
      }

      const replies = await Tweet.find({ replyTo: tweetId })
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return replies;
    } catch (error) {
      throw new Error(`Error fetching tweet replies: ${error.message}`);
    }
  }

  static async getLikedTweets(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const tweets = await Tweet.find({ likes: userId })
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error fetching liked tweets: ${error.message}`);
    }
  }

  static async getMediaTweets(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const tweets = await Tweet.find({ 
        author: userId,
        images: { $exists: true, $not: { $size: 0 } }
      })
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error fetching media tweets: ${error.message}`);
    }
  }

  static async getRetweetedTweets(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const tweets = await Tweet.find({ 'retweets.user': userId })
        .populate('author', 'username displayName avatar verified')
        .populate('retweets.user', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ 'retweets.retweetedAt': -1 })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error fetching retweeted tweets: ${error.message}`);
    }
  }

  static async getTrendingHashtags(limit = 10) {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const trending = await Tweet.aggregate([
        { $match: { createdAt: { $gte: oneDayAgo } } },
        { $unwind: '$hashtags' },
        { $group: { _id: '$hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      return trending;
    } catch (error) {
      throw new Error(`Error fetching trending hashtags: ${error.message}`);
    }
  }

  static async getPersonalizedFeed(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const user = await User.findById(userId).populate('following');
      
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's interaction history to personalize feed
      const likedTweets = await Tweet.find({ likes: userId }).select('hashtags mentions');
      const userInterests = this.extractUserInterests(likedTweets);

      // Get following user IDs
      const followingIds = user.following.map(f => f._id);
      followingIds.push(userId);

      // Build personalized query
      const query = {
        $or: [
          { author: { $in: followingIds } },
          { hashtags: { $in: userInterests.hashtags } },
          { mentions: { $in: userInterests.mentions } }
        ]
      };

      const tweets = await Tweet.find(query)
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return tweets;
    } catch (error) {
      throw new Error(`Error fetching personalized feed: ${error.message}`);
    }
  }

  static extractUserInterests(likedTweets) {
    const hashtags = [];
    const mentions = [];

    likedTweets.forEach(tweet => {
      if (tweet.hashtags) {
        hashtags.push(...tweet.hashtags);
      }
      if (tweet.mentions) {
        mentions.push(...tweet.mentions);
      }
    });

    return {
      hashtags: [...new Set(hashtags)].slice(0, 10),
      mentions: [...new Set(mentions)].slice(0, 10)
    };
  }
}

module.exports = FeedService;
