import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('skillSwapUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login - replace with actual API call
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: email,
      role: email === 'admin@skillswap.com' ? 'admin' : 'user',
      location: 'New York, NY',
      isPublic: true,
      skillsOffered: ['JavaScript', 'React', 'Node.js'],
      skillsWanted: ['Python', 'Machine Learning'],
      availability: ['weekends', 'evenings'],
      rating: 4.8,
      completedSwaps: 12
    };
    
    setUser(mockUser);
    localStorage.setItem('skillSwapUser', JSON.stringify(mockUser));
    return Promise.resolve(mockUser);
  };

  const register = (userData) => {
    // Mock registration - replace with actual API call
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'user',
      skillsOffered: [],
      skillsWanted: [],
      availability: [],
      rating: 0,
      completedSwaps: 0,
      isPublic: true
    };
    
    setUser(newUser);
    localStorage.setItem('skillSwapUser', JSON.stringify(newUser));
    return Promise.resolve(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillSwapUser');
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('skillSwapUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}