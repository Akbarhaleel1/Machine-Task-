export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  companyName?: string;
  industry?: string;
  teamSize?: string;
  avatar?: string;
  onboarded: boolean;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'ADMIN';
  companyName?: string;
  industry?: string;
  teamSize?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  companyName?: string;
  industry?: string;
  teamSize?: string;
}

export interface UserListResponse {
  status: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserResponse {
  status: string;
  data: {
    user: User;
  };
}
