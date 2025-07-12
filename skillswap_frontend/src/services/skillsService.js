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