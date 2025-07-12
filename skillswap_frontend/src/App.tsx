import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProfilePage from './pages/ProfilePage';
import SkillList from './pages/SkillList';
import SkillForm from './pages/SkillForm';
import SwapList from './pages/SwapList';
import ChatList from './pages/ChatList';
import Navigation from './components/Navigation';
import './App.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleLogin = (token: string, user: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user);
    setIsAuthenticated(true);
    setUsername(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main style={{ padding: '20px 0' }}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/skills" element={<SkillList />} />
            <Route path="/skills/add" element={<SkillForm />} />
            <Route path="/swaps" element={<SwapList />} />
            <Route path="/chats" element={<ChatList />} />
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App; 