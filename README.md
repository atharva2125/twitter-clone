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

## Deployment on Render

### Prerequisites for Deployment
1. GitHub account
2. Render account (free tier available)
3. MongoDB Atlas account (for cloud database)

### Steps to Deploy

#### 1. Set up MongoDB Atlas
1. Create a free MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Get your connection string (replace `<password>` with your actual password)
4. Whitelist IP address `0.0.0.0/0` for Render deployment

#### 2. Push to GitHub
```bash
# Your code is already committed locally
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/twitter-clone.git
git branch -M main
git push -u origin main
```

#### 3. Deploy Backend on Render
1. Go to https://render.com and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `twitter-clone-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Add Environment Variables**:
     - `NODE_ENV`: `production`
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string (32+ characters)
     - `PORT`: `10000` (Render default)

#### 4. Deploy Frontend on Render
1. Create another "Web Service"
2. Configure:
   - **Name**: `twitter-clone-frontend`
   - **Environment**: `Static Site`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Add Environment Variables**:
     - `REACT_APP_API_URL`: `https://your-backend-service.onrender.com/api`

#### 5. Update CORS Settings
After deployment, update the CORS configuration in `backend/server.js`:
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-service.onrender.com']
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Important Notes
- Free tier services on Render may "spin down" after inactivity
- First request after inactivity may take 30+ seconds
- For production apps, consider upgrading to paid plans
- The backend `.env` file is not committed to Git for security

## License

This project is licensed under the ISC License.
