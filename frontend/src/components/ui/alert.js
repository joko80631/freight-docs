export function Alert({ 
  variant = 'default',
  className = '',
  children,
  ...props 
}) {
  const variants = {
    default: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };

  return (
    <div
      className={`p-4 rounded-md border ${variants[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ className = '', children, ...props }) {
  return (
    <h5
      className={`text-sm font-medium mb-1 ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({ className = '', children, ...props }) {
  return (
    <div
      className={`text-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 