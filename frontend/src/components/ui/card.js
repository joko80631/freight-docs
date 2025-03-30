export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 