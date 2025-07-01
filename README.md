# Twitter Clone - MERN Stack

A full-stack Twitter clone built with MongoDB, Express, React, and Node.js.

## Features

### Backend (Node.js + Express)
- ✅ User authentication (registration/login) with JWT
- ✅ User profile management
- ✅ Tweet creation, deletion, and retrieval
- ✅ Like/Unlike tweets
- ✅ Retweet functionality
- ✅ Reply to tweets
- ✅ Follow/Unfollow users
- ✅ User search
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ CORS enabled

### Frontend (React + TypeScript)
- ✅ User authentication UI
- ✅ Responsive design
- ✅ Authentication context for state management
- ✅ Protected routes
- ✅ Modern React with TypeScript
- 🚧 Tweet composition and display (placeholder)
- 🚧 User profiles (placeholder)
- 🚧 Timeline feed (placeholder)

## Project Structure

```
twitter-clone/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Tweet.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tweets.js
│   │   └── users.js
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Home/
│   │   │   ├── Profile/
│   │   │   └── Layout/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/twitter-clone
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Make sure MongoDB is running on your system

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

   The app will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tweets
- `GET /api/tweets` - Get all tweets
- `POST /api/tweets` - Create a new tweet
- `GET /api/tweets/:id` - Get specific tweet
- `POST /api/tweets/:id/like` - Like/unlike a tweet
- `POST /api/tweets/:id/retweet` - Retweet
- `POST /api/tweets/:id/reply` - Reply to a tweet
- `DELETE /api/tweets/:id` - Delete a tweet

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/:username/follow` - Follow/unfollow user
- `GET /api/users/:username/followers` - Get user followers
- `GET /api/users/:username/following` - Get users following
- `GET /api/users/search/:query` - Search users

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- CORS for cross-origin requests

### Frontend
- React 18
- TypeScript
- React Router DOM
- Axios for API calls
- Context API for state management
- CSS3 for styling

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/twitter-clone
JWT_SECRET=your_very_secure_jwt_secret_key
NODE_ENV=development
```

## Next Steps

To complete the Twitter clone, you would need to implement:

1. **Frontend Tweet Components**: Tweet composition, display, and interaction
2. **Real-time Updates**: Socket.io for live updates
3. **Image Upload**: Multer setup for tweet images
4. **Advanced Features**: Hashtag trending, notifications, DMs
5. **Testing**: Unit and integration tests
6. **Deployment**: Docker, CI/CD, cloud deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
