'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import AuthPage from './AuthPage';
import LoadingScreen from './LoadingScreen';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}