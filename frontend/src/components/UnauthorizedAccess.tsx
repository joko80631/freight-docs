import { AlertCircle } from 'lucide-react';

interface UnauthorizedAccessProps {
  message?: string;
}

export function UnauthorizedAccess({ 
  message = "You don't have permission to access this resource." 
}: UnauthorizedAccessProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Access Denied
      </h2>
      <p className="text-gray-600 max-w-md">
        {message}
      </p>
    </div>
  );
} 