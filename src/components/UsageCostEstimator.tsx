'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  DollarSign,
  Info,
  BarChart3,
  Calendar,
  Zap,
  History,
  Users,
  Download
} from 'lucide-react';
import { useModelStore } from '@/stores/useModelStore';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import AnimatedCounter from './ui/AnimatedCounter';
import { formatCurrency } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';
import { exportUsageEstimateToPDF, type UsageEstimateExportData } from '@/utils/pdfExport';

interface UsageParams {
  queriesPerDay: number;
  inputTokensPerQuery: number;
  outputTokensPerQuery: number;
  conversationHistoryTokens: number;
}

interface CostBreakdown {
  totalInputTokensPerDay: number;
  totalOutputTokensPerDay: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  inputCostPerDay: number;
  outputCostPerDay: number;
}

interface ScenarioComparison {
  withoutHistory: CostBreakdown;
  withHistory: CostBreakdown;
  savings: {
    daily: number;
    monthly: number;
    yearly: number;
  };
}

export default function UsageCostEstimator() {
  const { models, fetchModels, isLoading } = useModelStore();
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [usageParams, setUsageParams] = useState<UsageParams>({
    queriesPerDay: 100,
    inputTokensPerQuery: 1200,
    outputTokensPerQuery: 800,
    conversationHistoryTokens: 0,
  });
  const [showHistoryImpact, setShowHistoryImpact] = useState(false);

  useEffect(() => {
    if (models.length === 0) {
      fetchModels();
    }
  }, [models.length, fetchModels]);

  const selectedModel = useMemo(() => {
    return models.find(m => m.id === selectedModelId);
  }, [models, selectedModelId]);

  const calculateCostBreakdown = (params: UsageParams, includeHistory: boolean = true): CostBreakdown => {
    if (!selectedModel) {
      return {
        totalInputTokensPerDay: 0,
        totalOutputTokensPerDay: 0,
        dailyCost: 0,
        monthlyCost: 0,
        yearlyCost: 0,
        inputCostPerDay: 0,
        outputCostPerDay: 0,
      };
    }

    const inputTokensPerQuery = params.inputTokensPerQuery + (includeHistory ? params.conversationHistoryTokens : 0);
    const totalInputTokensPerDay = inputTokensPerQuery * params.queriesPerDay;
    const totalOutputTokensPerDay = params.outputTokensPerQuery * params.queriesPerDay;

    const inputCostPerDay = (totalInputTokensPerDay / 1000000) * selectedModel.inputPrice;
    const outputCostPerDay = (totalOutputTokensPerDay / 1000000) * selectedModel.outputPrice;
    const dailyCost = inputCostPerDay + outputCostPerDay;

    return {
      totalInputTokensPerDay,
      totalOutputTokensPerDay,
      dailyCost,
      monthlyCost: dailyCost * 30,
      yearlyCost: dailyCost * 365,
      inputCostPerDay,
      outputCostPerDay,
    };
  };

  const scenarioComparison: ScenarioComparison = useMemo(() => {
    const withoutHistory = calculateCostBreakdown(usageParams, false);
    const withHistory = calculateCostBreakdown(usageParams, true);
    
    return {
      withoutHistory,
      withHistory,
      savings: {
        daily: withHistory.dailyCost - withoutHistory.dailyCost,
        monthly: withHistory.monthlyCost - withoutHistory.monthlyCost,
        yearly: withHistory.yearlyCost - withoutHistory.yearlyCost,
      }
    };
  }, [usageParams, selectedModel, calculateCostBreakdown]);

  const modelOptions = [
    { value: '', label: isLoading ? 'Loading models...' : models.length === 0 ? 'No models available' : 'Select a model...' },
    ...models.map(model => ({
      value: model.id,
      label: `${model.provider} - ${model.name}`
    }))
  ];

  const updateParam = (key: keyof UsageParams, value: number) => {
    setUsageParams(prev => ({ ...prev, [key]: value }));
  };

  const presetScenarios = [
    { label: 'Startup', queries: 50, input: 800, output: 600, history: 0 },
    { label: 'Small Team', queries: 100, input: 1200, output: 800, history: 600 },
    { label: 'Enterprise', queries: 1000, input: 2000, output: 1200, history: 1500 },
    { label: 'High Volume', queries: 5000, input: 1500, output: 1000, history: 800 },
  ];

  const applyPreset = (preset: typeof presetScenarios[0]) => {
    setUsageParams({
      queriesPerDay: preset.queries,
      inputTokensPerQuery: preset.input,
      outputTokensPerQuery: preset.output,
      conversationHistoryTokens: preset.history,
    });
    if (preset.history > 0) {
      setShowHistoryImpact(true);
    }
  };

  const exportEstimateToPDF = async () => {
    if (!selectedModel) return;

    try {
      const exportData: UsageEstimateExportData = {
        model: selectedModel,
        queriesPerDay: usageParams.queriesPerDay,
        inputTokensPerQuery: usageParams.inputTokensPerQuery,
        outputTokensPerQuery: usageParams.outputTokensPerQuery,
        conversationHistoryTokens: usageParams.conversationHistoryTokens,
        dailyCost: scenarioComparison.withHistory.dailyCost,
        monthlyCost: scenarioComparison.withHistory.monthlyCost,
        yearlyCost: scenarioComparison.withHistory.yearlyCost,
        withHistoryCosts: usageParams.conversationHistoryTokens > 0 ? {
          dailyCost: scenarioComparison.withHistory.dailyCost,
          monthlyCost: scenarioComparison.withHistory.monthlyCost,
          yearlyCost: scenarioComparison.withHistory.yearlyCost
        } : undefined
      };

      await exportUsageEstimateToPDF(exportData);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export PDF. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-blue-600">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Usage Cost Estimator
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Calculate real-world operational costs with conversation history impact
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={exportEstimateToPDF}
                variant="secondary"
                className="flex items-center space-x-2"
                disabled={!selectedModel}
              >
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </Button>
              <Button
                onClick={() => setShowHistoryImpact(!showHistoryImpact)}
                variant={showHistoryImpact ? "primary" : "secondary"}
                className="flex items-center space-x-2"
              >
                <History className="h-4 w-4" />
                <span>History Impact</span>
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Configuration Panel */}
      <motion.div variants={fadeInUp}>
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-blue-400" />
            Usage Configuration
          </h3>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Model Selection & Presets */}
            <div className="space-y-4">
              <Select
                label="Select Model"
                options={modelOptions}
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                disabled={isLoading || models.length === 0}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetScenarios.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="text-left p-3 h-auto"
                    >
                      <div>
                        <div className="font-medium text-sm">{preset.label}</div>
                        <div className="text-xs text-gray-500">
                          {preset.queries} queries/day
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Parameters */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Queries per Day"
                  type="number"
                  value={usageParams.queriesPerDay}
                  onChange={(e) => updateParam('queriesPerDay', Number(e.target.value))}
                  min="1"
                  icon={<Users className="h-4 w-4" />}
                />
                <Input
                  label="Input Tokens per Query"
                  type="number"
                  value={usageParams.inputTokensPerQuery}
                  onChange={(e) => updateParam('inputTokensPerQuery', Number(e.target.value))}
                  min="1"
                  icon={<MessageSquare className="h-4 w-4" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Output Tokens per Query"
                  type="number"
                  value={usageParams.outputTokensPerQuery}
                  onChange={(e) => updateParam('outputTokensPerQuery', Number(e.target.value))}
                  min="1"
                  icon={<Zap className="h-4 w-4" />}
                />
                <div className="relative">
                  <Input
                    label="Conversation History Tokens"
                    type="number"
                    value={usageParams.conversationHistoryTokens}
                    onChange={(e) => updateParam('conversationHistoryTokens', Number(e.target.value))}
                    min="0"
                    icon={<History className="h-4 w-4" />}
                  />
                  <div className="absolute -top-1 -right-1">
                    <button className="p-1 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                      <Info className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Cost Breakdown */}
      {selectedModel && (
        <motion.div variants={fadeInUp}>
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-400" />
              Cost Analysis
            </h3>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Daily */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl border border-blue-500/20">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Cost</p>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  <AnimatedCounter
                    value={scenarioComparison.withHistory.dailyCost}
                    format={(value) => formatCurrency(value)}
                  />
                </div>
              </div>

              {/* Monthly */}
              <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-blue-600/10 rounded-2xl border border-green-500/20">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Cost</p>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  <AnimatedCounter
                    value={scenarioComparison.withHistory.monthlyCost}
                    format={(value) => formatCurrency(value)}
                  />
                </div>
              </div>

              {/* Yearly */}
              <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-600/10 rounded-2xl border border-purple-500/20">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Yearly Cost</p>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  <AnimatedCounter
                    value={scenarioComparison.withHistory.yearlyCost}
                    format={(value) => formatCurrency(value)}
                  />
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Token Usage (Daily)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Input Tokens:</span>
                    <span className="font-semibold text-green-400">
                      {scenarioComparison.withHistory.totalInputTokensPerDay.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Output Tokens:</span>
                    <span className="font-semibold text-blue-400">
                      {scenarioComparison.withHistory.totalOutputTokensPerDay.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Queries per Day:</span>
                    <span className="font-semibold text-purple-400">
                      {usageParams.queriesPerDay.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Cost Components (Daily)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Input Cost:</span>
                    <span className="font-semibold text-green-400">
                      {formatCurrency(scenarioComparison.withHistory.inputCostPerDay)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Output Cost:</span>
                    <span className="font-semibold text-blue-400">
                      {formatCurrency(scenarioComparison.withHistory.outputCostPerDay)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Daily:</span>
                    <span className="font-bold text-purple-400">
                      {formatCurrency(scenarioComparison.withHistory.dailyCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Conversation History Impact */}
      {showHistoryImpact && selectedModel && usageParams.conversationHistoryTokens > 0 && (
        <motion.div
          variants={fadeInUp}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-orange-400" />
              Conversation History Impact
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Scenario</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Input Tokens/Day</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Output Tokens/Day</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Daily Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Monthly Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">Yearly Cost</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-900 dark:text-white">Without History</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {scenarioComparison.withoutHistory.totalInputTokensPerDay.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {scenarioComparison.withoutHistory.totalOutputTokensPerDay.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-green-400">
                      {formatCurrency(scenarioComparison.withoutHistory.dailyCost)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-green-400">
                      {formatCurrency(scenarioComparison.withoutHistory.monthlyCost)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-green-400">
                      {formatCurrency(scenarioComparison.withoutHistory.yearlyCost)}
                    </td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-900 dark:text-white">With History (+{usageParams.conversationHistoryTokens} tokens)</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {scenarioComparison.withHistory.totalInputTokensPerDay.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {scenarioComparison.withHistory.totalOutputTokensPerDay.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-red-400">
                      {formatCurrency(scenarioComparison.withHistory.dailyCost)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-red-400">
                      {formatCurrency(scenarioComparison.withHistory.monthlyCost)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-red-400">
                      {formatCurrency(scenarioComparison.withHistory.yearlyCost)}
                    </td>
                  </tr>
                  <tr className="bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm font-semibold text-orange-400">Additional Cost</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-orange-400 font-semibold">
                      +{(scenarioComparison.withHistory.totalInputTokensPerDay - scenarioComparison.withoutHistory.totalInputTokensPerDay).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-gray-500">
                      -
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-bold text-orange-400">
                      +{formatCurrency(scenarioComparison.savings.daily)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-bold text-orange-400">
                      +{formatCurrency(scenarioComparison.savings.monthly)}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-bold text-orange-400">
                      +{formatCurrency(scenarioComparison.savings.yearly)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-orange-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-400 mb-1">Conversation History Impact</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adding {usageParams.conversationHistoryTokens} history tokens per query increases your yearly costs by{' '}
                    <span className="font-semibold text-orange-400">{formatCurrency(scenarioComparison.savings.yearly)}</span>.
                    Consider optimizing conversation history length to balance context quality with operational costs.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Model Details */}
      {selectedModel && (
        <motion.div variants={fadeInUp}>
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-400" />
              {selectedModel.name} Pricing Details
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Provider:</span> {selectedModel.provider}
              </div>
              <div>
                <span className="font-medium">Input Price:</span> 
                <span className="text-green-400 ml-1">${selectedModel.inputPrice}/1M tokens</span>
              </div>
              <div>
                <span className="font-medium">Output Price:</span> 
                <span className="text-blue-400 ml-1">${selectedModel.outputPrice}/1M tokens</span>
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
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}