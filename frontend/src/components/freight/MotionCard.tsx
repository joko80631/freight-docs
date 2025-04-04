import React from 'react';
import { motion } from 'framer-motion';
import { FreightCard, FreightCardProps } from './FreightCard';

export interface MotionCardProps extends FreightCardProps {
  delay?: number;
}

export const MotionCard: React.FC<MotionCardProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: 'easeOut'
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      <FreightCard className={className} {...props}>
        {children}
      </FreightCard>
    </motion.div>
  );
}; 