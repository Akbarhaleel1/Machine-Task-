export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string | null;
  industry?: string | null;
  teamSize?: string | null;
  avatar?: string | null;
  role: string;
  onboarded: boolean;
  createdAt: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}
