'use client';

import { motion } from 'framer-motion';
import { Calculator, Github } from 'lucide-react';

interface LoginSpinnerProps {
  message?: string;
  className?: string;
}

export default function LoginSpinner({ 
  message = "Signing in with GitHub...", 
  className = '' 
}: LoginSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Logo and spinner */}
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner logo */}
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Calculator className="h-8 w-8 text-white" />
        </motion.div>
      </div>

      {/* Loading message */}
      <div className="text-center space-y-2">
        <motion.div
          className="flex items-center space-x-2 text-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Github className="h-5 w-5 text-gray-300" />
          <span className="text-lg font-medium">{message}</span>
        </motion.div>
        
        {/* Animated dots */}
        <motion.div className="flex space-x-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Subtle background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}