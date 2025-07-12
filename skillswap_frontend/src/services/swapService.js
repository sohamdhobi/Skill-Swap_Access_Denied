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