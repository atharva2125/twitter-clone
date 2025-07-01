import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import TweetCard from '../Tweet/TweetCard';
import { User, Tweet } from '../../types';
import './Profile.css';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      const response = await userService.getUserProfile(username);
      setProfileUser(response.user);
      setTweets(response.tweets);
      setFollowersCount(response.user.followersCount || 0);
      
      // Check if current user is following this profile
      if (currentUser && response.user.followers) {
        setIsFollowing(response.user.followers.some((follower: User) => follower.id === currentUser.id));
      }
      
      // Set edit form with current data
      setEditForm({
        displayName: response.user.displayName,
        bio: response.user.bio || '',
        avatar: response.user.avatar || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!username || !currentUser) return;
    
    try {
      const response = await userService.followUser(username);
      setIsFollowing(response.isFollowing);
      setFollowersCount(response.followersCount);
    } catch (err: any) {
      console.error('Error following user:', err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await userService.updateProfile(editForm);
      setProfileUser(response.user);
      setIsEditing(false);
      
      // Update current user context if editing own profile
      if (currentUser?.id === profileUser?.id) {
        // You might want to update the auth context here
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
    }
  };

  const handleTweetUpdate = (updatedTweet: Tweet) => {
    setTweets(prev => 
      prev.map(tweet => 
        tweet._id === updatedTweet._id ? updatedTweet : tweet
      )
    );
  };

  const handleTweetDelete = (tweetId: string) => {
    setTweets(prev => prev.filter(tweet => tweet._id !== tweetId));
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-message">Loading profile...</div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="profile-container">
        <div className="error-message">
          {error || 'Profile not found'}
          <button onClick={loadProfile} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const joinDate = new Date(profileUser.createdAt || '').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-avatar">
            {profileUser.avatar ? (
              <img src={profileUser.avatar} alt={profileUser.displayName} />
            ) : (
              <div className="avatar-placeholder">
                {profileUser.displayName?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-info">
          <div className="profile-actions">
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-profile-button"
              >
                Edit Profile
              </button>
            ) : (
              <button 
                onClick={handleFollow} 
                className={`follow-button ${isFollowing ? 'following' : ''}`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          
          <div className="profile-details">
            <h1 className="display-name">
              {profileUser.displayName}
              {profileUser.verified && <span className="verified">✓</span>}
            </h1>
            <p className="username">@{profileUser.username}</p>
            
            {profileUser.bio && (
              <p className="bio">{profileUser.bio}</p>
            )}
            
            <div className="profile-meta">
              <span className="join-date">📅 Joined {joinDate}</span>
            </div>
            
            <div className="profile-stats">
              <span className="stat">
                <strong>{profileUser.followingCount || 0}</strong> Following
              </span>
              <span className="stat">
                <strong>{followersCount}</strong> Followers
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="close-button">
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                  maxLength={50}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  maxLength={160}
                  rows={3}
                  placeholder="Tell the world about yourself"
                />
              </div>
              
              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  type="url"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="profile-tweets">
        <div className="tweets-header">
          <h2>Tweets</h2>
          <span className="tweet-count">{tweets.length}</span>
        </div>
        
        {tweets.length === 0 ? (
          <div className="no-tweets">
            <h3>{isOwnProfile ? "You haven't tweeted yet" : `@${username} hasn't tweeted yet`}</h3>
            <p>When {isOwnProfile ? 'you' : 'they'} do, those tweets will show up here.</p>
          </div>
        ) : (
          <div className="tweets-list">
            {tweets.map(tweet => (
              <TweetCard
                key={tweet._id}
                tweet={tweet}
                onTweetUpdate={handleTweetUpdate}
                onTweetDelete={handleTweetDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
