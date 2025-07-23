'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { useModelStore } from '@/stores/useModelStore';
import CostCalculator from '../CostCalculator';
import UsageCostEstimator from '../UsageCostEstimator';
import ComprehensiveComparison from '../ComprehensiveComparison';
import ModelManagement from '../ModelManagement';
import CostVisualization from '../CostVisualization';
import ProfilePage from '../ProfilePage';
import ComparisonHistory from '../ComparisonHistory';
import ActivityHistory from '../ActivityHistory';
import AIInfrastructureChatbot from '../AIInfrastructureChatbot';

export default function DashboardContent() {
  const { currentTab } = useAppStore();
  const { models, fetchModels } = useModelStore();

  useEffect(() => {
    // Ensure models are loaded
    if (models.length === 0) {
      fetchModels();
    }
  }, [models.length, fetchModels]);

  const renderContent = () => {
    switch (currentTab) {
      case 'calculator':
        return (
          <div className="space-y-6">
            <CostCalculator />
            <CostVisualization />
          </div>
        );
      case 'estimator':
        return <UsageCostEstimator />;
      case 'comparison':
        return <ComprehensiveComparison />;
      case 'management':
        return <ModelManagement />;
      case 'history':
        return <ComparisonHistory />;
      case 'activity':
        return <ActivityHistory />;
      case 'advisor':
        return <AIInfrastructureChatbot />;
      case 'profile':
        return <ProfilePage />;
      default:
        return (
          <div className="space-y-6">
            <CostCalculator />
            <CostVisualization />
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}