import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, LoginResponse, User } from '../types/auth.types';
import { getUserFromToken, isTokenValid } from '../utils/jwt.utils';
import { useEffect, useState } from 'react';

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
        const { accessToken, user: existingUser, isAuthenticated } = get();

        // If we already have a valid session with user data, verify token is still valid
        if (existingUser && isAuthenticated && accessToken && isTokenValid(accessToken)) {
          // Session is already restored and valid, no need to do anything
          return;
        }

        // Check if token exists in auth store and is valid
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

        // Migration: Check for old localStorage token format
        const oldToken = localStorage.getItem('token');
        if (oldToken && isTokenValid(oldToken)) {
          const user = getUserFromToken(oldToken);
          if (user) {
            // Migrate to new auth store format
            set({
              user,
              accessToken: oldToken,
              isAuthenticated: true,
            });
            // Remove old token from localStorage
            localStorage.removeItem('token');
            return;
          }
        }

        // If no valid token found, clear session
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
 * Hook to get auth state with hydration check
 * This ensures the store is hydrated from localStorage before returning values
 */
export const useAuth = () => {
  const [hydrated, setHydrated] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // Wait for Zustand persist to rehydrate from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Check if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsubscribe;
  }, []);

  // Return null values until hydration is complete to prevent flashing
  if (!hydrated) {
    return { user: null, isAuthenticated: false, accessToken: null };
  }

  return { user, isAuthenticated, accessToken };
};

/**
 * Hook to get auth actions
 */
export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  return { login, logout, setUser, restoreSession, clearSession };
};

