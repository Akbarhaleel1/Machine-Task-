import { apiClient } from './client';
import type {
  CreateTaskData,
  UpdateTaskData,
  TaskResponse,
  TasksResponse,
} from '@/types/task';

export const tasks = {
  createTask: async (data: CreateTaskData): Promise<TaskResponse> => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  getTasks: async (
    projectId: string,
    filters?: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      tags?: string[];
      cursor?: string;
      limit?: number;
    }
  ): Promise<TasksResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters?.tags) filters.tags.forEach((tag) => params.append('tags', tag));
    if (filters?.cursor) params.append('cursor', filters.cursor);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(
      `/tasks/project/${projectId}${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  getTaskById: async (id: string): Promise<TaskResponse> => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  updateTask: async (
    id: string,
    data: UpdateTaskData
  ): Promise<TaskResponse> => {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ status: string; data: any }> => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  addComment: async (
    id: string,
    content: string
  ): Promise<{ status: string; data: { comment: any } }> => {
    const response = await apiClient.post(`/tasks/${id}/comments`, { content });
    return response.data;
  },

  searchTasks: async (
    projectId: string,
    query: string
  ): Promise<TasksResponse> => {
    const response = await apiClient.get(
      `/tasks/project/${projectId}/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },
};
