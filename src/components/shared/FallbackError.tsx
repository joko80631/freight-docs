import { FallbackProps } from 'react-error-boundary';

export function FallbackError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
        <h3 className="text-lg font-medium text-destructive">Something went wrong</h3>
        <p className="text-destructive/80 mt-1">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="mt-4 px-4 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 