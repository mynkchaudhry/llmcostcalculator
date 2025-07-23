'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  ChevronRight,
  Tag,
  Clock,
  BarChart3
} from 'lucide-react';
import { useHistoryStore } from '@/stores/useHistoryStore';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';
import AnimatedCounter from './ui/AnimatedCounter';
import ProviderLogo from './ProviderLogo';
import { formatCurrency, formatNumber } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';

export default function ComparisonHistory() {
  const { 
    history, 
    pagination, 
    isLoading, 
    error, 
    fetchHistory, 
    deleteHistoryEntry,
    clearError 
  } = useHistoryStore();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(30);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    entryId: string | null;
    entryTitle: string;
  }>({ isOpen: false, entryId: null, entryTitle: '' });

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handlePageChange = (page: number) => {
    fetchHistory(page, pagination.limit);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDialog({ isOpen: true, entryId: id, entryTitle: title });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.entryId) {
      await deleteHistoryEntry(deleteDialog.entryId);
      setDeleteDialog({ isOpen: false, entryId: null, entryTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, entryId: null, entryTitle: '' });
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (error) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={clearError}>Try Again</Button>
      </GlassCard>
    );
  }

  if (isLoading && history.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading history...</p>
      </GlassCard>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <GlassCard className="p-8 text-center">
          <History className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Comparison History
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your comparison history will appear here once you save comparisons
          </p>
        </GlassCard>
      </motion.div>
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
              Comparison History
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              View and analyze your past model comparisons
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
              className="rounded-xl border-0 bg-white/10 backdrop-blur-md px-4 py-2 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div variants={stagger} className="space-y-4">
        {history.map((entry, index) => (
          <motion.div
            key={entry._id}
            variants={fadeInUp}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {entry.metadata.title || `Comparison on ${new Date(entry.createdAt).toLocaleDateString()}`}
                    </h3>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                      {entry.comparisons.length} models
                    </span>
                  </div>
                  
                  {entry.metadata.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {entry.metadata.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Total: {formatCurrency(entry.metadata.totalCost)}</span>
                    </div>
                  </div>

                  {entry.metadata.tags && entry.metadata.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      {entry.metadata.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(entry._id)}
                  >
                    <Eye className="h-4 w-4" />
                    {expandedId === entry._id ? 'Hide' : 'View'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(entry._id, entry.metadata?.title || 'Comparison')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-gray-500">Lowest Cost</span>
                  </div>
                  <p className="text-sm font-semibold text-green-400">
                    {entry.metadata.lowestCostModel}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-gray-500">Average Cost</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(entry.metadata.averageCost)}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-gray-500">Total Tokens</span>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatNumber(entry.metadata.totalInputTokens + entry.metadata.totalOutputTokens)}
                  </p>
                </div>
              </div>

              {expandedId === entry._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10 pt-4 mt-4"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Compared Models
                  </h4>
                  <div className="space-y-2">
                    {entry.comparisons.map((comp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <ProviderLogo provider={comp.provider} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {comp.modelName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {comp.provider} • {formatNumber(comp.contextWindow)} tokens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(comp.totalCost)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatNumber(comp.inputTokens + comp.outputTokens)} tokens
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

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
        title="Delete Comparison"
        message={`Are you sure you want to delete "${deleteDialog.entryTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
}