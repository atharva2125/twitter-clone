const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadTweetImage, uploadProfileImage } = require('../config/cloudinary');

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

// Upload tweet image
router.post('/tweet-image', auth, uploadTweetImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Tweet image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload profile image
router.post('/profile-image', auth, uploadProfileImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Update user's avatar in database
    await User.findByIdAndUpdate(req.user._id, {
      avatar: req.file.path
    });

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
});

// Upload multiple tweet images
router.post('/tweet-images', auth, uploadTweetImage.array('images', 4), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.json({
      message: 'Images uploaded successfully',
      images
    });
  } catch (error) {
    console.error('Multiple tweet images upload error:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

module.exports = router;
