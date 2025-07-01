import React from 'react';

const Home: React.FC = () => {
  return (
    <div style={containerStyle}>
      <h1>Welcome to Twitter Clone</h1>
      <p>This is the home page where tweets will be displayed.</p>
      <p>Features to be implemented:</p>
      <ul>
        <li>Tweet composition</li>
        <li>Tweet timeline</li>
        <li>Like/Retweet functionality</li>
        <li>Real-time updates</li>
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

export default Home;
