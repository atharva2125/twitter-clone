const express = require('express');
const Tweet = require('../models/Tweet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

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

// Create a new tweet
router.post('/', auth, [
  body('content').isLength({ min: 1, max: 280 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    // Extract hashtags and mentions from content
    const hashtags = content.match(/#\w+/g)?.map(tag => tag.substring(1).toLowerCase()) || [];
    const mentionUsernames = content.match(/@\w+/g)?.map(mention => mention.substring(1)) || [];
    
    // Find mentioned users
    const mentions = [];
    if (mentionUsernames.length > 0) {
      const mentionedUsers = await User.find({ username: { $in: mentionUsernames } });
      mentions.push(...mentionedUsers.map(user => user._id));
    }

    const tweet = new Tweet({
      content,
      author: req.user._id,
      hashtags,
      mentions
    });

    await tweet.save();
    await tweet.populate('author', 'username displayName avatar verified');

    res.status(201).json({
      message: 'Tweet created successfully',
      tweet
    });
  } catch (error) {
    console.error('Create tweet error:', error);
    res.status(500).json({ message: 'Server error creating tweet' });
  }
});

// Get all tweets (timeline)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tweets = await Tweet.find({ isReply: false })
      .populate('author', 'username displayName avatar verified')
      .populate('likes', 'username displayName')
      .populate('retweets.user', 'username displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ tweets, page, limit });
  } catch (error) {
    console.error('Get tweets error:', error);
    res.status(500).json({ message: 'Server error fetching tweets' });
  }
});

// Get a specific tweet
router.get('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
      .populate('author', 'username displayName avatar verified')
      .populate('likes', 'username displayName')
      .populate('retweets.user', 'username displayName')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username displayName avatar verified'
        }
      });

    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    res.json({ tweet });
  } catch (error) {
    console.error('Get tweet error:', error);
    res.status(500).json({ message: 'Server error fetching tweet' });
  }
});

// Like/Unlike a tweet
router.post('/:id/like', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const isLiked = tweet.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      tweet.likes.pull(req.user._id);
    } else {
      // Like
      tweet.likes.push(req.user._id);
    }

    await tweet.save();
    await tweet.populate('author', 'username displayName avatar verified');

    res.json({
      message: isLiked ? 'Tweet unliked' : 'Tweet liked',
      tweet,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Like tweet error:', error);
    res.status(500).json({ message: 'Server error liking tweet' });
  }
});

// Retweet
router.post('/:id/retweet', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const hasRetweeted = tweet.retweets.some(rt => rt.user.toString() === req.user._id.toString());

    if (hasRetweeted) {
      // Remove retweet
      tweet.retweets = tweet.retweets.filter(rt => rt.user.toString() !== req.user._id.toString());
    } else {
      // Add retweet
      tweet.retweets.push({ user: req.user._id });
    }

    await tweet.save();
    await tweet.populate('author', 'username displayName avatar verified');

    res.json({
      message: hasRetweeted ? 'Retweet removed' : 'Tweet retweeted',
      tweet,
      hasRetweeted: !hasRetweeted
    });
  } catch (error) {
    console.error('Retweet error:', error);
    res.status(500).json({ message: 'Server error retweeting' });
  }
});

// Reply to a tweet
router.post('/:id/reply', auth, [
  body('content').isLength({ min: 1, max: 280 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const originalTweet = await Tweet.findById(req.params.id);
    
    if (!originalTweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    const { content } = req.body;

    // Extract hashtags and mentions from content
    const hashtags = content.match(/#\w+/g)?.map(tag => tag.substring(1).toLowerCase()) || [];
    const mentionUsernames = content.match(/@\w+/g)?.map(mention => mention.substring(1)) || [];
    
    // Find mentioned users
    const mentions = [];
    if (mentionUsernames.length > 0) {
      const mentionedUsers = await User.find({ username: { $in: mentionUsernames } });
      mentions.push(...mentionedUsers.map(user => user._id));
    }

    const reply = new Tweet({
      content,
      author: req.user._id,
      hashtags,
      mentions,
      isReply: true,
      replyTo: req.params.id
    });

    await reply.save();
    await reply.populate('author', 'username displayName avatar verified');

    // Add reply to original tweet
    originalTweet.replies.push(reply._id);
    await originalTweet.save();

    res.status(201).json({
      message: 'Reply created successfully',
      tweet: reply
    });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ message: 'Server error creating reply' });
  }
});

// Delete a tweet
router.delete('/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }

    // Check if user owns the tweet
    if (tweet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this tweet' });
    }

    await Tweet.findByIdAndDelete(req.params.id);

    res.json({ message: 'Tweet deleted successfully' });
  } catch (error) {
    console.error('Delete tweet error:', error);
    res.status(500).json({ message: 'Server error deleting tweet' });
  }
});

module.exports = router;
