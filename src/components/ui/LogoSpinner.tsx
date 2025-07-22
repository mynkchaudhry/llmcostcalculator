'use client';

import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';

interface LogoSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LogoSpinner({ size = 'md', className = '' }: LogoSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25`}
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <Calculator className={`${iconSizes[size]} text-white`} />
      </motion.div>
    </div>
  );
}