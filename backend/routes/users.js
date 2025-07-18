const express = require('express');
const User = require('../models/User');
const Tweet = require('../models/Tweet');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const SocialGraphService = require('../services/SocialGraphService');
const FeedService = require('../services/FeedService');
const SearchService = require('../services/SearchService');

const router = express.Router();

// Middleware to authenticate user
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's tweets
    const tweets = await Tweet.find({ author: user._id, isReply: false })
      .populate('author', 'username displayName avatar verified')
      .populate('likes', 'username displayName')
      .populate('retweets.user', 'username displayName')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        verified: user.verified,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt
      },
      tweets
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('displayName').optional().isLength({ min: 1, max: 50 }).trim(),
  body('bio').optional().isLength({ max: 160 }).trim(),
  body('avatar').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName, bio, avatar } = req.body;
    const updateFields = {};
    
    if (displayName) updateFields.displayName = displayName;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Follow/Unfollow user
router.post('/:username/follow', auth, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = req.user.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      req.user.following.pull(targetUser._id);
      targetUser.followers.pull(req.user._id);
    } else {
      // Follow
      req.user.following.push(targetUser._id);
      targetUser.followers.push(req.user._id);
    }

    await req.user.save();
    await targetUser.save();

    res.json({
      message: isFollowing ? 'User unfollowed' : 'User followed',
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ message: 'Server error following/unfollowing user' });
  }
});

// Get user's followers
router.get('/:username/followers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username })
      .populate({
        path: 'followers',
        select: 'username displayName avatar bio verified',
        options: { skip, limit }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      followers: user.followers,
      totalCount: user.followers.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error fetching followers' });
  }
});

// Get user's following
router.get('/:username/following', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username })
      .populate({
        path: 'following',
        select: 'username displayName avatar bio verified',
        options: { skip, limit }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      following: user.following,
      totalCount: user.following.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error fetching following' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const users = await SearchService.searchUsers(query, page, limit);
    res.json({ users, query, page, limit });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: error.message || 'Server error searching users' });
  }
});

// Get suggested users to follow
router.get('/suggestions/follow', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const suggestions = await SocialGraphService.getSuggestedUsers(req.user._id, limit);
    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching suggested users' });
  }
});

// Get popular users
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await SocialGraphService.getPopularUsers(limit);
    res.json({ users });
  } catch (error) {
    console.error('Get popular users error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching popular users' });
  }
});

// Get user's liked tweets
router.get('/:username/likes', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const tweets = await FeedService.getLikedTweets(user._id, page, limit);
    res.json({ tweets, page, limit });
  } catch (error) {
    console.error('Get liked tweets error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching liked tweets' });
  }
});

// Get user's media tweets
router.get('/:username/media', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const tweets = await FeedService.getMediaTweets(user._id, page, limit);
    res.json({ tweets, page, limit });
  } catch (error) {
    console.error('Get media tweets error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching media tweets' });
  }
});

// Get user's network analytics
router.get('/:username/analytics', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to see their own analytics
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analytics = await SocialGraphService.getNetworkAnalytics(user._id);
    res.json({ analytics });
  } catch (error) {
    console.error('Get network analytics error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching network analytics' });
  }
});

module.exports = router;
