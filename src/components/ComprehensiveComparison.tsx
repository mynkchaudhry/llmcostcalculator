'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle,
  Zap,
  DollarSign,
  Clock,
  Eye,
  RefreshCw,
  Info
} from 'lucide-react';
import { useCalculatorStore } from '@/stores/useCalculatorStore';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import AnimatedCounter from './ui/AnimatedCounter';
import ComparisonTable from './ComparisonTable';
import AdvancedCharts from './AdvancedCharts';
import ModelRecommendations from './ModelRecommendations';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';
import { exportComparisonToPDF, type ComparisonExportData } from '@/utils/pdfExport';

interface ComparisonInsight {
  type: 'best' | 'worst' | 'warning' | 'info';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export default function ComprehensiveComparison() {
  const { calculations, clearComparisons } = useCalculatorStore();
  const [activeView, setActiveView] = useState<'table' | 'charts' | 'insights'>('table');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  const analysisData = useMemo(() => {
    if (calculations.length === 0) return null;

    const costs = calculations.map(calc => calc.totalCost);
    const inputCosts = calculations.map(calc => calc.inputCost);
    const outputCosts = calculations.map(calc => calc.outputCost);
    
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    const medianCost = [...costs].sort((a, b) => a - b)[Math.floor(costs.length / 2)];
    
    const cheapestModel = calculations.find(calc => calc.totalCost === minCost);
    const mostExpensiveModel = calculations.find(calc => calc.totalCost === maxCost);
    
    const totalTokens = calculations.reduce((sum, calc) => sum + calc.inputTokens + calc.outputTokens, 0);
    const avgTokensPerModel = totalTokens / calculations.length;
    
    // Calculate efficiency metrics
    const efficiencyScores = calculations.map(calc => ({
      model: calc.model,
      costPerToken: calc.totalCost / (calc.inputTokens + calc.outputTokens),
      contextWindowValue: calc.model.contextWindow / calc.totalCost,
      calculation: calc
    }));

    return {
      minCost,
      maxCost,
      avgCost,
      medianCost,
      cheapestModel,
      mostExpensiveModel,
      totalTokens,
      avgTokensPerModel,
      costVariance: maxCost - minCost,
      costVariancePercentage: ((maxCost - minCost) / minCost) * 100,
      efficiencyScores
    };
  }, [calculations]);

  const insights = useMemo((): ComparisonInsight[] => {
    if (!analysisData || calculations.length === 0) return [];

    const insights: ComparisonInsight[] = [];

    // Best value insight
    if (analysisData.cheapestModel) {
      insights.push({
        type: 'best',
        title: 'Best Value',
        description: `${analysisData.cheapestModel.model.provider} ${analysisData.cheapestModel.model.name} offers the lowest cost at ${formatCurrency(analysisData.cheapestModel.totalCost)}`,
        icon: Award,
        color: 'text-green-500'
      });
    }

    // High cost variance warning
    if (analysisData.costVariancePercentage > 200) {
      insights.push({
        type: 'warning',
        title: 'High Cost Variance',
        description: `There's a ${analysisData.costVariancePercentage.toFixed(1)}% difference between cheapest and most expensive models`,
        icon: AlertTriangle,
        color: 'text-yellow-500'
      });
    }

    // Performance insight
    const highContextModels = calculations.filter(calc => calc.model.contextWindow > 100000);
    if (highContextModels.length > 0) {
      insights.push({
        type: 'info',
        title: 'High Context Models',
        description: `${highContextModels.length} model(s) support 100K+ context window for complex tasks`,
        icon: Zap,
        color: 'text-blue-500'
      });
    }

    // Efficiency insight
    if (analysisData.efficiencyScores.length > 1) {
      const mostEfficient = analysisData.efficiencyScores.reduce((prev, current) => 
        prev.costPerToken < current.costPerToken ? prev : current
      );
      insights.push({
        type: 'best',
        title: 'Most Efficient',
        description: `${mostEfficient.model.provider} ${mostEfficient.model.name} has the lowest cost per token ratio`,
        icon: TrendingUp,
        color: 'text-green-500'
      });
    }

    return insights;
  }, [analysisData, calculations]);

  const exportToPDF = async () => {
    if (calculations.length === 0) return;

    try {
      const inputTokens = calculations[0]?.inputTokens || 0;
      const outputTokens = calculations[0]?.outputTokens || 0;
      const totalTokens = inputTokens + outputTokens;

      const exportData: ComparisonExportData = {
        calculations,
        inputTokens,
        outputTokens,
        totalTokens
      };

      await exportComparisonToPDF(exportData);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export PDF. Please try again.';
      alert(errorMessage);
    }
  };

  if (calculations.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <GlassCard className="p-12 text-center">
          <BarChart3 className="h-20 w-20 mx-auto mb-6 text-gray-400 opacity-50" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Comparison
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add models from the calculator to begin comprehensive cost analysis and comparison
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Smart Recommendations</span>
            </div>
          </div>
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
      {/* Header with Controls */}
      <motion.div variants={fadeInUp}>
        <GlassCard className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Comprehensive Comparison
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Analyzing {calculations.length} model{calculations.length !== 1 ? 's' : ''} • 
                {analysisData && ` ${((analysisData.totalTokens) / 1000000).toFixed(1)}M total tokens`}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-white/5 rounded-2xl p-1">
                {[
                  { id: 'table', label: 'Table', icon: BarChart3 },
                  { id: 'charts', label: 'Charts', icon: TrendingUp },
                  { id: 'insights', label: 'Insights', icon: Award }
                ].map(view => {
                  const Icon = view.icon;
                  return (
                    <Button
                      key={view.id}
                      variant={activeView === view.id ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveView(view.id as any)}
                      className="relative"
                    >
                      <Icon className="h-4 w-4" />
                      {view.label}
                    </Button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
              >
                <Eye className="h-4 w-4" />
                {showAdvancedMetrics ? 'Simple' : 'Advanced'} View
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={exportToPDF}
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearComparisons}
                className="text-red-400 hover:text-red-300"
              >
                <RefreshCw className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Stats */}
      {analysisData && (
        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-400" />
              <p className="text-sm text-gray-400 mb-1">Cheapest</p>
              <AnimatedCounter
                value={analysisData.minCost}
                format={formatCurrency}
                className="text-lg font-bold text-green-400"
              />
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-400" />
              <p className="text-sm text-gray-400 mb-1">Average</p>
              <AnimatedCounter
                value={analysisData.avgCost}
                format={formatCurrency}
                className="text-lg font-bold text-blue-400"
              />
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-400" />
              <p className="text-sm text-gray-400 mb-1">Most Expensive</p>
              <AnimatedCounter
                value={analysisData.maxCost}
                format={formatCurrency}
                className="text-lg font-bold text-red-400"
              />
            </GlassCard>
            
            <GlassCard className="p-4 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-sm text-gray-400 mb-1">Variance</p>
              <AnimatedCounter
                value={analysisData.costVariance}
                format={formatCurrency}
                className="text-lg font-bold text-yellow-400"
              />
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div variants={fadeInUp}>
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-5 w-5 text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Insights</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-4 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <Icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {insight.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'table' && (
            <ComparisonTable />
          )}
          
          {activeView === 'charts' && (
            <AdvancedCharts calculations={calculations} />
          )}
          
          {activeView === 'insights' && analysisData && (
            <motion.div variants={stagger} className="space-y-6">
              {/* Recommendations */}
              <ModelRecommendations calculations={calculations} />
              
              <GlassCard className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Detailed Analysis
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Cost Distribution */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Cost Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Minimum:</span>
                        <span className="font-mono text-green-400">{formatCurrency(analysisData.minCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Median:</span>
                        <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(analysisData.medianCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Average:</span>
                        <span className="font-mono text-blue-400">{formatCurrency(analysisData.avgCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Maximum:</span>
                        <span className="font-mono text-red-400">{formatCurrency(analysisData.maxCost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Rankings */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Efficiency Ranking</h4>
                    <div className="space-y-2">
                      {analysisData.efficiencyScores
                        .sort((a, b) => a.costPerToken - b.costPerToken)
                        .slice(0, 5)
                        .map((score, index) => (
                          <div key={score.model.id} className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-green-500 text-white' :
                              index === 1 ? 'bg-blue-500 text-white' :
                              index === 2 ? 'bg-purple-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white flex-1">
                              {score.model.provider} {score.model.name}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {formatCurrency(score.costPerToken * 1000000)}/1M tokens
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}