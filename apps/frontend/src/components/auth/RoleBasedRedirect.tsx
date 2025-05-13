import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../../services/user.service';
import { User } from '../../types/auth';
import CenteredLoader from '../layout/CenterLoader';

const RoleBasedRedirect: React.FC = () => {
  const currentUser = useCurrentUser();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser.data) {
      setUser(currentUser.data);
    }
  }, [currentUser.data]);

  // Redirection based on the current page
  const currentPath = window.location.pathname;
  if (currentPath === '/jobs') {
    if (!user) {
      // wait until user is set
      return <CenteredLoader />;
    }

    if (user?.userType === 'EMPLOYER') {
      return <Navigate to="/dashboard/jobs" replace />;
    }

    if (user?.userType === 'JOB_SEEKER') {
      return <Navigate to="/jobs/list" replace />;
    }
    // Fallback or default redirect if role is not jobseeker or employer
    // Or handle other roles like 'admin'
    // For now, redirecting to home as a fallback.
    console.warn(
      `RoleBasedRedirect: Unknown or unhandled user role: ${user?.userType}. Redirecting to home.`
    );
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/" replace />;
};

export default RoleBasedRedirect;
