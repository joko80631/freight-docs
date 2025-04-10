import { ErrorBoundary } from '@/components/error-boundary';
import { DocumentErrorFallback } from '@/components/documents/DocumentErrorFallback';

export default function DocumentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary FallbackComponent={DocumentErrorFallback}>
      {children}
    </ErrorBoundary>
  );
} 