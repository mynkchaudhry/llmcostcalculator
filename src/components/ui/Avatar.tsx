'use client';

import { motion } from 'framer-motion';
import { Bot, User, Sparkles, Zap, Brain, Cpu } from 'lucide-react';

interface AvatarProps {
  type: 'user' | 'assistant';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  userImage?: string;
  userName?: string;
}

const botAvatars = [
  { icon: Bot, gradient: 'from-blue-500 to-purple-600' },
  { icon: Sparkles, gradient: 'from-purple-500 to-pink-500' },
  { icon: Zap, gradient: 'from-yellow-500 to-orange-500' },
  { icon: Brain, gradient: 'from-green-500 to-teal-500' },
  { icon: Cpu, gradient: 'from-indigo-500 to-blue-500' }
];

export default function Avatar({ 
  type, 
  size = 'md', 
  animate = true, 
  userImage, 
  userName 
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  // Select bot avatar based on hash of session or random
  const botAvatarIndex = Math.floor(Math.random() * botAvatars.length);
  const selectedBotAvatar = botAvatars[botAvatarIndex];

  if (type === 'user') {
    return (
      <motion.div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 relative`}
        initial={animate ? { scale: 0, rotate: -180 } : {}}
        animate={animate ? { scale: 1, rotate: 0 } : {}}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.1 
        }}
      >
        {userImage ? (
          <img 
            src={userImage} 
            alt={userName || 'User'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <User className={`${iconSizes[size]} text-white`} />
          </div>
        )}
        
        {/* Online indicator */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
          initial={animate ? { scale: 0 } : {}}
          animate={animate ? { scale: 1 } : {}}
          transition={{ delay: 0.5 }}
        />
      </motion.div>
    );
  }

  // Assistant avatar
  const IconComponent = selectedBotAvatar.icon;
  
  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full flex-shrink-0 relative`}
      initial={animate ? { scale: 0, rotate: 180 } : {}}
      animate={animate ? { scale: 1, rotate: 0 } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.1 
      }}
    >
      <div className={`w-full h-full bg-gradient-to-br ${selectedBotAvatar.gradient} rounded-full flex items-center justify-center relative overflow-hidden`}>
        {/* Animated background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          animate={animate ? {
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <IconComponent className={`${iconSizes[size]} text-white relative z-10`} />
        </motion.div>
        
        {/* Thinking indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}