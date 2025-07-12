# Backend Integration Guide for Skill Swap Platform

## Overview
This guide provides detailed instructions for connecting the React frontend to a Django backend API. It covers all necessary changes, configurations, and best practices.

## Table of Contents
1. [Environment Configuration](#environment-configuration)
2. [API Service Layer](#api-service-layer)
3. [Authentication Updates](#authentication-updates)
4. [Context Updates](#context-updates)
5. [Component Updates](#component-updates)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Backend API Endpoints](#backend-api-endpoints)
9. [Deployment Considerations](#deployment-considerations)

## 1. Environment Configuration

### Create Environment Variables File
Create a `.env` file in your project root:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000

# Environment
REACT_APP_ENVIRONMENT=development

# Optional: API Keys (if needed)
REACT_APP_API_KEY=your_api_key_here
```

### Update Package Dependencies
Add these packages to handle API calls and data management:

```bash
npm install axios react-query @tanstack/react-query
```

## 2. API Service Layer

### Create API Configuration (`src/services/api.js`)
```javascript
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('skillSwapUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Create API Services (`src/services/`)

#### Authentication Service (`src/services/authService.js`)
```javascript
import api from './api';

export const authService = {
  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/user/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh/', { refresh: refreshToken });
    return response.data;
  },
};
```

#### User Service (`src/services/userService.js`)
```javascript
import api from './api';

export const userService = {
  // Get user profile
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    const response = await api.put(`/users/${userId}/`, profileData);
    return response.data;
  },

  // Get all users (with filters)
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/users/?${params}`);
    return response.data;
  },

  // Search users by skills
  searchUsers: async (searchTerm, filters = {}) => {
    const params = new URLSearchParams({ search: searchTerm, ...filters });
    const response = await api.get(`/users/search/?${params}`);
    return response.data;
  },

  // Upload profile photo
  uploadProfilePhoto: async (userId, photoFile) => {
    const formData = new FormData();
    formData.append('profile_photo', photoFile);
    const response = await api.post(`/users/${userId}/upload-photo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
```

#### Swap Service (`src/services/swapService.js`)
```javascript
import api from './api';

export const swapService = {
  // Get swap requests (received, sent, active, completed)
  getSwapRequests: async (type = 'all') => {
    const response = await api.get(`/swaps/?type=${type}`);
    return response.data;
  },

  // Create swap request
  createSwapRequest: async (requestData) => {
    const response = await api.post('/swaps/', requestData);
    return response.data;
  },

  // Accept swap request
  acceptSwapRequest: async (requestId) => {
    const response = await api.post(`/swaps/${requestId}/accept/`);
    return response.data;
  },

  // Reject swap request
  rejectSwapRequest: async (requestId) => {
    const response = await api.post(`/swaps/${requestId}/reject/`);
    return response.data;
  },

  // Delete swap request
  deleteSwapRequest: async (requestId) => {
    const response = await api.delete(`/swaps/${requestId}/`);
    return response.data;
  },

  // Complete swap
  completeSwap: async (requestId) => {
    const response = await api.post(`/swaps/${requestId}/complete/`);
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (swapId, feedbackData) => {
    const response = await api.post(`/swaps/${swapId}/feedback/`, feedbackData);
    return response.data;
  },
};
```

#### Skills Service (`src/services/skillsService.js`)
```javascript
import api from './api';

export const skillsService = {
  // Get all skills
  getAllSkills: async () => {
    const response = await api.get('/skills/');
    return response.data;
  },

  // Get skill categories
  getSkillCategories: async () => {
    const response = await api.get('/skills/categories/');
    return response.data;
  },

  // Add new skill
  addSkill: async (skillData) => {
    const response = await api.post('/skills/', skillData);
    return response.data;
  },

  // Update user skills
  updateUserSkills: async (userId, skillsData) => {
    const response = await api.put(`/users/${userId}/skills/`, skillsData);
    return response.data;
  },
};
```

## 3. Authentication Updates

### Update AuthContext (`src/contexts/AuthContext.jsx`)
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('skillSwapUser');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.login(email, password);
      
      // Store token and user data
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('skillSwapUser', JSON.stringify(response.user));
      
      setUser(response.user);
      return response.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.register(userData);
      
      // Auto-login after registration
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('skillSwapUser', JSON.stringify(response.user));
      
      setUser(response.user);
      return response.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('skillSwapUser');
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = await userService.updateProfile(user.id, updates);
      setUser(updatedUser);
      localStorage.setItem('skillSwapUser', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 4. Component Updates

### Update Login Page (`src/pages/LoginPage.jsx`)
```javascript
// Add these imports
import { authService } from '../services/authService';

// Update handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await login(email, password);
    navigate('/dashboard');
  } catch (err) {
    setError(err.message || 'Invalid email or password');
  } finally {
    setLoading(false);
  }
};
```

### Update Browse Users Page (`src/pages/BrowseUsers.jsx`)
```javascript
// Add these imports
import { userService } from '../services/userService';
import { useQuery } from '@tanstack/react-query';

// Replace useEffect with React Query
const {
  data: users = [],
  isLoading,
  error,
  refetch
} = useQuery({
  queryKey: ['users', searchTerm, selectedSkill, selectedLocation],
  queryFn: () => userService.getUsers({
    search: searchTerm,
    skill: selectedSkill,
    location: selectedLocation,
  }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Update Swap Requests Page (`src/pages/SwapRequests.jsx`)
```javascript
// Add these imports
import { swapService } from '../services/swapService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Replace useState with React Query
const queryClient = useQueryClient();

const {
  data: requests = { received: [], sent: [], active: [], completed: [] },
  isLoading,
  error
} = useQuery({
  queryKey: ['swapRequests'],
  queryFn: swapService.getSwapRequests,
});

// Add mutations for actions
const acceptMutation = useMutation({
  mutationFn: swapService.acceptSwapRequest,
  onSuccess: () => {
    queryClient.invalidateQueries(['swapRequests']);
  },
});

const rejectMutation = useMutation({
  mutationFn: swapService.rejectSwapRequest,
  onSuccess: () => {
    queryClient.invalidateQueries(['swapRequests']);
  },
});
```

## 5. Error Handling

### Create Error Boundary (`src/components/ErrorBoundary.jsx`)
```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Create Error Toast Component (`src/components/ErrorToast.jsx`)
```javascript
import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

function ErrorToast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
        <div className="flex items-start">
          <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-red-800">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 ml-2"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorToast;
```

## 6. Loading States

### Create Loading Components (`src/components/LoadingSpinner.jsx`)
```javascript
import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );
}
```

## 7. Backend API Endpoints

### Expected Django API Endpoints

#### Authentication Endpoints
```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/refresh/
GET  /api/auth/user/
```

#### User Endpoints
```
GET    /api/users/
GET    /api/users/{id}/
PUT    /api/users/{id}/
DELETE /api/users/{id}/
GET    /api/users/search/
POST   /api/users/{id}/upload-photo/
PUT    /api/users/{id}/skills/
```

#### Swap Endpoints
```
GET    /api/swaps/
POST   /api/swaps/
GET    /api/swaps/{id}/
PUT    /api/swaps/{id}/
DELETE /api/swaps/{id}/
POST   /api/swaps/{id}/accept/
POST   /api/swaps/{id}/reject/
POST   /api/swaps/{id}/complete/
POST   /api/swaps/{id}/feedback/
```

#### Skills Endpoints
```
GET    /api/skills/
POST   /api/skills/
GET    /api/skills/categories/
```

#### Admin Endpoints
```
GET    /api/admin/users/
PUT    /api/admin/users/{id}/ban/
GET    /api/admin/reports/
POST   /api/admin/reports/{id}/resolve/
GET    /api/admin/stats/
```

### Expected Request/Response Formats

#### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "location": "New York, NY",
    "is_public": true,
    "skills_offered": ["JavaScript", "React"],
    "skills_wanted": ["Python", "Django"],
    "availability": ["weekends", "evenings"],
    "rating": 4.8,
    "completed_swaps": 12,
    "profile_photo": "http://localhost:8000/media/profiles/user1.jpg"
  }
}
```

#### Swap Request
```json
{
  "target_user_id": 2,
  "offered_skill": "JavaScript",
  "wanted_skill": "Python",
  "message": "Hi! I'd love to swap skills with you."
}
```

## 8. Setup Instructions

### 1. Install Dependencies
```bash
npm install axios @tanstack/react-query
```

### 2. Update Main App (`src/main.jsx`)
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
```

### 3. Environment Setup
Create `.env` file with your backend URL:
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 4. CORS Configuration
Ensure your Django backend has CORS configured to allow requests from your frontend domain.

## 9. Testing API Integration

### Create API Test Utility (`src/utils/apiTest.js`)
```javascript
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const testApiConnection = async () => {
  try {
    // Test basic connectivity
    const response = await fetch(process.env.REACT_APP_API_BASE_URL + '/health/');
    if (response.ok) {
      console.log('✅ API connection successful');
      return true;
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

export const testAuthFlow = async () => {
  try {
    // Test registration
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpass123',
    };
    
    const registerResponse = await authService.register(testUser);
    console.log('✅ Registration test passed');
    
    // Test login
    const loginResponse = await authService.login(testUser.email, testUser.password);
    console.log('✅ Login test passed');
    
    return true;
  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
    return false;
  }
};
```

## 10. Deployment Considerations

### Environment Variables for Production
```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
REACT_APP_BACKEND_URL=https://your-backend-domain.com
REACT_APP_ENVIRONMENT=production
```

### Build Configuration
Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:staging": "REACT_APP_ENVIRONMENT=staging vite build",
    "build:production": "REACT_APP_ENVIRONMENT=production vite build"
  }
}
```

## Summary

This integration guide provides:

1. **Complete API service layer** with proper error handling and authentication
2. **Updated authentication context** with real API calls
3. **React Query integration** for efficient data fetching and caching
4. **Comprehensive error handling** with user-friendly error messages
5. **Loading states** for better user experience
6. **Expected backend API structure** for Django implementation
7. **Testing utilities** to verify API integration
8. **Production deployment considerations**

Follow these steps to successfully connect your React frontend to your Django backend API. Make sure to test each component thoroughly and handle edge cases appropriately.