export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  location: string | null;
  photo: string | null;
  is_public: boolean;
  date_joined: string;
}

export interface Skill {
  id: number;
  name: string;
  owner: number;
  owner_name: string;
  offered: boolean;
  created_at: string;
  updated_at: string;
}

export interface SwapRequest {
  id: number;
  from_user: number;
  from_user_name: string;
  to_user: number;
  to_user_name: string;
  offered_skill: number;
  offered_skill_name: string;
  requested_skill: number;
  requested_skill_name: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat: number;
  sender: number;
  sender_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: number;
  swap_request: number;
  messages: Message[];
  participants: { id: number; username: string }[];
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: number;
  chat: number;
  organizer: number;
  organizer_name: string;
  meeting_type: 'INSTANT' | 'SCHEDULED';
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  meeting_url: string | null;
  meeting_id: string | null;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  participants: { id: number; username: string }[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  location: string;
  is_public: boolean;
}

export interface SkillForm {
  name: string;
  offered: boolean;
}

export interface SwapRequestForm {
  to_user: number;
  offered_skill: number;
  requested_skill: number;
}

export interface MessageForm {
  chat: number;
  content: string;
}

export interface MeetingForm {
  chat: number;
  meeting_type: 'INSTANT' | 'SCHEDULED';
  title: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
} 