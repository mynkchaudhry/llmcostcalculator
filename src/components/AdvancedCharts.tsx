'use client';

import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Legend
} from 'recharts';
import { CostCalculation } from '@/types';
import GlassCard from './ui/GlassCard';
import { formatCurrency } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';

interface AdvancedChartsProps {
  calculations: CostCalculation[];
}

const CHART_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', 
  '#10B981', '#EF4444', '#6366F1', '#84CC16'
];

export default function AdvancedCharts({ calculations }: AdvancedChartsProps) {
  // Prepare data for different chart types
  const costComparisonData = calculations.map((calc, index) => ({
    name: `${calc.model.provider}\n${calc.model.name}`,
    shortName: calc.model.name,
    provider: calc.model.provider,
    inputCost: calc.inputCost,
    outputCost: calc.outputCost,
    totalCost: calc.totalCost,
    contextWindow: calc.model.contextWindow,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const pieData = calculations.map((calc, index) => ({
    name: `${calc.model.provider} ${calc.model.name}`,
    value: calc.totalCost,
    percentage: (calc.totalCost / calculations.reduce((sum, c) => sum + c.totalCost, 0)) * 100,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const efficiencyData = calculations.map((calc, index) => ({
    name: calc.model.name,
    provider: calc.model.provider,
    costPerToken: (calc.totalCost / (calc.inputTokens + calc.outputTokens)) * 1000000, // Cost per 1M tokens
    contextWindow: calc.model.contextWindow,
    totalCost: calc.totalCost,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-white/20">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-300">
                {entry.dataKey}: {
                  entry.dataKey.includes('Cost') || entry.dataKey.includes('cost') 
                    ? formatCurrency(entry.value)
                    : entry.value.toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-xl border border-white/20">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-sm text-gray-300">
            Cost: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-300">
            Share: {data.payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Cost Breakdown Bar Chart */}
      <motion.div variants={fadeInUp}>
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Cost Breakdown Analysis
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="shortName" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(3)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="inputCost" 
                  name="Input Cost"
                  fill="#10B981"
                  radius={[0, 0, 4, 4]}
                />
                <Bar 
                  dataKey="outputCost" 
                  name="Output Cost"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost Distribution Pie Chart */}
        <motion.div variants={fadeInUp}>
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Cost Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-400 flex-1 truncate">
                    {entry.name}
                  </span>
                  <span className="font-mono text-white">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Efficiency Scatter Plot */}
        <motion.div variants={fadeInUp}>
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Cost vs Context Window
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="contextWindow" 
                    type="number"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    name="Context Window"
                  />
                  <YAxis 
                    dataKey="totalCost"
                    type="number"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(3)}`}
                    name="Total Cost"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter 
                    data={efficiencyData} 
                    fill="#8884d8"
                  >
                    {efficiencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Cost Efficiency Ranking */}
      <motion.div variants={fadeInUp}>
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Cost Efficiency Ranking
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={efficiencyData.sort((a, b) => a.costPerToken - b.costPerToken)}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 p-3 rounded-lg shadow-xl border border-white/20">
                          <p className="text-white font-semibold">{label}</p>
                          <p className="text-sm text-gray-300">
                            Cost per 1M tokens: {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="costPerToken" 
                  name="Cost per 1M Tokens"
                  radius={[4, 4, 0, 0]}
                >
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}