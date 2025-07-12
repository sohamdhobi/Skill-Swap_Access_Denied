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