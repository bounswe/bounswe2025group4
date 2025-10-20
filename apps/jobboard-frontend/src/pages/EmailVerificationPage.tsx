import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CenteredLoader from '../components/CenteredLoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.endsWith('/api') 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.VITE_API_URL || '') + '/api';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasVerified = useRef(false);
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMessage('No verification token provided.');
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
        
        if (response.status === 200) {
          setStatus('success');
        }
      } catch (error: unknown) {
        setStatus('error');

        let errorMsg = 'Email verification failed. Please try again or contact support.';

        if (axios.isAxiosError(error)) {
          const responseData = error.response?.data as { message?: string; error?: string } | undefined;
          const backendMsg = responseData?.message ?? responseData?.error;

          if (backendMsg) {
            if (backendMsg.includes('Full authentication') || backendMsg.includes('Token')) {
              errorMsg = 'Verification link is invalid or has already been used.';
            } else {
              errorMsg = backendMsg;
            }
          } else if (error.message) {
            errorMsg = error.message;
          }
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }

        setErrorMessage(errorMsg);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
        <div className="text-center space-y-4">
          <CenteredLoader />
          <p className="text-muted-foreground">Verifying your email...</p>
        </div>
      </div>
    );
  }

  // Success/Error state
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {status === 'success' ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You can now log in to your account.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
              <CardDescription>
                {errorMessage}
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

