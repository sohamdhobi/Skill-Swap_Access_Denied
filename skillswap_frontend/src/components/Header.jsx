import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, Home, Users, ArrowLeftRight, Shield } from 'lucide-react';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              SkillSwap
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            SkillSwap
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Home size={20} />
              Dashboard
            </Link>
            <Link 
              to="/browse" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/browse') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Users size={20} />
              Browse Users
            </Link>
            <Link 
              to="/swaps" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/swaps') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <ArrowLeftRight size={20} />
              Swap Requests
            </Link>
            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/admin') 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Shield size={20} />
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <User size={20} className="text-gray-600" />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.name}
                </span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} />
                  Profile Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;