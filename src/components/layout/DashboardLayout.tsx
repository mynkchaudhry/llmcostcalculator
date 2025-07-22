'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import { fadeInUp } from '@/utils/animations';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <DashboardHeader />
        
        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto pt-16 lg:pt-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}