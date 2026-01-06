import { apiClient } from './client';
import type {
  CreateUserData,
  UpdateUserData,
  UserResponse,
  UserListResponse,
} from '@/types/user';

export const users = {
  createUser: async (data: CreateUserData): Promise<UserResponse> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  listUsers: async (filters?: {
    role?: 'USER' | 'ADMIN';
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await apiClient.get(
      `/users${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    data: UpdateUserData
  ): Promise<UserResponse> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ status: string; data: any }> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  resetPassword: async (
    id: string,
    newPassword: string
  ): Promise<{ status: string; data: { message: string } }> => {
    const response = await apiClient.post(`/users/${id}/reset-password`, {
      newPassword,
    });
    return response.data;
  },
};
