const User = require('../models/User');
const NotificationService = require('./NotificationService');

class SocialGraphService {
  static async followUser(followerId, followingId, io) {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      const [follower, following] = await Promise.all([
        User.findById(followerId),
        User.findById(followingId)
      ]);

      if (!follower || !following) {
        throw new Error('User not found');
      }

      // Check if already following
      if (follower.following.includes(followingId)) {
        throw new Error('Already following this user');
      }

      // Add to following/followers arrays
      follower.following.push(followingId);
      following.followers.push(followerId);

      await Promise.all([follower.save(), following.save()]);

      // Send notification
      await NotificationService.sendFollowNotification(following, follower, io);

      return { message: 'Successfully followed user' };
    } catch (error) {
      throw new Error(`Error following user: ${error.message}`);
    }
  }

  static async unfollowUser(followerId, followingId) {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot unfollow yourself');
      }

      const [follower, following] = await Promise.all([
        User.findById(followerId),
        User.findById(followingId)
      ]);

      if (!follower || !following) {
        throw new Error('User not found');
      }

      // Check if actually following
      if (!follower.following.includes(followingId)) {
        throw new Error('Not following this user');
      }

      // Remove from following/followers arrays
      follower.following.pull(followingId);
      following.followers.pull(followerId);

      await Promise.all([follower.save(), following.save()]);

      return { message: 'Successfully unfollowed user' };
    } catch (error) {
      throw new Error(`Error unfollowing user: ${error.message}`);
    }
  }

  static async getFollowers(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const user = await User.findById(userId)
        .populate({
          path: 'followers',
          select: 'username displayName avatar verified bio',
          options: { skip, limit }
        });

      if (!user) {
        throw new Error('User not found');
      }

      return user.followers;
    } catch (error) {
      throw new Error(`Error fetching followers: ${error.message}`);
    }
  }

  static async getFollowing(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const user = await User.findById(userId)
        .populate({
          path: 'following',
          select: 'username displayName avatar verified bio',
          options: { skip, limit }
        });

      if (!user) {
        throw new Error('User not found');
      }

      return user.following;
    } catch (error) {
      throw new Error(`Error fetching following: ${error.message}`);
    }
  }

  static async getFollowersCount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.followers.length;
    } catch (error) {
      throw new Error(`Error fetching followers count: ${error.message}`);
    }
  }

  static async getFollowingCount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.following.length;
    } catch (error) {
      throw new Error(`Error fetching following count: ${error.message}`);
    }
  }

  static async isFollowing(followerId, followingId) {
    try {
      const follower = await User.findById(followerId);
      if (!follower) {
        throw new Error('User not found');
      }
      return follower.following.includes(followingId);
    } catch (error) {
      throw new Error(`Error checking follow status: ${error.message}`);
    }
  }

  static async getMutualFollowers(userId, targetUserId) {
    try {
      const [user, targetUser] = await Promise.all([
        User.findById(userId).populate('followers', 'username displayName avatar verified'),
        User.findById(targetUserId).populate('followers', 'username displayName avatar verified')
      ]);

      if (!user || !targetUser) {
        throw new Error('User not found');
      }

      // Find mutual followers
      const mutualFollowers = user.followers.filter(follower =>
        targetUser.followers.some(targetFollower => 
          targetFollower._id.toString() === follower._id.toString()
        )
      );

      return mutualFollowers;
    } catch (error) {
      throw new Error(`Error fetching mutual followers: ${error.message}`);
    }
  }

  static async getSuggestedUsers(userId, limit = 10) {
    try {
      const user = await User.findById(userId).populate('following');
      if (!user) {
        throw new Error('User not found');
      }

      const followingIds = user.following.map(f => f._id.toString());
      followingIds.push(userId);

      // Get users followed by people I follow (friends of friends)
      const suggestedUsers = await User.aggregate([
        {
          $match: {
            _id: { $in: user.following.map(f => f._id) }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'following',
            foreignField: '_id',
            as: 'theirFollowing'
          }
        },
        {
          $unwind: '$theirFollowing'
        },
        {
          $match: {
            'theirFollowing._id': { $nin: followingIds.map(id => typeof id === 'string' ? id : id.toString()) }
          }
        },
        {
          $group: {
            _id: '$theirFollowing._id',
            user: { $first: '$theirFollowing' },
            mutualConnections: { $sum: 1 }
          }
        },
        {
          $sort: { mutualConnections: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            _id: '$user._id',
            username: '$user.username',
            displayName: '$user.displayName',
            avatar: '$user.avatar',
            verified: '$user.verified',
            bio: '$user.bio',
            mutualConnections: 1
          }
        }
      ]);

      return suggestedUsers;
    } catch (error) {
      throw new Error(`Error fetching suggested users: ${error.message}`);
    }
  }

  static async getPopularUsers(limit = 10) {
    try {
      const popularUsers = await User.aggregate([
        {
          $project: {
            username: 1,
            displayName: 1,
            avatar: 1,
            verified: 1,
            bio: 1,
            followerCount: { $size: '$followers' }
          }
        },
        {
          $sort: { followerCount: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return popularUsers;
    } catch (error) {
      throw new Error(`Error fetching popular users: ${error.message}`);
    }
  }

  static async getNetworkAnalytics(userId) {
    try {
      const user = await User.findById(userId).populate('following followers');
      if (!user) {
        throw new Error('User not found');
      }

      const analytics = {
        followersCount: user.followers.length,
        followingCount: user.following.length,
        ratio: user.followers.length / (user.following.length || 1),
        mutualFollowsCount: 0,
        recentFollowersCount: 0,
        recentFollowingCount: 0
      };

      // Calculate mutual follows
      const mutualFollows = user.followers.filter(follower =>
        user.following.some(following => 
          following._id.toString() === follower._id.toString()
        )
      );
      analytics.mutualFollowsCount = mutualFollows.length;

      // Calculate recent followers (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentFollowers = await User.find({
        _id: { $in: user.followers },
        createdAt: { $gte: sevenDaysAgo }
      });
      analytics.recentFollowersCount = recentFollowers.length;

      return analytics;
    } catch (error) {
      throw new Error(`Error fetching network analytics: ${error.message}`);
    }
  }

  static async removeFollower(userId, followerId) {
    try {
      const [user, follower] = await Promise.all([
        User.findById(userId),
        User.findById(followerId)
      ]);

      if (!user || !follower) {
        throw new Error('User not found');
      }

      // Remove from followers/following arrays
      user.followers.pull(followerId);
      follower.following.pull(userId);

      await Promise.all([user.save(), follower.save()]);

      return { message: 'Successfully removed follower' };
    } catch (error) {
      throw new Error(`Error removing follower: ${error.message}`);
    }
  }

  static async blockUser(userId, blockedUserId) {
    try {
      if (userId === blockedUserId) {
        throw new Error('Cannot block yourself');
      }

      const [user, blockedUser] = await Promise.all([
        User.findById(userId),
        User.findById(blockedUserId)
      ]);

      if (!user || !blockedUser) {
        throw new Error('User not found');
      }

      // Remove any existing follow relationships
      user.following.pull(blockedUserId);
      user.followers.pull(blockedUserId);
      blockedUser.following.pull(userId);
      blockedUser.followers.pull(userId);

      // Add to blocked list (you would need to add this field to User model)
      if (!user.blocked) {
        user.blocked = [];
      }
      if (!user.blocked.includes(blockedUserId)) {
        user.blocked.push(blockedUserId);
      }

      await Promise.all([user.save(), blockedUser.save()]);

      return { message: 'Successfully blocked user' };
    } catch (error) {
      throw new Error(`Error blocking user: ${error.message}`);
    }
  }
}

module.exports = SocialGraphService;
