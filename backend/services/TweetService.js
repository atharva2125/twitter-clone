const Tweet = require('../models/Tweet');
const User = require('../models/User');
const NotificationService = require('./NotificationService');

class TweetService {
  static async createTweet(tweetData, io) {
    try {
      const { content, author, images = [], hashtags = [], mentions = [] } = tweetData;

      // Extract hashtags and mentions from content
      const extractedHashtags = this.extractHashtags(content);
      const extractedMentions = await this.extractMentions(content);

      const tweet = new Tweet({
        content,
        author,
        images,
        hashtags: [...hashtags, ...extractedHashtags],
        mentions: [...mentions, ...extractedMentions]
      });

      await tweet.save();
      await tweet.populate('author', 'username displayName avatar verified');
      await tweet.populate('mentions', 'username displayName');

      // Send real-time notification
      if (io) {
        io.emit('tweet-created', tweet);
      }

      // Send notifications to mentioned users
      if (extractedMentions.length > 0) {
        await NotificationService.sendMentionNotifications(tweet, extractedMentions, io);
      }

      return tweet;
    } catch (error) {
      throw new Error(`Error creating tweet: ${error.message}`);
    }
  }

  static async getTweetById(tweetId) {
    try {
      return await Tweet.findById(tweetId)
        .populate('author', 'username displayName avatar verified')
        .populate('mentions', 'username displayName')
        .populate('replyTo');
    } catch (error) {
      throw new Error(`Error fetching tweet: ${error.message}`);
    }
  }

  static async likeTweet(tweetId, userId, io) {
    try {
      const tweet = await Tweet.findById(tweetId);
      if (!tweet) {
        throw new Error('Tweet not found');
      }

      const isLiked = tweet.likes.includes(userId);
      
      if (isLiked) {
        tweet.likes.pull(userId);
      } else {
        tweet.likes.push(userId);
        
        // Send notification to tweet author
        if (tweet.author.toString() !== userId.toString()) {
          const liker = await User.findById(userId);
          await NotificationService.sendLikeNotification(tweet, liker, io);
        }
      }

      await tweet.save();
      return tweet;
    } catch (error) {
      throw new Error(`Error liking tweet: ${error.message}`);
    }
  }

  static async retweetTweet(tweetId, userId, io) {
    try {
      const tweet = await Tweet.findById(tweetId);
      if (!tweet) {
        throw new Error('Tweet not found');
      }

      const existingRetweet = tweet.retweets.find(rt => rt.user.toString() === userId.toString());
      
      if (existingRetweet) {
        tweet.retweets.pull(existingRetweet._id);
      } else {
        tweet.retweets.push({ user: userId });
        
        // Send notification to tweet author
        if (tweet.author.toString() !== userId.toString()) {
          const retweeter = await User.findById(userId);
          await NotificationService.sendRetweetNotification(tweet, retweeter, io);
        }
      }

      await tweet.save();
      return tweet;
    } catch (error) {
      throw new Error(`Error retweeting: ${error.message}`);
    }
  }

  static async replyToTweet(tweetId, replyData, io) {
    try {
      const originalTweet = await Tweet.findById(tweetId);
      if (!originalTweet) {
        throw new Error('Original tweet not found');
      }

      const reply = await this.createTweet({
        ...replyData,
        isReply: true,
        replyTo: tweetId
      }, io);

      // Add reply to original tweet
      originalTweet.replies.push(reply._id);
      await originalTweet.save();

      // Send notification to original tweet author
      if (originalTweet.author.toString() !== replyData.author.toString()) {
        const replier = await User.findById(replyData.author);
        await NotificationService.sendReplyNotification(originalTweet, reply, replier, io);
      }

      return reply;
    } catch (error) {
      throw new Error(`Error replying to tweet: ${error.message}`);
    }
  }

  static async deleteTweet(tweetId, userId) {
    try {
      const tweet = await Tweet.findById(tweetId);
      if (!tweet) {
        throw new Error('Tweet not found');
      }

      if (tweet.author.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete this tweet');
      }

      await Tweet.findByIdAndDelete(tweetId);
      return { message: 'Tweet deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting tweet: ${error.message}`);
    }
  }

  static extractHashtags(content) {
    const hashtagRegex = /#\w+/g;
    const hashtags = content.match(hashtagRegex) || [];
    return hashtags.map(tag => tag.substring(1).toLowerCase());
  }

  static async extractMentions(content) {
    const mentionRegex = /@\w+/g;
    const mentions = content.match(mentionRegex) || [];
    const usernames = mentions.map(mention => mention.substring(1));
    
    if (usernames.length === 0) return [];
    
    const users = await User.find({ username: { $in: usernames } });
    return users.map(user => user._id);
  }

  static async getTweetsByHashtag(hashtag, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      return await Tweet.find({ hashtags: hashtag.toLowerCase() })
        .populate('author', 'username displayName avatar verified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      throw new Error(`Error fetching tweets by hashtag: ${error.message}`);
    }
  }
}

module.exports = TweetService;
