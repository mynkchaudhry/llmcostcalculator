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
import { formatDate, formatNumber } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';

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

  const { providerOptions, filteredModels } = useMemo(() => {
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

    return {
      providerOptions: options,
      filteredModels: filtered
    };
  }, [models, searchQuery, providerFilter]);

  const handleEdit = (model: LLMModel) => {
    setEditingModel(model);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      deleteModel(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingModel(null);
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
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                options={providerOptions}
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <div className="grid gap-4">
              {filteredModels.length === 0 ? (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {searchQuery || providerFilter ? 'No Matching Models' : 'No Models Yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchQuery || providerFilter 
                      ? 'Try adjusting your search or filter to find models.' 
                      : 'Use the "Add Model" button above to get started.'}
                  </p>
                </motion.div>
              ) : (
                filteredModels.map((model) => (
                  <motion.div
                    key={`model-${model.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <GlassCard hover={false} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {model.name}
                          </h3>
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                            {model.provider}
                          </span>
                          {model.isMultiModal && (
                            <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                              Multi-modal
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 text-xs">
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 block">Input:</span>
                            <p className="font-medium text-green-400 text-xs">
                              ${model.inputPrice.toFixed(2)}/1M
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 block">Output:</span>
                            <p className="font-medium text-blue-400 text-xs">
                              ${model.outputPrice.toFixed(2)}/1M
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 block">Context:</span>
                            <p className="font-medium text-gray-900 dark:text-white text-xs">
                              {formatNumber(model.contextWindow)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 block">Updated:</span>
                            <p className="font-medium text-gray-900 dark:text-white text-xs">
                              {model.lastUpdated ? formatDate(model.lastUpdated) : 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {model.features && model.features.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1.5">
                              {model.features.slice(0, 2).map((feature) => (
                                <span
                                  key={feature}
                                  className="px-1 py-0.5 bg-green-500/20 text-green-300 rounded text-xs"
                                >
                                  {feature}
                                </span>
                              ))}
                              {model.features.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{model.features.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {model.notes && (
                          <div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{model.notes}</p>
                          </div>
                        )}
                      </div>

                        <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0 mt-3 sm:mt-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(model)}
                          className="min-w-[60px] justify-center text-xs py-1.5 px-3 flex items-center"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(model.id)}
                          className="min-w-[60px] justify-center text-xs py-1.5 px-3 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-all duration-200 flex items-center"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          <span className="text-xs">Delete</span>
                        </Button>
                        </div>
                      </div>
                  </GlassCard>
                </motion.div>
                ))
              )}
            </div>
          </AnimatePresence>
        </GlassCard>
      </motion.div>

      <ModelForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingModel={editingModel}
      />
    </motion.div>
  );
}