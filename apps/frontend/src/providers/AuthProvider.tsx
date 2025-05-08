import { useEffect, useState, ReactNode, useCallback } from 'react';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthError,
  AuthTokens,
} from '../types/auth';
import { authService } from '../services/auth.service';
import { AuthContext } from '../contexts/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider component that manages authentication state and operations.
 *
 * @component
 * @param {AuthProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components that will have access to auth context
 *
 * @remarks
 * This provider handles:
 * - User authentication state management
 * - Token storage and refresh
 * - Login/Register/Logout operations
 * - Error state management
 * - Loading state management
 *
 * The provider automatically:
 * - Restores session from localStorage on mount
 * - Refreshes tokens periodically (every 15 minutes)
 * - Handles token storage in localStorage
 * - Manages loading and error states during auth operations
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [id, setId] = useState<number | null>(null);
  const [auth_tokens, setAuthTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const storedTokens = localStorage.getItem('auth_tokens');
    if (storedTokens) {
      const parsedTokens: AuthTokens = JSON.parse(storedTokens);
      setAuthTokens(parsedTokens);
      // TODO: Validate tokens and fetch user data
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (auth_tokens) {
        await authService.logout();
      }
    } finally {
      setId(null);
      setAuthTokens(null);
      localStorage.removeItem('auth_tokens');
    }
  }, [auth_tokens]);

  // useEffect(() => {
  //   if (!tokens?.accessToken) return;

  //   const refreshInterval = setInterval(
  //     async () => {
  //       try {
  //         const response = await authService.refreshToken();
  //         setTokens((prev) =>
  //           prev ? { ...prev, accessToken: response.accessToken } : null
  //         );
  //       } catch (err) {
  //         console.error('Token refresh failed:', err);
  //         await logout();
  //       }
  //     },
  //     15 * 60 * 1000 // every 15 minutes
  //   );

  //   return () => clearInterval(refreshInterval);
  // }, [tokens?.accessToken, logout]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authService.login(credentials);
      setId(response.id);
      setAuthTokens(response.token);
      localStorage.setItem('auth_tokens', JSON.stringify(response.token));
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
      setId(response.id);
      setAuthTokens(response.token);
      localStorage.setItem('auth_tokens', JSON.stringify(response.token));
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
        id,
        isAuthenticated: !!id,
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
