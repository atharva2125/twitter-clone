import React from 'react';
import { useParams } from 'react-router-dom';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <div style={containerStyle}>
      <h1>Profile: @{username}</h1>
      <p>This is the profile page for user {username}.</p>
      <p>Features to be implemented:</p>
      <ul>
        <li>User profile information</li>
        <li>User's tweets</li>
        <li>Follow/Unfollow functionality</li>
        <li>Profile editing</li>
      </ul>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '2rem auto',
  padding: '2rem',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

export default Profile;
