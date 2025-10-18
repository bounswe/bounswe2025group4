import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api') 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.VITE_API_URL || '') + '/api';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        // No token, redirect to login
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Send token to backend for verification
        const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
        
        // Success: redirect to login
        if (response.status === 200) {
          navigate('/login', { 
            replace: true,
            state: { message: 'Email verified successfully! You can now log in.' }
          });
        }
      } catch (error: any) {
        // Error: still redirect to login but with error message
        let errorMsg = 'Email verification failed. Please try again or contact support.';
        
        if (error.response?.data?.message) {
          const backendMsg = error.response.data.message;
          if (backendMsg.includes('Full authentication') || backendMsg.includes('Token')) {
            errorMsg = 'Verification link is invalid or has already been used. If you already verified your email, please log in.';
          } else {
            errorMsg = backendMsg;
          }
        }
        
        navigate('/login', { 
          replace: true,
          state: { error: errorMsg }
        });
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  // Return null to avoid rendering anything (immediate redirect)
  return null;
}

