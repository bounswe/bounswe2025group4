import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function RedirectIfNotAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
