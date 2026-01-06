import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import type { User, LoginData, RegisterData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await authApi.getMe();
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginData) => {
    const response = await authApi.login(credentials);
    setUser(response.data.user);
    localStorage.setItem('auth_token', response.data.accessToken);
    localStorage.setItem('refresh_token', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    setUser(response.data.user);
    localStorage.setItem('auth_token', response.data.accessToken);
    localStorage.setItem('refresh_token', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  };

  const logout = () => {
    authApi.logout().catch(() => {
      // Ignore errors on logout
    });
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: localStorage.getItem('auth_token'),
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
