export interface ProjectMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  ownerId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: ProjectMember[];
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
}

export interface ProjectResponse {
  status: string;
  message?: string;
  data: {
    project: Project;
  };
}

export interface ProjectsResponse {
  status: string;
  data: {
    projects: Project[];
  };
}
