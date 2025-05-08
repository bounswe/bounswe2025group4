import { createContext } from 'react';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthError,
} from '../types/auth';

export interface AuthContextType {
  id: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
