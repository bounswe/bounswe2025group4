import { useState, ReactNode, useEffect, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [id, setId] = useState<string | null>(localStorage.getItem('id'));

  useEffect(() => {
    if (token && id) {
      localStorage.setItem('token', token);
      localStorage.setItem('id', id);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('id');
    }
  }, [token, id]);

  const contextValue = useMemo(
    () => ({
      token,
      id,
      setToken,
      setId,
    }),
    [token, id]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
