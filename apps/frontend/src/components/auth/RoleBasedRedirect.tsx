import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path as needed
import CenteredLoader from '../layout/CenterLoader'; // Assuming a loader component exists
import { User } from '../../types/user';
import { useCurrentUser } from '../../services/auth.service';
const RoleBasedRedirect: React.FC = () => {
  const authContext = useContext(AuthContext);
  const currentUser = useCurrentUser();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser.data) {
      setUser(currentUser.data);
    }
  }, [currentUser.data]);

  if (currentUser.isLoading) {
    return <CenteredLoader />;
  }

  if (currentUser.error || !currentUser.data) {
    return <Navigate to="/login" replace />;
  }

  if (!authContext || !authContext.token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirection based on the current page
  const currentPath = window.location.pathname;
  if (currentPath === '/jobs') {
    if (user.userType === 'EMPLOYER') {
      return <Navigate to="/dashboard/jobs" replace />;
    }

    if (user.userType === 'JOB_SEEKER') {
      return <Navigate to="/jobs/list" replace />;
    }
  }

  // Fallback or default redirect if role is not jobseeker or employer
  // Or handle other roles like 'admin'
  // For now, redirecting to home as a fallback.
  console.warn(
    `RoleBasedRedirect: Unknown or unhandled user role: ${user.userType}. Redirecting to home.`
  );
  return <Navigate to="/" replace />;
};

export default RoleBasedRedirect;
