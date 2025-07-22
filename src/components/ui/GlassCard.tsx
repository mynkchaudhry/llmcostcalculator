'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cardHover } from '@/utils/animations';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  curved?: boolean;
}

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true, 
  curved = true 
}: GlassCardProps) {
  return (
    <motion.div
      variants={hover ? cardHover : undefined}
      initial="rest"
      whileHover="hover"
      className={`
        backdrop-blur-md bg-white/10 border border-white/20 
        shadow-xl shadow-black/10
        ${curved ? 'rounded-3xl' : 'rounded-lg'}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
      }}
    >
      {children}
    </motion.div>
  );
}