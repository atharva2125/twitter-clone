import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <Link to="/" style={logoStyle}>
          Twitter Clone
        </Link>
        
        <div style={navLinksStyle}>
          <Link to="/" style={linkStyle}>
            Home
          </Link>
          {user && (
            <Link to={`/profile/${user.username}`} style={linkStyle}>
              Profile
            </Link>
          )}
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const navStyle: React.CSSProperties = {
  background: '#1da1f2',
  padding: '1rem 0',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
};

const navContainerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 2rem',
};

const logoStyle: React.CSSProperties = {
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  textDecoration: 'none',
};

const navLinksStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '2rem',
};

const linkStyle: React.CSSProperties = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1rem',
};

const logoutButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid white',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default Navbar;
