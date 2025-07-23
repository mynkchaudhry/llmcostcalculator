'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, DollarSign, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { CostCalculation } from '@/types';
import GlassCard from './ui/GlassCard';
import { formatCurrency } from '@/utils/formatting';
import { fadeInUp } from '@/utils/animations';
import ProviderLogo from './ProviderLogo';

interface Recommendation {
  type: 'best-value' | 'most-efficient' | 'high-performance' | 'budget' | 'premium';
  title: string;
  model: CostCalculation;
  reason: string;
  savings?: number;
  icon: React.ElementType;
  color: string;
}

interface ModelRecommendationsProps {
  calculations: CostCalculation[];
}

export default function ModelRecommendations({ calculations }: ModelRecommendationsProps) {
  const recommendations = useMemo((): Recommendation[] => {
    if (calculations.length === 0) return [];

    const recommendations: Recommendation[] = [];
    const costs = calculations.map(calc => calc.totalCost);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);

    // Best Value (lowest cost)
    const cheapestModel = calculations.find(calc => calc.totalCost === minCost);
    if (cheapestModel) {
      const savings = maxCost - minCost;
      recommendations.push({
        type: 'best-value',
        title: 'Best Value',
        model: cheapestModel,
        reason: `Lowest total cost among compared models`,
        savings,
        icon: DollarSign,
        color: 'text-green-500'
      });
    }

    // Most Efficient (best cost per token ratio)
    const efficiencyScores = calculations.map(calc => ({
      calculation: calc,
      efficiency: calc.totalCost / (calc.inputTokens + calc.outputTokens)
    }));
    const mostEfficient = efficiencyScores.reduce((prev, current) => 
      prev.efficiency < current.efficiency ? prev : current
    );
    
    if (mostEfficient && mostEfficient.calculation !== cheapestModel) {
      recommendations.push({
        type: 'most-efficient',
        title: 'Most Efficient',
        model: mostEfficient.calculation,
        reason: 'Best cost-per-token ratio for your usage pattern',
        icon: TrendingUp,
        color: 'text-blue-500'
      });
    }

    // High Performance (largest context window)
    const highestContext = calculations.reduce((prev, current) => 
      prev.model.contextWindow > current.model.contextWindow ? prev : current
    );
    
    if (highestContext && highestContext !== cheapestModel && highestContext !== mostEfficient?.calculation) {
      recommendations.push({
        type: 'high-performance',
        title: 'High Performance',
        model: highestContext,
        reason: `Largest context window (${highestContext.model.contextWindow.toLocaleString()} tokens)`,
        icon: Zap,
        color: 'text-purple-500'
      });
    }

    // Premium Choice (most expensive but potentially most capable)
    const premiumModel = calculations.find(calc => calc.totalCost === maxCost);
    if (premiumModel && premiumModel !== highestContext && calculations.length > 2) {
      const featureCount = premiumModel.model.features?.length || 0;
      if (featureCount > 0) {
        recommendations.push({
          type: 'premium',
          title: 'Premium Choice',
          model: premiumModel,
          reason: `Most advanced features (${featureCount} capabilities)`,
          icon: Award,
          color: 'text-yellow-500'
        });
      }
    }

    // Budget Option (if there's a clear budget choice)
    const budgetThreshold = minCost * 1.5; // Within 50% of cheapest
    const budgetOptions = calculations.filter(calc => calc.totalCost <= budgetThreshold);
    if (budgetOptions.length > 1) {
      const budgetChoice = budgetOptions.find(calc => 
        calc !== cheapestModel && (calc.model.features?.length || 0) > 0
      );
      
      if (budgetChoice) {
        recommendations.push({
          type: 'budget',
          title: 'Budget Friendly',
          model: budgetChoice,
          reason: 'Good balance of features and cost',
          icon: CheckCircle,
          color: 'text-emerald-500'
        });
      }
    }

    return recommendations.slice(0, 4); // Limit to top 4 recommendations
  }, [calculations]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      <GlassCard className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Award className="h-6 w-6 text-blue-400" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Smart Recommendations
          </h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <motion.div
                key={rec.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${
                    rec.type === 'best-value' ? 'from-green-500/20 to-green-600/20' :
                    rec.type === 'most-efficient' ? 'from-blue-500/20 to-blue-600/20' :
                    rec.type === 'high-performance' ? 'from-purple-500/20 to-purple-600/20' :
                    rec.type === 'premium' ? 'from-yellow-500/20 to-yellow-600/20' :
                    'from-emerald-500/20 to-emerald-600/20'
                  }`}>
                    <Icon className={`h-6 w-6 ${rec.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold ${rec.color}`}>
                        {rec.title}
                      </h4>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(rec.model.totalCost)}
                      </span>
                    </div>
                    
                    <p className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                      <ProviderLogo provider={rec.model.model.provider} size="sm" />
                      <span>{rec.model.model.provider} {rec.model.model.name}</span>
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rec.reason}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Context:</span>
                        <div className="font-mono text-gray-900 dark:text-white">
                          {rec.model.model.contextWindow.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Features:</span>
                        <div className="font-mono text-gray-900 dark:text-white">
                          {rec.model.model.features?.length || 0}
                        </div>
                      </div>
                    </div>
                    
                    {rec.savings && rec.savings > 0 && (
                      <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-400 font-medium">
                            Save {formatCurrency(rec.savings)} vs most expensive
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-400 mb-1">
                Recommendation Notes
              </h4>
              <p className="text-sm text-gray-400">
                These recommendations are based on your current token usage pattern and the models you&apos;ve selected for comparison. 
                Consider your specific use case requirements when making your final decision.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}