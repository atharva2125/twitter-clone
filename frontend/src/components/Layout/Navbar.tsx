import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTwitter, FaHome, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-screen w-20 md:w-64 bg-black border-r border-gray-800 flex flex-col items-center py-6 fixed">
      <Link to="/" className="mb-8 text-blue-500 text-3xl hover:text-blue-400 transition-colors">
        <FaTwitter />
      </Link>
      <div className="flex flex-col gap-6 flex-1 w-full items-center md:items-start">
        <Link to="/" className="flex items-center gap-4 text-lg font-semibold text-white hover:bg-gray-900 px-4 py-2 rounded-full transition">
          <FaHome className="text-xl" />
          <span className="hidden md:inline">Home</span>
        </Link>
        {user && (
          <Link to={`/profile/${user.username}`} className="flex items-center gap-4 text-lg font-semibold text-white hover:bg-gray-900 px-4 py-2 rounded-full transition">
            <FaUser className="text-xl" />
            <span className="hidden md:inline">Profile</span>
          </Link>
        )}
        <button onClick={handleLogout} className="flex items-center gap-4 text-lg font-semibold text-white hover:bg-gray-900 px-4 py-2 rounded-full transition">
          <FaSignOutAlt className="text-xl" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
      {user && (
        <div className="mt-auto flex flex-col items-center md:items-start w-full px-4">
          <div className="flex items-center gap-3">
            <img src={user.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
            <div className="hidden md:block">
              <div className="font-bold text-white">{user.displayName}</div>
              <div className="text-gray-400 text-sm">@{user.username}</div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
