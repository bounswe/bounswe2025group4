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
  if (currentPath === '/mentorship') {
    if (!user) {
      // wait until user is set
      return <CenteredLoader />;
    }

    if (user?.mentorshipStatus === 'MENTEE') {
      return <Navigate to="/mentorship/mentee" replace />;
    }

    if (user?.mentorshipStatus === 'MENTOR') {
      return <Navigate to="/mentorship/mentor" replace />;
    }

    return <Navigate to="/" replace />;
  } else if (currentPath === '/jobs') {
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
    console.warn(
      `RoleBasedRedirect: Unknown or unhandled user role: ${user?.userType}. Redirecting to home.`
    );
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/" replace />;
};

export default RoleBasedRedirect;
