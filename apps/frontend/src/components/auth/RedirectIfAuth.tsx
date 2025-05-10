import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
