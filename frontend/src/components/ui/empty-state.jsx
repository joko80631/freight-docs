'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  cta,
  secondaryCta,
  variant = 'centered',
  className,
  'aria-label': ariaLabel,
}) => {
  const containerClasses = cn(
    'flex flex-col items-center justify-center p-4 sm:p-6',
    {
      'min-h-[400px]': variant === 'centered',
      'min-h-[200px]': variant === 'inline',
      'rounded-lg border border-border bg-card': variant === 'card',
    },
    className
  );

  const contentClasses = cn('text-center w-full', {
    'max-w-sm': variant === 'centered',
    'max-w-full': variant === 'inline' || variant === 'card',
  });

  const renderCta = (ctaProps, isSecondary = false) => {
    if (!ctaProps) return null;

    const buttonClasses = cn(
      'mt-4 w-full sm:w-auto',
      isSecondary && 'sm:ml-2'
    );

    const buttonProps = {
      'aria-label': `${ctaProps.label}${isSecondary ? ' (secondary action)' : ''}`,
      className: buttonClasses,
    };

    if (ctaProps.href) {
      return (
        <Button
          asChild
          variant={isSecondary ? 'outline' : 'default'}
          {...buttonProps}
        >
          <Link href={ctaProps.href}>
            {ctaProps.label}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        variant={isSecondary ? 'outline' : 'default'}
        onClick={ctaProps.onClick}
        {...buttonProps}
      >
        {ctaProps.label}
      </Button>
    );
  };

  return (
    <div 
      className={containerClasses}
      role="region"
      aria-label={ariaLabel || 'Empty state'}
    >
      <div className={contentClasses}>
        {Icon && (
          <div 
            className="mx-auto mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted"
            aria-hidden="true"
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-base sm:text-lg font-medium">
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 sm:mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}
        <div 
          className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0"
          role="group"
          aria-label="Available actions"
        >
          {renderCta(cta)}
          {secondaryCta && renderCta(secondaryCta, true)}
        </div>
      </div>
    </div>
  );
};

export default EmptyState; 