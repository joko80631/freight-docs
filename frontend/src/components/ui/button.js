export function Button({ 
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    outline: 'border border-gray-200 bg-white hover:bg-gray-100 focus-visible:ring-gray-500',
    ghost: 'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500'
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 