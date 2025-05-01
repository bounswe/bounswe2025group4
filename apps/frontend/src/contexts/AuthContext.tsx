import { useEffect, useState, ReactNode, useCallback } from 'react';
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  AuthError,
} from '../types/auth';
import { authService } from '../services/auth';
import { AuthContext } from './AuthContextValue';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const storedTokens = localStorage.getItem('auth_tokens');
    if (storedTokens) {
      const parsedTokens: AuthTokens = JSON.parse(storedTokens);
      setTokens(parsedTokens);
      // TODO: Validate tokens and fetch user data
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (tokens) {
        await authService.logout();
      }
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('auth_tokens');
    }
  }, [tokens]);

  useEffect(() => {
    if (!tokens?.refreshToken) return;

    const refreshInterval = setInterval(
      async () => {
        try {
          const response = await authService.refreshToken(tokens.refreshToken);
          setTokens((prev) =>
            prev ? { ...prev, accessToken: response.accessToken } : null
          );
        } catch (err) {
          console.error('Token refresh failed:', err);
          await logout();
        }
      },
      15 * 60 * 1000
    );

    return () => clearInterval(refreshInterval);
  }, [tokens?.refreshToken, logout]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      setTokens(response.tokens);
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
    } catch (err) {
      setError({ message: 'Login failed. Please try again.' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.register(credentials);
      setUser(response.user);
      setTokens(response.tokens);
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
    } catch (err) {
      setError({ message: 'Registration failed. Please try again.' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
