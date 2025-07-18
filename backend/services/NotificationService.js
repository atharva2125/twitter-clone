const User = require('../models/User');

class NotificationService {
  static async sendLikeNotification(tweet, liker, io) {
    try {
      const notification = {
        type: 'like',
        message: `${liker.displayName} liked your tweet`,
        from: {
          id: liker._id,
          username: liker.username,
          displayName: liker.displayName,
          avatar: liker.avatar
        },
        tweet: {
          id: tweet._id,
          content: tweet.content.substring(0, 50) + (tweet.content.length > 50 ? '...' : '')
        },
        timestamp: new Date()
      };

      // Send real-time notification via Socket.IO
      if (io) {
        io.to(`user-${tweet.author}`).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      throw new Error(`Error sending like notification: ${error.message}`);
    }
  }

  static async sendRetweetNotification(tweet, retweeter, io) {
    try {
      const notification = {
        type: 'retweet',
        message: `${retweeter.displayName} retweeted your tweet`,
        from: {
          id: retweeter._id,
          username: retweeter.username,
          displayName: retweeter.displayName,
          avatar: retweeter.avatar
        },
        tweet: {
          id: tweet._id,
          content: tweet.content.substring(0, 50) + (tweet.content.length > 50 ? '...' : '')
        },
        timestamp: new Date()
      };

      // Send real-time notification via Socket.IO
      if (io) {
        io.to(`user-${tweet.author}`).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      throw new Error(`Error sending retweet notification: ${error.message}`);
    }
  }

  static async sendFollowNotification(followedUser, follower, io) {
    try {
      const notification = {
        type: 'follow',
        message: `${follower.displayName} started following you`,
        from: {
          id: follower._id,
          username: follower.username,
          displayName: follower.displayName,
          avatar: follower.avatar
        },
        timestamp: new Date()
      };

      // Send real-time notification via Socket.IO
      if (io) {
        io.to(`user-${followedUser._id}`).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      throw new Error(`Error sending follow notification: ${error.message}`);
    }
  }

  static async sendReplyNotification(originalTweet, reply, replier, io) {
    try {
      const notification = {
        type: 'reply',
        message: `${replier.displayName} replied to your tweet`,
        from: {
          id: replier._id,
          username: replier.username,
          displayName: replier.displayName,
          avatar: replier.avatar
        },
        tweet: {
          id: originalTweet._id,
          content: originalTweet.content.substring(0, 50) + (originalTweet.content.length > 50 ? '...' : '')
        },
        reply: {
          id: reply._id,
          content: reply.content.substring(0, 50) + (reply.content.length > 50 ? '...' : '')
        },
        timestamp: new Date()
      };

      // Send real-time notification via Socket.IO
      if (io) {
        io.to(`user-${originalTweet.author}`).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      throw new Error(`Error sending reply notification: ${error.message}`);
    }
  }

  static async sendMentionNotifications(tweet, mentionedUserIds, io) {
    try {
      const mentionedUsers = await User.find({ _id: { $in: mentionedUserIds } });
      const author = await User.findById(tweet.author);

      const notifications = mentionedUsers.map(user => ({
        type: 'mention',
        message: `${author.displayName} mentioned you in a tweet`,
        from: {
          id: author._id,
          username: author.username,
          displayName: author.displayName,
          avatar: author.avatar
        },
        tweet: {
          id: tweet._id,
          content: tweet.content.substring(0, 50) + (tweet.content.length > 50 ? '...' : '')
        },
        timestamp: new Date()
      }));

      // Send real-time notifications via Socket.IO
      if (io) {
        mentionedUsers.forEach((user, index) => {
          io.to(`user-${user._id}`).emit('notification', notifications[index]);
        });
      }

      return notifications;
    } catch (error) {
      throw new Error(`Error sending mention notifications: ${error.message}`);
    }
  }

  static async sendTweetNotification(tweet, io) {
    try {
      const author = await User.findById(tweet.author).populate('followers');
      
      const notification = {
        type: 'tweet',
        message: `${author.displayName} posted a new tweet`,
        from: {
          id: author._id,
          username: author.username,
          displayName: author.displayName,
          avatar: author.avatar
        },
        tweet: {
          id: tweet._id,
          content: tweet.content.substring(0, 50) + (tweet.content.length > 50 ? '...' : '')
        },
        timestamp: new Date()
      };

      // Send to all followers
      if (io && author.followers.length > 0) {
        author.followers.forEach(follower => {
          io.to(`user-${follower._id}`).emit('notification', notification);
        });
      }

      return notification;
    } catch (error) {
      throw new Error(`Error sending tweet notification: ${error.message}`);
    }
  }

  static async sendBulkNotifications(notifications, io) {
    try {
      if (!io) return;

      notifications.forEach(notification => {
        if (notification.recipients && notification.recipients.length > 0) {
          notification.recipients.forEach(recipient => {
            io.to(`user-${recipient}`).emit('notification', notification.data);
          });
        }
      });
    } catch (error) {
      throw new Error(`Error sending bulk notifications: ${error.message}`);
    }
  }

  static async sendSystemNotification(userId, message, type = 'system', io) {
    try {
      const notification = {
        type,
        message,
        from: {
          id: 'system',
          username: 'system',
          displayName: 'System',
          avatar: ''
        },
        timestamp: new Date()
      };

      // Send real-time notification via Socket.IO
      if (io) {
        io.to(`user-${userId}`).emit('notification', notification);
      }

      return notification;
    } catch (error) {
      throw new Error(`Error sending system notification: ${error.message}`);
    }
  }

  static async sendWelcomeNotification(userId, io) {
    try {
      const message = 'Welcome to Twitter Clone! Start following people to see their tweets in your timeline.';
      return await this.sendSystemNotification(userId, message, 'welcome', io);
    } catch (error) {
      throw new Error(`Error sending welcome notification: ${error.message}`);
    }
  }

  static async sendTrendingNotification(userId, hashtag, io) {
    try {
      const message = `The hashtag #${hashtag} is trending! Check out what people are saying.`;
      return await this.sendSystemNotification(userId, message, 'trending', io);
    } catch (error) {
      throw new Error(`Error sending trending notification: ${error.message}`);
    }
  }

  static async sendMilestoneNotification(userId, milestone, count, io) {
    try {
      const message = `Congratulations! You've reached ${count} ${milestone}!`;
      return await this.sendSystemNotification(userId, message, 'milestone', io);
    } catch (error) {
      throw new Error(`Error sending milestone notification: ${error.message}`);
    }
  }
}

module.exports = NotificationService;
