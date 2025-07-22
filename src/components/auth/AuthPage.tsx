'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  LogIn,
  Github
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import LoginSpinner from '../ui/LoginSpinner';
import { fadeInUp } from '@/utils/animations';

export default function AuthPage() {
  const [error, setError] = useState('');
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);


  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true);
    setError('');
    try {
      await signIn('github', {
        callbackUrl: '/',
        redirect: true
      });
    } catch {
      setError('Failed to sign in with GitHub');
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      {/* Loading overlay */}
      {isGitHubLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <LoginSpinner message="Signing in with GitHub..." />
        </motion.div>
      )}
      
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Calculator className="h-8 w-8 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
            LLM Price Calculator
          </h1>
          
          <p className="text-gray-400">
            Sign in with your GitHub account to continue
          </p>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-10 shadow-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <LogIn className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome Back
                </h2>
              </div>

              {/* GitHub Sign In Button */}
              <Button
                type="button"
                onClick={handleGitHubSignIn}
                disabled={isGitHubLoading}
                className="w-full py-4 mb-6 bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold"
              >
                {isGitHubLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Signing in with GitHub...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Github className="h-6 w-6" />
                    <span>Continue with GitHub</span>
                  </div>
                )}
              </Button>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-400 text-sm text-center mb-4"
                >
                  {error}
                </motion.div>
              )}

              <p className="text-sm text-gray-500 leading-relaxed">
                By continuing, you agree to our terms of service and acknowledge our privacy policy. 
                Your GitHub account will be used for secure authentication only.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>Secure • Private • Professional</p>
        </motion.div>
      </div>
    </div>
  );
}