'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Sparkles, Bell, User2 } from 'lucide-react';
import UserMenu from '../auth/UserMenu';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

export default function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-white/10 backdrop-blur-md bg-white/5"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo and User Greeting */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                LLM Price Calculator
              </h1>
              <p className="text-sm text-gray-500">
                Professional cost analysis tool
              </p>
            </div>
          </div>
          
          {/* User Greeting with Avatar */}
          {session?.user && (
            <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <User2 className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Welcome back, {session.user.name?.split(' ')[0] || 'User'}!
                </p>
                <p className="text-xs text-gray-500">
                  Ready to analyze LLM costs
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-ping absolute" />
              <span className="w-2 h-2 bg-red-500 rounded-full relative" />
            </span>
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
}