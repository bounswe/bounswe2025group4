import { createContext } from 'react';

export interface AuthContextType {
  token: string | null;
  id: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
