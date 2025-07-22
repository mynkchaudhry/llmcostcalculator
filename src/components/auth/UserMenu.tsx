'use client';

import { signOut, useSession } from 'next-auth/react';
import { User2 } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const { setCurrentTab } = useAppStore();

  const handleProfileClick = () => {
    setCurrentTab('profile');
  };

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
    );
  }

  if (!session) {
    return null; // Auth is handled by AuthGuard now
  }

  return (
    <button
      onClick={handleProfileClick}
      className="flex items-center space-x-3 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200"
    >
      {session.user?.image ? (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <User2 className="h-4 w-4 text-white" />
        </div>
      )}
      <div className="hidden md:block text-left">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {session.user?.name || 'User'}
        </p>
        <p className="text-xs text-gray-500">
          View Profile
        </p>
      </div>
    </button>
  );
}