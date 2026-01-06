import { apiClient } from './client';
import type {
  CreateProjectData,
  UpdateProjectData,
  ProjectResponse,
  ProjectsResponse,
} from '@/types/project';

export const projects = {
  createProject: async (data: CreateProjectData): Promise<ProjectResponse> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  getProjects: async (): Promise<ProjectsResponse> => {
    const response = await apiClient.get('/projects');
    return response.data;
  },

  getProjectById: async (id: string): Promise<ProjectResponse> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  updateProject: async (
    id: string,
    data: UpdateProjectData
  ): Promise<ProjectResponse> => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<{ status: string; data: any }> => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  addMember: async (
    id: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' | 'VIEWER'
  ): Promise<ProjectResponse> => {
    const response = await apiClient.post(`/projects/${id}/members`, {
      email,
      role,
    });
    return response.data;
  },

  removeMember: async (
    id: string,
    memberId: string
  ): Promise<ProjectResponse> => {
    const response = await apiClient.delete(
      `/projects/${id}/members/${memberId}`
    );
    return response.data;
  },
};