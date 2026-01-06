import { apiClient } from './client';
import type { RegisterData, LoginData, User, AuthResponse } from '@/types/auth';

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<{ status: string; data: { user: User } }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ status: string; data: { user: User } }> => {
    const response = await apiClient.put('/auth/me', data);
    return response.data;
  },
};

// Re-export types for convenience
export type { RegisterData, LoginData, User, AuthResponse };
