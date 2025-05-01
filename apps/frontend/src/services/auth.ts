import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  RefreshTokenResponse,
} from '../types/auth';

// const API_URL = import.meta.env.VITE_API_URL;

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // TODO: Replace with actual API call
    return this.mockApiCall('/auth/login', credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // TODO: Replace with actual API call
    return this.mockApiCall('/auth/register', credentials);
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // TODO: Replace with actual API call
    return this.mockApiCall('/auth/refresh', { refreshToken });
  }

  async logout(): Promise<void> {
    // TODO: Replace with actual API call
    return this.mockApiCall('/auth/logout', {});
  }

  // Temporary mock implementation
  private async mockApiCall<T>(
    endpoint: string,
    data:
      | LoginCredentials
      | RegisterCredentials
      | { refreshToken?: string }
      | Record<string, never>
  ): Promise<T> {
    console.log(`Mock API call to ${endpoint}`, data);
    throw new Error('API not implemented yet');
  }
}

export const authService = new AuthService();
