import {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { User, LoginResponse } from '../types/auth.types';

/**
 * Auth context type definition
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

/**
 * Create Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * Wraps the app and provides authentication context
 * Automatically restores session on mount
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Get state from store
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Get actions from store
  const storeLogin = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  // Restore session on mount (only once)
  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login function - wraps store login
  const login = useCallback(
    (response: LoginResponse) => {
      storeLogin(response);
    },
    [storeLogin]
  );

  // Logout function - wraps store logout
  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  // Refresh function - stub for future implementation
  // Will be called by API client on 401 errors
  const refresh = useCallback(async () => {
    // TODO: Implement token refresh logic when backend supports it
    // For now, just validate and restore session
    restoreSession();

    // If session is invalid after restore, logout
    const currentAuth = useAuthStore.getState().isAuthenticated;
    if (!currentAuth) {
      storeLogout();
    }
  }, [restoreSession, storeLogout]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    refresh,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/**
 * Hook to use Auth Context
 * @throws Error if used outside AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

/**
 * Alias for useAuthContext for convenience
 */
export const useAuth = useAuthContext;

