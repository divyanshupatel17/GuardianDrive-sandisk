import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';
import type { CostProjections } from '@/types';

interface CostSavingsProps {
  data: CostProjections;
}

// Generate 12-month projection data
const generateProjectionData = (currentCost: number, savings: Record<string, number>) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month, index) => {
    const conservativeCost = currentCost + (savings.conservative / 12) * index;
    const balancedCost = currentCost - (savings.balanced / 12) * index;
    const aggressiveCost = currentCost - (savings.aggressive / 12) * index;
    
    return {
      month,
      current: currentCost,
      conservative: Math.max(0, conservativeCost),
      balanced: Math.max(0, balancedCost),
      aggressive: Math.max(0, aggressiveCost),
    };
  });
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="gd-card p-3 border border-[#00d4ff30]">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="text-white font-medium">₹{entry.value.toFixed(0)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Cost Projection Line Chart
export const CostProjectionChart: React.FC<CostSavingsProps> = ({ data }) => {
  const chartData = generateProjectionData(
    data.current_monthly_cost,
    data.projected_savings
  );

  return (
    <div className="gd-chart-container h-[350px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <TrendingDown size={18} className="text-[#00ff88]" />
          Cost Savings Projection
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff4757]" />
            Conservative
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#00d4ff]" />
            Balanced
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#00ff88]" />
            Aggressive
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4757" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ff4757" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBalanced" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAggressive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.05)" 
            vertical={false}
          />
          <XAxis 
            dataKey="month" 
            stroke="#666"
            tick={{ fill: '#888', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#888', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={data.current_monthly_cost} 
            stroke="#888" 
            strokeDasharray="5 5"
            label={{ value: 'Current', fill: '#888', fontSize: 10, position: 'right' }}
          />
          
          <Area 
            type="monotone" 
            dataKey="conservative" 
            stroke="#ff4757" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorConservative)" 
            name="Conservative"
          />
          <Area 
            type="monotone" 
            dataKey="balanced" 
            stroke="#00d4ff" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorBalanced)" 
            name="Balanced"
          />
          <Area 
            type="monotone" 
            dataKey="aggressive" 
            stroke="#00ff88" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorAggressive)" 
            name="Aggressive"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Savings Summary Cards
export const SavingsSummary: React.FC<CostSavingsProps> = ({ data }) => {
  const { current_monthly_cost, projected_savings } = data;
  
  const strategies = [
    {
      name: 'Conservative',
      savings: projected_savings.conservative,
      color: '#ff4757',
      description: 'Maximum redundancy, high cost',
      icon: <TrendingUp size={18} />
    },
    {
      name: 'Balanced',
      savings: projected_savings.balanced,
      color: '#00d4ff',
      description: 'Recommended - optimal balance',
      icon: <DollarSign size={18} />
    },
    {
      name: 'Aggressive',
      savings: projected_savings.aggressive,
      color: '#00ff88',
      description: 'Minimum cost, acceptable risk',
      icon: <PiggyBank size={18} />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {strategies.map((strategy) => {
        const isPositive = strategy.savings > 0;
        const newCost = current_monthly_cost - strategy.savings;
        const savingsPercent = (strategy.savings / current_monthly_cost * 100).toFixed(1);
        
        return (
          <div 
            key={strategy.name}
            className="gd-card p-5 relative overflow-hidden"
            style={{ borderColor: strategy.color + '30' }}
          >
            {/* Glow effect */}
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: strategy.color }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="gd-badge"
                  style={{ 
                    background: strategy.color + '15',
                    color: strategy.color,
                    border: `1px solid ${strategy.color}30`
                  }}
                >
                  {strategy.icon}
                  {strategy.name}
                </span>
              </div>
              
              <p className="text-xs text-gray-400 mb-3">{strategy.description}</p>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Monthly Savings</p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: isPositive ? '#00ff88' : '#ff4757' }}
                  >
                    {isPositive ? '+' : ''}₹{Math.abs(strategy.savings).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isPositive ? '' : '(Additional cost)'}
                  </p>
                </div>
                
                {isPositive && (
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ 
                        background: '#00ff8820',
                        color: '#00ff88'
                      }}
                    >
                      {savingsPercent}% savings
                    </span>
                  </div>
                )}
                
                <div className="pt-2 border-t border-[#ffffff08]">
                  <p className="text-xs text-gray-500">New Monthly Cost</p>
                  <p className="text-lg font-semibold text-white">
                    ₹{newCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Current Cost Card
export const CurrentCostCard: React.FC<{ cost: number }> = ({ cost }) => {
  const yearlyCost = cost * 12;
  
  return (
    <div className="gd-card p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#00d4ff] blur-3xl opacity-10" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={20} className="text-[#00d4ff]" />
          <span className="text-gray-400 text-sm">Current Storage Costs</span>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-4xl font-bold text-white">₹{cost.toFixed(2)}</p>
            <p className="text-sm text-gray-400 mt-1">per month</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#00d4ff]">₹{yearlyCost.toFixed(2)}</p>
            <p className="text-sm text-gray-400 mt-1">per year</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[#ffffff08]">
          <p className="text-xs text-gray-500">
            Based on current tier distribution and cloud pricing
          </p>
        </div>
      </div>
    </div>
  );
};

export default CostProjectionChart;
