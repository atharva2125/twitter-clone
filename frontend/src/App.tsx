import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import Profile from './components/Profile/Profile';
import Search from './components/Search/Search';
import Navbar from './components/Layout/Navbar';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-black min-h-screen text-white">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <div className="bg-black min-h-screen">
                  <Login />
                </div>
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <div className="bg-black min-h-screen">
                  <Register />
                </div>
              </PublicRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <div className="min-h-screen bg-black flex flex-col">
                  <Navbar />
                  <Home />
                </div>
              </PrivateRoute>
            } />
            <Route path="/profile/:username" element={
              <PrivateRoute>
                <div className="min-h-screen bg-black flex flex-col">
                  <Navbar />
                  <Profile />
                </div>
              </PrivateRoute>
            } />
            <Route path="/search" element={
              <PrivateRoute>
                <div className="min-h-screen bg-black flex flex-col">
                  <Navbar />
                  <Search />
                </div>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
