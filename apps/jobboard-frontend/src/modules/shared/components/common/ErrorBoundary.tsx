import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-20 w-20 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Oops!</h1>
          <p className="text-xl text-muted-foreground">Something went wrong</p>
        </div>

        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-mono break-words">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>

        <Button onClick={handleGoHome} size="lg" className="w-full sm:w-auto">
          <Home className="mr-2 h-4 w-4" />
          Return to Home
        </Button>
      </div>
    </div>
  );
}
