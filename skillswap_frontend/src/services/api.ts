import axios from 'axios';
import { 
  UserProfile, 
  Skill, 
  SwapRequest, 
  AuthResponse, 
  LoginForm, 
  RegisterForm, 
  SkillForm, 
  SwapRequestForm,
  Chat,
  Message,
  MessageForm,
  Meeting,
  MeetingForm
} from '../types';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData: RegisterForm): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Profiles API
export const profilesAPI = {
  getProfiles: async (): Promise<UserProfile[]> => {
    const response = await api.get('/profiles/');
    return response.data.results || response.data;
  },

  getProfile: async (id: number): Promise<UserProfile> => {
    const response = await api.get(`/profiles/${id}/`);
    return response.data;
  },

  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/profiles/me/');
    return response.data;
  },

  updateProfile: async (id: number, data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put(`/profiles/${id}/`, data);
    return response.data;
  },
};

// Skills API
export const skillsAPI = {
  getSkills: async (params?: {
    name?: string;
    owner?: string;
    offered?: boolean;
  }): Promise<Skill[]> => {
    const response = await api.get('/skills/', { params });
    return response.data.results || response.data;
  },

  getSkill: async (id: number): Promise<Skill> => {
    const response = await api.get(`/skills/${id}/`);
    return response.data;
  },

  createSkill: async (skillData: SkillForm): Promise<Skill> => {
    const response = await api.post('/skills/', skillData);
    return response.data;
  },

  updateSkill: async (id: number, skillData: Partial<SkillForm>): Promise<Skill> => {
    const response = await api.put(`/skills/${id}/`, skillData);
    return response.data;
  },

  deleteSkill: async (id: number): Promise<void> => {
    await api.delete(`/skills/${id}/`);
  },
};

// Swap Requests API
export const swapsAPI = {
  getSwaps: async (): Promise<SwapRequest[]> => {
    const response = await api.get('/swaps/');
    return response.data.results || response.data;
  },

  getSwap: async (id: number): Promise<SwapRequest> => {
    const response = await api.get(`/swaps/${id}/`);
    return response.data;
  },

  createSwap: async (swapData: SwapRequestForm): Promise<SwapRequest> => {
    const response = await api.post('/swaps/', swapData);
    return response.data;
  },

  updateSwap: async (id: number, swapData: Partial<SwapRequestForm>): Promise<SwapRequest> => {
    const response = await api.put(`/swaps/${id}/`, swapData);
    return response.data;
  },

  deleteSwap: async (id: number): Promise<void> => {
    await api.delete(`/swaps/${id}/`);
  },

  acceptSwap: async (id: number): Promise<{ status: string }> => {
    const response = await api.post(`/swaps/${id}/accept/`);
    return response.data;
  },

  rejectSwap: async (id: number): Promise<{ status: string }> => {
    const response = await api.post(`/swaps/${id}/reject/`);
    return response.data;
  },

  cancelSwap: async (id: number): Promise<{ status: string }> => {
    const response = await api.post(`/swaps/${id}/cancel/`);
    return response.data;
  },
};

// Chats API
export const chatsAPI = {
  getChats: async (): Promise<Chat[]> => {
    const response = await api.get('/chats/');
    return response.data.results || response.data;
  },

  getChat: async (id: number): Promise<Chat> => {
    const response = await api.get(`/chats/${id}/`);
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  getMessages: async (chatId: number): Promise<Message[]> => {
    const response = await api.get('/messages/', { params: { chat_id: chatId } });
    return response.data.results || response.data;
  },

  getMessage: async (id: number): Promise<Message> => {
    const response = await api.get(`/messages/${id}/`);
    return response.data;
  },

  createMessage: async (messageData: MessageForm): Promise<Message> => {
    const response = await api.post('/messages/', messageData);
    return response.data;
  },

  updateMessage: async (id: number, messageData: Partial<MessageForm>): Promise<Message> => {
    const response = await api.put(`/messages/${id}/`, messageData);
    return response.data;
  },

  deleteMessage: async (id: number): Promise<void> => {
    await api.delete(`/messages/${id}/`);
  },
};

// Meetings API
export const meetingsAPI = {
  getMeetings: async (): Promise<Meeting[]> => {
    const response = await api.get('/meetings/');
    return response.data.results || response.data;
  },

  getMeeting: async (id: number): Promise<Meeting> => {
    const response = await api.get(`/meetings/${id}/`);
    return response.data;
  },

  createMeeting: async (meetingData: MeetingForm): Promise<Meeting> => {
    const response = await api.post('/meetings/', meetingData);
    return response.data;
  },

  updateMeeting: async (id: number, meetingData: Partial<MeetingForm>): Promise<Meeting> => {
    const response = await api.put(`/meetings/${id}/`, meetingData);
    return response.data;
  },

  deleteMeeting: async (id: number): Promise<void> => {
    await api.delete(`/meetings/${id}/`);
  },

  startMeeting: async (id: number): Promise<{ status: string }> => {
    const response = await api.post(`/meetings/${id}/start/`);
    return response.data;
  },

  joinMeeting: async (id: number): Promise<{ meeting_url: string | null; meeting_id: string | null; status: string }> => {
    const response = await api.post(`/meetings/${id}/join/`);
    return response.data;
  },

  endMeeting: async (id: number): Promise<{ status: string }> => {
    const response = await api.post(`/meetings/${id}/end/`);
    return response.data;
  },

  cancelMeeting: async (id: number): Promise<{ status: string }> => {
    const response = await api.post(`/meetings/${id}/cancel/`);
    return response.data;
  },
};

export default api; 