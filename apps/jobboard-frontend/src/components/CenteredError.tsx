import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CenteredErrorProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function CenteredError({
  message = 'An error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
}: CenteredErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <Card className="p-8 max-w-md w-full border-destructive/50">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="lg"
              className="mt-2 min-w-[140px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

