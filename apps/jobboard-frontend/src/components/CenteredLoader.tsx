import { Loader2 } from 'lucide-react';

export default function CenteredLoader() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
