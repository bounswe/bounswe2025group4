import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';

export default function WorkplacesAccessGuard() {
  const { user } = useAuth();
  const location = useLocation();
  const isJobSeeker = user?.role === 'ROLE_JOBSEEKER';

  if (isJobSeeker) {
    return <Navigate to="/jobs/workplaces" state={{ from: location }} replace />;
  }

  return (
    <Outlet />
  );
}

