import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import type { UserRole } from '../types/auth.types';

/**
 * Options for useRequireAuth hook
 */
interface UseRequireAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

/**
 * Hook to require authentication
 * Redirects to login if user is not authenticated
 * Optionally checks for required role
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   useRequireAuth(); // Basic auth check
 *   
 *   return <div>Protected content</div>;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function EmployerPage() {
 *   useRequireAuth({ requiredRole: 'ROLE_EMPLOYER' });
 *   
 *   return <div>Employer only content</div>;
 * }
 * ```
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { requiredRole, redirectTo = '/login' } = options;
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate(redirectTo, {
        replace: true,
        state: { from: location },
      });
      return;
    }

    // Check for required role
    if (requiredRole && user?.role !== requiredRole) {
      // Redirect to home if user doesn't have required role
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, requiredRole, redirectTo, navigate, location]);

  return { isAuthenticated, user };
}

export default useRequireAuth;

