import { useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div>
      <h1>Oops! Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
    </div>
  );
}
