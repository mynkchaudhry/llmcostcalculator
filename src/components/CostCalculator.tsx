'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Plus, Minus } from 'lucide-react';
import { useModelStore } from '@/stores/useModelStore';
import { useCalculatorStore } from '@/stores/useCalculatorStore';
import { useUIStore } from '@/stores/useUIStore';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import AnimatedCounter from './ui/AnimatedCounter';
import { formatCurrency } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';

export default function CostCalculator() {
  const { models, fetchModels, isLoading } = useModelStore();
  const {
    selectedModel,
    inputTokens,
    outputTokens,
    calculations,
    setSelectedModel,
    setInputTokens,
    setOutputTokens,
    calculateCost,
    addToComparison,
  } = useCalculatorStore();
  const { compactMode, enableAnimations, containerMaxWidth } = useUIStore();

  useEffect(() => {
    // Ensure models are loaded - fallback to default models if needed
    if (models.length === 0) {
      fetchModels();
    }
  }, [models.length, fetchModels]);

  const [currentCalculation, setCurrentCalculation] = useState(calculateCost());

  useEffect(() => {
    setCurrentCalculation(calculateCost());
  }, [selectedModel, inputTokens, outputTokens, calculateCost]);

  const handleModelSelect = (modelId: string) => {
    if (!modelId) {
      setSelectedModel(null);
      return;
    }
    const model = models.find(m => m.id === modelId);
    setSelectedModel(model || null);
  };

  const handleAddToComparison = () => {
    if (currentCalculation) {
      addToComparison(currentCalculation);
    }
  };

  const modelOptions = [
    { value: '', label: isLoading ? 'Loading models...' : models.length === 0 ? 'No models available' : 'Select a model...' },
    ...models.map(model => ({
      value: model.id,
      label: `${model.provider} - ${model.name}`
    }))
  ];


  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <GlassCard className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              LLM Cost Calculator
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Select
                label="Select Model"
                options={modelOptions}
                value={selectedModel?.id || ''}
                onChange={(e) => handleModelSelect(e.target.value)}
                disabled={isLoading || models.length === 0}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Input Tokens"
                    type="number"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(Number(e.target.value))}
                    min="0"
                    step="100000"
                    icon={<Minus className="h-4 w-4" />}
                  />
                  <div className="mt-2 flex space-x-2">
                    {[1000000, 5000000, 10000000].map((preset) => (
                      <Button
                        key={preset}
                        variant="ghost"
                        size="sm"
                        onClick={() => setInputTokens(preset)}
                        className="text-xs"
                      >
                        {(preset / 1000000).toFixed(0)}M
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Default: 1M tokens</p>
                </div>

                <div>
                  <Input
                    label="Output Tokens"
                    type="number"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(Number(e.target.value))}
                    min="0"
                    step="100000"
                    icon={<Plus className="h-4 w-4" />}
                  />
                  <div className="mt-2 flex space-x-2">
                    {[1000000, 5000000, 10000000].map((preset) => (
                      <Button
                        key={preset}
                        variant="ghost"
                        size="sm"
                        onClick={() => setOutputTokens(preset)}
                        className="text-xs"
                      >
                        {(preset / 1000000).toFixed(0)}M
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Default: 1M tokens</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedModel && currentCalculation ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="text-center p-6 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl border border-blue-500/20">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cost</p>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      <AnimatedCounter
                        value={currentCalculation.totalCost}
                        format={(value) => formatCurrency(value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      For {((currentCalculation.inputTokens + currentCalculation.outputTokens) / 1000000).toFixed(1)}M total tokens
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>Input Cost:</span>
                        <div className="text-xs text-gray-500">
                          {(currentCalculation.inputTokens / 1000000).toFixed(1)}M tokens
                        </div>
                      </div>
                      <AnimatedCounter
                        value={currentCalculation.inputCost}
                        format={(value) => formatCurrency(value)}
                        className="font-semibold text-green-400"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>Output Cost:</span>
                        <div className="text-xs text-gray-500">
                          {(currentCalculation.outputTokens / 1000000).toFixed(1)}M tokens
                        </div>
                      </div>
                      <AnimatedCounter
                        value={currentCalculation.outputCost}
                        format={(value) => formatCurrency(value)}
                        className="font-semibold text-blue-400"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToComparison}
                    className="w-full"
                    disabled={calculations.some(calc => calc.model.id === selectedModel.id)}
                  >
                    {calculations.some(calc => calc.model.id === selectedModel.id) 
                      ? 'Already in Comparison' 
                      : 'Add to Comparison'
                    }
                  </Button>
                </motion.div>
              ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a model to calculate costs</p>
                </div>
              )}
            </div>
          </div>

          {selectedModel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Model Details</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Context Window:</span> {selectedModel.contextWindow.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Input Price:</span> 
                  <span className="text-green-400 ml-1">${selectedModel.inputPrice.toFixed(2)}/1M tokens</span>
                </div>
                <div>
                  <span className="font-medium">Output Price:</span> 
                  <span className="text-blue-400 ml-1">${selectedModel.outputPrice.toFixed(2)}/1M tokens</span>
                </div>
              </div>
              {selectedModel.features && selectedModel.features.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedModel.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}