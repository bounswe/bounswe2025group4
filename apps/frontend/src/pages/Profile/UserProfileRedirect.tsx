import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../../services/profile.service';
import CenteredLoader from '../../components/layout/CenterLoader';

/**
 * Component that redirects to the user's profile page
 * Used for the /profile route
 */
const UserProfileRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, isError } = useMe();

  useEffect(() => {
    // Redirect to the user's profile page
    try {
      if (data) {
        navigate(`/u/${data.id}`);
      } else if (isError) {
        console.error('Error fetching user data:', error?.message);
      } else {
        navigate('/login');
      }
    } catch (e) {
      console.error('Error redirecting to user profile:', e);
      navigate('/');
    }
  }, [navigate, data, isLoading, error, isError]);

  // Show a loading spinner while redirecting
  return <CenteredLoader />;
};

export default UserProfileRedirect;
