import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from '../types/auth';

const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    console.error(response);
    const token = response.data.token; // Correctly access token directly
    localStorage.setItem('accessToken', token);
    return response.data;
  }

  async register(
    credentials: RegisterCredentials
  ): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );
    const token = response.data.token;
    localStorage.setItem('token', token);
    return response.data;
  }

  // async refreshToken(): Promise<RefreshTokenResponse> {
  //   const token = localStorage.getItem('refreshToken');
  //   if (!token) {
  //     throw new Error('Refresh token not found');
  //   }
  //   const response = await apiClient.post<
  //     ApiResponse<RefreshTokenResponse>
  //   >('/auth/refresh', { refreshToken: token });
  //   const { token } = response.data.data.token;
  //   localStorage.setItem('token', token);
  //   return response.data.data;
  // }

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/auth/logout', {});
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();

// ----- React Query Hooks -----

export const useCurrentUser = () =>
  useQuery<User>({
    queryKey: AUTH_KEYS.user,
    queryFn: async () => {
      const response = await apiClient.get<User>(
        '/auth/me'
      );
      return response.data;
    },
    retry: false,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: (creds: LoginCredentials) => authService.login(creds),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.id);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterCredentials>({
    mutationFn: (creds: RegisterCredentials) => authService.register(creds),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.id);
    },
  });
};

// export const useRefreshToken = () =>
//   useMutation<RefreshTokenResponse, Error>({
//     mutationFn: () => authService.refreshToken()
//   });

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
