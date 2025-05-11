import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types/auth';
import { User } from '../types/user';

const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    if (response.data && response.data.token && response.data.id) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('id', response.data.id.toString());
    }
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    if (token) {
      try {
        const response = await apiClient.get<User>(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (e) {
        console.error('Failed to parse token or mock user:', e);
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  }
}

export const authService = new AuthService();

// ----- React Query Hooks -----

export const useCurrentUser = () => {
  return useQuery<User | null, Error>({
    queryKey: AUTH_KEYS.user,
    queryFn: () => authService.getCurrentUser(),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (creds: LoginCredentials) => authService.login(creds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterCredentials>({
    mutationFn: (creds: RegisterCredentials) => authService.register(creds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.user, null);
    },
  });
};
