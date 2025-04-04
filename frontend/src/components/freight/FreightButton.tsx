'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface FreightButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  size?: 'default' | 'small';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FreightButton = forwardRef<HTMLButtonElement, FreightButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'default',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500',
      secondary: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      icon: 'p-2 text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      small: 'h-8 px-3 py-1.5 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== 'icon' && sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        data-testid={`freight-button-${variant}${size !== 'default' ? `-${size}` : ''}${isLoading ? '-loading' : ''}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" data-testid="freight-button-loading-icon" />
        ) : (
          <>
            {leftIcon && <span className="mr-2" data-testid="freight-button-left-icon">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2" data-testid="freight-button-right-icon">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

FreightButton.displayName = 'FreightButton'; 