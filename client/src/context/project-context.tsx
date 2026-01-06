import React, { createContext, useContext, useState, useEffect } from 'react';
import { projects as projectsApi } from '@/lib/api/projects';
import type { Project, CreateProjectData, UpdateProjectData } from '@/types/project';
import { useAuth } from './auth-context';

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  selectedProject: Project | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchProjects = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await projectsApi.getProjects();
      setProjects(response.data.projects);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (data: CreateProjectData): Promise<Project> => {
    setError(null);
    try {
      const response = await projectsApi.createProject(data);
      const newProject = response.data.project;
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProject = async (id: string, data: UpdateProjectData): Promise<Project> => {
    setError(null);
    try {
      const response = await projectsApi.updateProject(id, data);
      const updatedProject = response.data.project;
      setProjects((prev) =>
        prev.map((p) => (p._id === id ? updatedProject : p))
      );
      if (selectedProject?._id === id) {
        setSelectedProject(updatedProject);
      }
      return updatedProject;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    setError(null);
    try {
      await projectsApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      if (selectedProject?._id === id) {
        setSelectedProject(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const selectProject = (project: Project | null) => {
    setSelectedProject(project);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
    } else {
      setProjects([]);
      setSelectedProject(null);
    }
  }, [isAuthenticated]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoading,
        error,
        selectedProject,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        selectProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
