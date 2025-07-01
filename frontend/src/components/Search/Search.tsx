import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { User } from '../../types';
import './Search.css';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query.trim());
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const searchUsers = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await userService.searchUsers(searchQuery);
      setUsers(response.users);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Search</h1>
      </div>

      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search for users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && (
        <div className="loading-message">Searching...</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {users.length > 0 && (
        <div className="search-results">
          <h2>Users</h2>
          <div className="user-list">
            {users.map(user => (
              <Link key={user.id} to={`/profile/${user.username}`} className="user-card">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.displayName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.displayName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    <span className="display-name">
                      {user.displayName}
                      {user.verified && <span className="verified">✓</span>}
                    </span>
                    <span className="username">@{user.username}</span>
                  </div>
                  {user.bio && (
                    <p className="user-bio">{user.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {query && !loading && users.length === 0 && !error && (
        <div className="no-results">
          <h3>No users found</h3>
          <p>Try searching for something else.</p>
        </div>
      )}

      {!query && (
        <div className="search-placeholder">
          <h3>Search for people</h3>
          <p>Enter a username or display name to find users to follow.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
