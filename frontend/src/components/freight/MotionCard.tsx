import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

export interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: 'default' | 'bordered' | 'elevated' | 'subtle';
  hover?: boolean;
}

export const MotionCard: React.FC<MotionCardProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  variant = 'default',
  hover = false,
  ...props 
}) => {
  // Map FreightCard variants to shadcn/ui Card styles
  const getCardClassName = () => {
    let baseClass = 'border border-border/40 shadow-sm';
    
    if (variant === 'bordered') {
      baseClass += ' border-2';
    } else if (variant === 'elevated') {
      baseClass += ' shadow-md';
    } else if (variant === 'subtle') {
      baseClass += ' bg-muted/50';
    }
    
    return `${baseClass} ${className}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: 'easeOut'
      }}
      whileHover={hover ? { 
        y: -2,
        transition: { duration: 0.2 }
      } : undefined}
    >
      <Card className={getCardClassName()} {...props}>
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}; 