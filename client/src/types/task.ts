export interface Comment {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  projectId: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignees: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  tags?: string[];
  dueDate?: string;
  comments: Comment[];
  attachments?: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignees?: string[];
  tags?: string[];
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignees?: string[];
  tags?: string[];
  dueDate?: string;
}

export interface TaskResponse {
  status: string;
  data: {
    task: Task;
  };
}

export interface TasksResponse {
  status: string;
  data: {
    tasks: Task[];
    hasMore?: boolean;
    cursor?: string;
  };
}
