'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Settings } from 'lucide-react';
import { useModelStore } from '@/stores/useModelStore';
import { useAppStore } from '@/stores/useAppStore';
import { LLMModel } from '@/types';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import ModelForm from './ModelForm';
import ConfirmDialog from './ui/ConfirmDialog';
import { formatDate, formatNumber } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';
import ProviderLogo from './ProviderLogo';

export default function ModelManagement() {
  const { models, deleteModel } = useModelStore();
  const { 
    searchQuery, 
    providerFilter, 
    setSearchQuery, 
    setProviderFilter 
  } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    model: LLMModel | null;
  }>({ isOpen: false, model: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 rows x 3 columns

  const { providerOptions, filteredModels, paginatedModels, totalPages } = useMemo(() => {
    const uniqueProviders = Array.from(new Set(models.map(model => model.provider))).sort();
    const options = [
      { value: '', label: 'All Providers' },
      ...uniqueProviders.map(provider => ({ value: provider, label: provider }))
    ];

    const filtered = models.filter(model => {
      const matchesSearch = !searchQuery || 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvider = !providerFilter || model.provider === providerFilter;
      return matchesSearch && matchesProvider;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedModels = filtered.slice(startIndex, endIndex);

    return {
      providerOptions: options,
      filteredModels: filtered,
      paginatedModels,
      totalPages
    };
  }, [models, searchQuery, providerFilter, currentPage, itemsPerPage]);

  const handleEdit = (model: LLMModel) => {
    setEditingModel(model);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (model: LLMModel) => {
    setDeleteDialog({ isOpen: true, model });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.model) {
      deleteModel(deleteDialog.model.id);
      setDeleteDialog({ isOpen: false, model: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, model: null });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingModel(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  const handleFilterChange = (type: 'search' | 'provider', value: string) => {
    setCurrentPage(1);
    if (type === 'search') {
      setSearchQuery(value);
    } else {
      setProviderFilter(value);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Model Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your LLM models ({filteredModels.length} of {models.length} showing)
              </p>
            </div>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="min-w-[140px]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Model</span>
            </Button>
          </div>

          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search models or providers..."
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                options={providerOptions}
                value={providerFilter}
                onChange={(e) => handleFilterChange('provider', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedModels.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchQuery || providerFilter ? 'No Matching Models' : 'No Models Yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery || providerFilter 
                    ? 'Try adjusting your search or filter to find models.' 
                    : 'Use the "Add Model" button above to get started.'}
                </p>
              </div>
            ) : (
              paginatedModels.map((model) => (
                <motion.div
                  key={`model-${model.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <GlassCard hover className="p-4 h-full">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
                            {model.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs font-medium flex items-center space-x-1">
                              <ProviderLogo provider={model.provider} size="sm" />
                              <span>{model.provider}</span>
                            </span>
                            {model.isMultiModal && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs">
                                Multi-modal
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-green-500/10 rounded-lg p-2">
                          <span className="text-xs text-green-400 block mb-1">Input Price</span>
                          <p className="font-semibold text-green-400 text-sm">
                            ${model.inputPrice.toFixed(2)}/1M
                          </p>
                        </div>
                        <div className="bg-blue-500/10 rounded-lg p-2">
                          <span className="text-xs text-blue-400 block mb-1">Output Price</span>
                          <p className="font-semibold text-blue-400 text-sm">
                            ${model.outputPrice.toFixed(2)}/1M
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block mb-1">Context Window</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatNumber(model.contextWindow)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block mb-1">Last Updated</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {model.lastUpdated ? formatDate(model.lastUpdated) : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      {model.features && model.features.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {model.features.slice(0, 3).map((feature) => (
                              <span
                                key={feature}
                                className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs"
                              >
                                {feature}
                              </span>
                            ))}
                            {model.features.length > 3 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{model.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {model.notes && (
                        <div className="mb-3 flex-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {model.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 mt-auto pt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(model)}
                          className="flex-1 justify-center"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(model)}
                          className="flex-1 justify-center bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10 h-10 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Results Summary */}
          {filteredModels.length > 0 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredModels.length)} of {filteredModels.length} models
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>

      <ModelForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingModel={editingModel}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Model"
        message={`Are you sure you want to delete "${deleteDialog.model?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
}