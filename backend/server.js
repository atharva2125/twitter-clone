const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const tweetRoutes = require('./routes/tweets');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://twitter-clone-frontend.onrender.com', 'https://your-frontend-domain.onrender.com']
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions
});

// Make io available to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle real-time tweet notifications
  socket.on('new-tweet', (tweetData) => {
    socket.broadcast.emit('tweet-created', tweetData);
  });

  // Handle real-time like notifications
  socket.on('tweet-liked', (data) => {
    io.to(`user-${data.tweetAuthorId}`).emit('notification', {
      type: 'like',
      message: `${data.likerName} liked your tweet`,
      tweetId: data.tweetId
    });
  });

  // Handle real-time follow notifications
  socket.on('user-followed', (data) => {
    io.to(`user-${data.followedUserId}`).emit('notification', {
      type: 'follow',
      message: `${data.followerName} started following you`,
      userId: data.followerId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tweets', (req, res, next) => {
  req.io = io;
  next();
}, tweetRoutes);
app.use('/api/users', (req, res, next) => {
  req.io = io;
  next();
}, userRoutes);
app.use('/api/upload', uploadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Twitter Clone API is running!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});
