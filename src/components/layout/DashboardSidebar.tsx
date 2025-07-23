'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  BarChart3, 
  Settings, 
  Zap,
  User,
  TrendingUp,
  Menu,
  X,
  History,
  Activity,
  FileText,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/stores/useAppStore';
import GlassCard from '../ui/GlassCard';

const navigationItems = [
  {
    id: 'calculator' as const,
    label: 'LLM Calculator',
    icon: Calculator,
    description: 'Calculate LLM costs',
    type: 'tab'
  },
  {
    id: 'estimator' as const,
    label: 'Usage Estimator',
    icon: TrendingUp,
    description: 'Real-world costs',
    type: 'tab'
  },
  {
    id: 'comparison' as const,
    label: 'Comparison',
    icon: BarChart3,
    description: 'Compare models',
    type: 'tab'
  },
  {
    id: 'management' as const,
    label: 'Models',
    icon: Settings,
    description: 'Manage models',
    type: 'tab'
  },
  {
    id: 'history' as const,
    label: 'History',
    icon: History,
    description: 'View past comparisons',
    type: 'tab'
  },
  {
    id: 'activity' as const,
    label: 'Activity Log',
    icon: FileText,
    description: 'Detailed activity history',
    type: 'tab'
  },
  {
    id: 'advisor' as const,
    label: 'AI Advisor',
    icon: MessageSquare,
    description: 'Infrastructure recommendations',
    type: 'tab'
  },
];

const secondaryItems = [
  {
    id: 'profile' as const,
    label: 'Profile',
    icon: User,
    description: 'Account settings',
  },
];

export default function DashboardSidebar() {
  const { currentTab, setCurrentTab } = useAppStore();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ 
          opacity: 1, 
          x: 0,
        }}
        className={`
          w-64 border-r border-white/10 backdrop-blur-md bg-white/5 flex flex-col
          lg:relative lg:translate-x-0
          fixed inset-y-0 left-0 z-40 transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      <div className="p-6 flex-1">
        {/* Primary Navigation */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Main Features
          </h2>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.type === 'route' 
                ? pathname === item.href
                : currentTab === item.id;
              
              const content = (
                <>
                  <Icon className="h-5 w-5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </>
              );

              const className = `w-full flex items-center space-x-3 p-4 rounded-2xl text-left transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`;
              
              return (
                <motion.div key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {item.type === 'route' ? (
                    <Link href={item.href!} className={className}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      onClick={() => setCurrentTab(item.id)}
                      className={className}
                    >
                      {content}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Resources
          </h2>
          <nav className="space-y-2">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <motion.div key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={() => setCurrentTab(item.id as 'profile')}
                    className={`w-full flex items-center space-x-3 p-4 rounded-2xl text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.label}</p>
                      <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Quick Stats Card */}
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Quick Tip
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Compare multiple models to find the best cost-efficiency ratio for your use case.
          </p>
        </GlassCard>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            LLM Calculator v2.0
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Built with ❤️ for developers
          </p>
        </div>
      </div>
      </motion.aside>
    </>
  );
}