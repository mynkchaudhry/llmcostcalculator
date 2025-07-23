'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Settings,
  User,
  LogIn,
  LogOut,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Trash2,
  Filter,
  Search,
  Calendar,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useActivityStore } from '@/stores/useActivityStore';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import ConfirmDialog from './ui/ConfirmDialog';
import ProviderLogo from './ProviderLogo';
import { formatCurrency, formatNumber } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';

const activityIcons = {
  calculator: Calculator,
  estimator: TrendingUp,
  comparison: BarChart3,
  model_management: Settings,
  profile_update: User,
  login: LogIn,
  logout: LogOut,
};

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const typeColors = {
  calculator: 'text-blue-400 bg-blue-500/20',
  estimator: 'text-green-400 bg-green-500/20',
  comparison: 'text-purple-400 bg-purple-500/20',
  model_management: 'text-orange-400 bg-orange-500/20',
  profile_update: 'text-pink-400 bg-pink-500/20',
  login: 'text-emerald-400 bg-emerald-500/20',
  logout: 'text-red-400 bg-red-500/20',
};

export default function ActivityHistory() {
  const { 
    activities, 
    analytics,
    isLoading, 
    error, 
    pagination,
    filters,
    fetchActivities, 
    fetchAnalytics,
    deleteActivity,
    clearActivities,
    setFilters,
    clearError 
  } = useActivityStore();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    activityId: string | null;
    activityType: string;
  }>({ isOpen: false, activityId: null, activityType: '' });
  const [clearAllDialog, setClearAllDialog] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  useEffect(() => {
    fetchActivities();
    fetchAnalytics();
  }, [fetchActivities, fetchAnalytics]);

  const handlePageChange = (page: number) => {
    fetchActivities(page, pagination.limit);
  };

  const handleDeleteClick = (id: string, type: string) => {
    setDeleteDialog({ isOpen: true, activityId: id, activityType: type });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.activityId) {
      await deleteActivity(deleteDialog.activityId);
      setDeleteDialog({ isOpen: false, activityId: null, activityType: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, activityId: null, activityType: '' });
  };

  const handleClearAllClick = () => {
    setClearAllDialog(true);
  };

  const handleClearAllConfirm = async () => {
    await clearActivities();
    setClearAllDialog(false);
  };

  const handleClearAllCancel = () => {
    setClearAllDialog(false);
  };

  const applyFilters = () => {
    setFilters({
      type: localFilters.type || undefined,
      startDate: localFilters.startDate || undefined,
      endDate: localFilters.endDate || undefined,
    });
  };

  const resetFilters = () => {
    setLocalFilters({ type: '', startDate: '', endDate: '', search: '' });
    setFilters({});
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.type) {
      case 'calculator':
        return `Calculated cost for ${activity.details.calculator?.modelName} (${activity.details.calculator?.provider})`;
      case 'estimator':
        return `Estimated usage for ${activity.details.estimator?.selectedModel?.name}`;
      case 'comparison':
        return `Compared ${activity.details.comparison?.models?.length || 0} models`;
      case 'model_management':
        return `${activity.details.modelManagement?.action} model: ${activity.details.modelManagement?.modelName}`;
      case 'profile_update':
        return 'Updated profile settings';
      case 'login':
        return 'Logged in';
      case 'logout':
        return 'Logged out';
      default:
        return activity.action;
    }
  };

  const renderActivityDetails = (activity: any) => {
    switch (activity.type) {
      case 'calculator':
        const calc = activity.details.calculator;
        if (!calc) return null;
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Model:</span>
              <div className="flex items-center space-x-2 mt-1">
                <ProviderLogo provider={calc.provider} size="sm" />
                <span>{calc.modelName}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Total Cost:</span>
              <p className="font-semibold text-green-400 mt-1">
                {formatCurrency(calc.totalCost)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Input Tokens:</span>
              <p className="mt-1">{formatNumber(calc.inputTokens)}</p>
            </div>
            <div>
              <span className="text-gray-500">Output Tokens:</span>
              <p className="mt-1">{formatNumber(calc.outputTokens)}</p>
            </div>
          </div>
        );

      case 'estimator':
        const est = activity.details.estimator;
        if (!est) return null;
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Model:</span>
              <div className="flex items-center space-x-2 mt-1">
                <ProviderLogo provider={est.selectedModel.provider} size="sm" />
                <span>{est.selectedModel.name}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-500">Daily Requests:</span>
              <p className="mt-1">{formatNumber(est.usage.dailyRequests)}</p>
            </div>
            <div>
              <span className="text-gray-500">Monthly Cost:</span>
              <p className="font-semibold text-green-400 mt-1">
                {formatCurrency(est.results.monthlyCost)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Timeframe:</span>
              <p className="mt-1">{est.timeframe} days</p>
            </div>
          </div>
        );

      case 'comparison':
        const comp = activity.details.comparison;
        if (!comp) return null;
        return (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Models Compared:</span>
              <p className="mt-1">{comp.models?.join(', ')}</p>
            </div>
            <div>
              <span className="text-gray-500">Total Cost:</span>
              <p className="font-semibold text-green-400 mt-1">
                {formatCurrency(comp.totalCost)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Cheapest:</span>
              <p className="mt-1 text-green-400">{comp.cheapestModel}</p>
            </div>
            <div>
              <span className="text-gray-500">Most Expensive:</span>
              <p className="mt-1 text-red-400">{comp.mostExpensiveModel}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (error) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={clearError}>Try Again</Button>
      </GlassCard>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Activity History
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Complete log of your interactions and usage
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchActivities()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {activities.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllClick}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      {analytics && (
        <motion.div variants={fadeInUp}>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.totalActivities}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Activities</p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Calculator className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.totalCalculations}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calculations</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.totalEstimations}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimations</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.totalComparisons}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comparisons</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {showFilters && (
        <motion.div variants={fadeInUp}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filter Activities
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <Select
                label="Activity Type"
                value={localFilters.type}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, type: e.target.value }))}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'calculator', label: 'Calculator' },
                  { value: 'estimator', label: 'Estimator' },
                  { value: 'comparison', label: 'Comparison' },
                  { value: 'model_management', label: 'Model Management' },
                  { value: 'login', label: 'Login/Logout' },
                ]}
              />
              <Input
                label="Start Date"
                type="date"
                value={localFilters.startDate}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                label="End Date"
                type="date"
                value={localFilters.endDate}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
              <div className="flex items-end space-x-2">
                <Button onClick={applyFilters}>Apply</Button>
                <Button variant="secondary" onClick={resetFilters}>Reset</Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Activities List */}
      {isLoading && activities.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading activities...</p>
        </GlassCard>
      ) : activities.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <GlassCard className="p-8 text-center">
            <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Activities Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start using the calculator and estimator to see your activity history
            </p>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || Activity;
            const DeviceIcon = deviceIcons[activity.metadata?.device?.type as keyof typeof deviceIcons] || Monitor;
            const colorClasses = typeColors[activity.type as keyof typeof typeColors] || 'text-gray-400 bg-gray-500/20';
            
            return (
              <motion.div
                key={activity._id}
                variants={fadeInUp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${colorClasses}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getActivityDescription(activity)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses.split(' ')[1]} ${colorClasses.split(' ')[0]}`}>
                            {activity.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(activity.timestamp).toLocaleString()}</span>
                          </div>
                          {activity.metadata?.device && (
                            <div className="flex items-center space-x-1">
                              <DeviceIcon className="h-4 w-4" />
                              <span>{activity.metadata.device.type}</span>
                            </div>
                          )}
                          {activity.metadata?.duration && (
                            <div className="flex items-center space-x-1">
                              <span>{(activity.metadata.duration / 1000).toFixed(1)}s</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(activity._id)}
                      >
                        {expandedId === activity._id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(activity._id, activity.type)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {expandedId === activity._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 pt-4"
                    >
                      {renderActivityDetails(activity)}
                      
                      {activity.metadata && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Metadata
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                            {activity.metadata.device && (
                              <>
                                <div>
                                  <span>OS:</span> {activity.metadata.device.os || 'Unknown'}
                                </div>
                                <div>
                                  <span>Browser:</span> {activity.metadata.device.browser || 'Unknown'}
                                </div>
                              </>
                            )}
                            <div>
                              <span>IP:</span> {activity.metadata.ipAddress || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <motion.div variants={fadeInUp} className="flex justify-center space-x-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </motion.div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity"
        message={`Are you sure you want to delete this ${deleteDialog.activityType} activity? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={clearAllDialog}
        onClose={handleClearAllCancel}
        onConfirm={handleClearAllConfirm}
        title="Clear All Activities"
        message="Are you sure you want to clear all activities? This action cannot be undone and will permanently delete your entire activity history."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
}