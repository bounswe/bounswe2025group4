import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth.types';
import CenteredLoader from './CenteredLoader';

/**
 * ProtectedRoute Props
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 * Optionally checks for required role
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Show loader while checking auth state
  // This prevents flashing for authenticated users
  if (isAuthenticated === undefined) {
    return <CenteredLoader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check for required role if specified
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to home or unauthorized page
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated (and has required role)
  return <>{children}</>;
}

export default ProtectedRoute;

