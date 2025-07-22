'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCalculatorStore } from '@/stores/useCalculatorStore';
import GlassCard from './ui/GlassCard';
import { formatCurrency } from '@/utils/formatting';
import { fadeInUp } from '@/utils/animations';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

export default function CostVisualization() {
  const { calculations } = useCalculatorStore();

  if (calculations.length === 0) {
    return null;
  }

  const chartData = calculations.map((calc, index) => ({
    name: calc.model.name,
    provider: calc.model.provider,
    inputCost: calc.inputCost,
    outputCost: calc.outputCost,
    totalCost: calc.totalCost,
    color: COLORS[index % COLORS.length],
  }));

  const pieData = calculations.map((calc, index) => ({
    name: `${calc.model.provider} ${calc.model.name}`,
    value: calc.totalCost,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-xl border border-white/20">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'inputCost' && 'Input Cost: '}
              {entry.dataKey === 'outputCost' && 'Output Cost: '}
              {entry.dataKey === 'totalCost' && 'Total Cost: '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-xl border border-white/20">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-sm text-gray-300">
            Cost: {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="grid md:grid-cols-2 gap-6"
    >
      {/* Bar Chart */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Cost Breakdown
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                tickFormatter={(value) => `$${value.toFixed(4)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="inputCost" 
                fill="#3B82F6" 
                name="Input Cost"
                radius={[0, 0, 4, 4]}
              />
              <Bar 
                dataKey="outputCost" 
                fill="#8B5CF6" 
                name="Output Cost"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Pie Chart */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Cost Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 space-y-2">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400 flex-1">
                {entry.name}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}