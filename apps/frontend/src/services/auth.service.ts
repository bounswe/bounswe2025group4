import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { LoginCredentials, AuthResponse, RegisterData } from '../types/auth';
import { ApiError } from '../types/api';
const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse | ApiError> {
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

  async register(credentials: RegisterData): Promise<AuthResponse | ApiError> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  }
}

export const authService = new AuthService();

// ----- React Query Hooks -----

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse | ApiError, Error, LoginCredentials>({
    mutationFn: (creds: LoginCredentials) => authService.login(creds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse | ApiError, Error, RegisterData>({
    mutationFn: (creds: RegisterData) => authService.register(creds),
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

export const useForgotPassword = () => {
  return useMutation<void, Error, string>({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
};

export const useResetPassword = () => {
  return useMutation<void, Error, { token: string; newPassword: string }>({
    mutationFn: ({ token, newPassword }) =>
      authService.resetPassword(token, newPassword),
  });
};
