'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Trash2, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { useCalculatorStore } from '@/stores/useCalculatorStore';
import { useAppStore } from '@/stores/useAppStore';
import { CostCalculation } from '@/types';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import AnimatedCounter from './ui/AnimatedCounter';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';

type SortField = 'model' | 'provider' | 'inputCost' | 'outputCost' | 'totalCost';
type SortDirection = 'asc' | 'desc';

export default function ComparisonTable() {
  const { calculations, removeFromComparison, clearComparisons } = useCalculatorStore();
  const { 
    sortField, 
    sortDirection, 
    setSortField, 
    setSortDirection 
  } = useAppStore();
  const [visibleColumns, setVisibleColumns] = useState({
    provider: true,
    inputCost: true,
    outputCost: true,
    totalCost: true,
    contextWindow: true,
  });

  if (calculations.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <GlassCard className="p-8 text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Comparisons Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Use the calculator above to add models for comparison
          </p>
        </GlassCard>
      </motion.div>
    );
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCalculations = [...calculations].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'model':
        aValue = a.model.name;
        bValue = b.model.name;
        break;
      case 'provider':
        aValue = a.model.provider;
        bValue = b.model.provider;
        break;
      case 'inputCost':
        aValue = a.inputCost;
        bValue = b.inputCost;
        break;
      case 'outputCost':
        aValue = a.outputCost;
        bValue = b.outputCost;
        break;
      case 'totalCost':
        aValue = a.totalCost;
        bValue = b.totalCost;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
    >
      <span>{children}</span>
      <ArrowUpDown className="h-4 w-4" />
    </button>
  );

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const cheapestTotal = Math.min(...calculations.map(calc => calc.totalCost));
  const mostExpensiveTotal = Math.max(...calculations.map(calc => calc.totalCost));

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      <motion.div variants={fadeInUp}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Cost Comparison
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Comparing {calculations.length} model{calculations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative group">
                <Button variant="secondary" size="sm">
                  <Eye className="h-4 w-4" />
                  Columns
                </Button>
                <div className="absolute right-0 mt-2 w-48 p-2 bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {Object.entries(visibleColumns).map(([key, visible]) => (
                    <label key={key} className="flex items-center space-x-2 py-1 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleColumn(key as keyof typeof visibleColumns)}
                        className="rounded"
                      />
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={clearComparisons}>
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900 dark:text-white">
                    <SortButton field="model">Model</SortButton>
                  </th>
                  {visibleColumns.provider && (
                    <th className="text-left py-3 px-2 font-semibold text-gray-900 dark:text-white">
                      <SortButton field="provider">Provider</SortButton>
                    </th>
                  )}
                  {visibleColumns.inputCost && (
                    <th className="text-right py-3 px-2 font-semibold text-gray-900 dark:text-white">
                      <SortButton field="inputCost">Input Cost</SortButton>
                    </th>
                  )}
                  {visibleColumns.outputCost && (
                    <th className="text-right py-3 px-2 font-semibold text-gray-900 dark:text-white">
                      <SortButton field="outputCost">Output Cost</SortButton>
                    </th>
                  )}
                  {visibleColumns.totalCost && (
                    <th className="text-right py-3 px-2 font-semibold text-gray-900 dark:text-white">
                      <SortButton field="totalCost">Total Cost</SortButton>
                    </th>
                  )}
                  {visibleColumns.contextWindow && (
                    <th className="text-center py-3 px-2 font-semibold text-gray-900 dark:text-white">
                      Context Window
                    </th>
                  )}
                  <th className="text-center py-3 px-2 font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCalculations.map((calculation, index) => {
                  const isCheatest = calculation.totalCost === cheapestTotal;
                  const isMostExpensive = calculation.totalCost === mostExpensiveTotal;
                  
                  return (
                    <motion.tr
                      key={calculation.model.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        border-b border-white/5 hover:bg-white/5 transition-colors
                        ${isCheatest ? 'bg-green-500/10' : ''}
                        ${isMostExpensive && calculations.length > 1 ? 'bg-red-500/10' : ''}
                      `}
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {calculation.model.name}
                            </span>
                            {isCheatest && (
                              <span className="text-xs text-green-500 font-medium">
                                Cheapest
                              </span>
                            )}
                            {isMostExpensive && calculations.length > 1 && (
                              <span className="text-xs text-red-500 font-medium">
                                Most Expensive
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {visibleColumns.provider && (
                        <td className="py-4 px-2 text-gray-600 dark:text-gray-400">
                          {calculation.model.provider}
                        </td>
                      )}
                      
                      {visibleColumns.inputCost && (
                        <td className="py-4 px-2 text-right font-mono">
                          <AnimatedCounter
                            value={calculation.inputCost}
                            format={(value) => formatCurrency(value)}
                            className="text-gray-900 dark:text-white"
                          />
                          <div className="text-xs text-gray-500">
                            {formatPercentage(calculation.inputCost, calculation.totalCost)}
                          </div>
                        </td>
                      )}
                      
                      {visibleColumns.outputCost && (
                        <td className="py-4 px-2 text-right font-mono">
                          <AnimatedCounter
                            value={calculation.outputCost}
                            format={(value) => formatCurrency(value)}
                            className="text-gray-900 dark:text-white"
                          />
                          <div className="text-xs text-gray-500">
                            {formatPercentage(calculation.outputCost, calculation.totalCost)}
                          </div>
                        </td>
                      )}
                      
                      {visibleColumns.totalCost && (
                        <td className="py-4 px-2 text-right">
                          <div className="font-bold text-lg">
                            <AnimatedCounter
                              value={calculation.totalCost}
                              format={(value) => formatCurrency(value)}
                              className={`${isCheatest ? 'text-green-500' : isMostExpensive && calculations.length > 1 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {((calculation.inputTokens + calculation.outputTokens) / 1000000).toFixed(1)}M tokens total
                          </div>
                        </td>
                      )}
                      
                      {visibleColumns.contextWindow && (
                        <td className="py-4 px-2 text-center text-gray-600 dark:text-gray-400">
                          {formatNumber(calculation.model.contextWindow)}
                        </td>
                      )}
                      
                      <td className="py-4 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromComparison(calculation.model.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {calculations.length > 1 && (
            <motion.div
              variants={fadeInUp}
              className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl border border-blue-500/20"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Stats</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Price Range: </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(cheapestTotal)} - {formatCurrency(mostExpensiveTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Average Cost: </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(calculations.reduce((sum, calc) => sum + calc.totalCost, 0) / calculations.length)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Savings vs Most Expensive: </span>
                  <span className="font-semibold text-green-500">
                    {formatCurrency(mostExpensiveTotal - cheapestTotal)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}