'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

export interface FreightButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'white' | 'outline' | 'icon';
  size?: 'default' | 'small';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  withArrow?: boolean;
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
      withArrow,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-2 group';
    
    const variants = {
      primary: 'bg-black text-white hover:bg-black/90 focus:ring-black',
      white: 'bg-white text-black border border-black/10 hover:bg-gray-50 focus:ring-black',
      outline: 'border border-black bg-white text-black hover:bg-gray-50 focus:ring-black',
      icon: 'p-2 text-black hover:bg-gray-50 focus:ring-black',
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
            {withArrow && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
          </>
        )}
      </button>
    );
  }
);

FreightButton.displayName = 'FreightButton'; 