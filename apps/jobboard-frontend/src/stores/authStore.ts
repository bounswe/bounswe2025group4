import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, LoginResponse, User } from '../types/auth.types';
import { getUserFromToken, isTokenValid } from '../utils/jwt.utils';

/**
 * Zustand store for authentication state management
 * Persists to localStorage with automatic token validation
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // Actions
      login: (response: LoginResponse) => {
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          role: response.role,
        };

        set({
          user,
          accessToken: response.token,
          refreshToken: null, // Backend doesn't return refresh token yet
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      restoreSession: () => {
        const { accessToken } = get();

        // Check if token exists and is valid
        if (accessToken && isTokenValid(accessToken)) {
          const user = getUserFromToken(accessToken);
          if (user) {
            set({
              user,
              isAuthenticated: true,
            });
            return;
          }
        }

        // If token is invalid or expired, clear session
        get().clearSession();
      },

      clearSession: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Hook to get auth state
 */
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  accessToken: state.accessToken,
}));

/**
 * Hook to get auth actions
 */
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  setUser: state.setUser,
  restoreSession: state.restoreSession,
  clearSession: state.clearSession,
}));

