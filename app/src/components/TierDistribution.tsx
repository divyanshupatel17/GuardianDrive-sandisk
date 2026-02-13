import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Database, Flame, Snowflake, Archive } from 'lucide-react';
import type { TierDistribution } from '@/types';

interface TierDistributionProps {
  data: TierDistribution;
  chartType?: 'bar' | 'pie';
}

const tierColors: Record<string, { fill: string; stroke: string; icon: React.ReactNode }> = {
  HOT: {
    fill: '#ff4757',
    stroke: '#ff6b7a',
    icon: <Flame size={14} />
  },
  WARM: {
    fill: '#ffb800',
    stroke: '#ffc833',
    icon: <Database size={14} />
  },
  COLD: {
    fill: '#00d4ff',
    stroke: '#33ddff',
    icon: <Snowflake size={14} />
  },
  ARCHIVE: {
    fill: '#888888',
    stroke: '#aaaaaa',
    icon: <Archive size={14} />
  }
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="gd-card p-3 border border-gray-800">
        <p className="text-white font-semibold mb-1">{label} Tier</p>
        <p className="text-gray-400 text-sm">
          Files: <span className="text-white font-medium">{data.files}</span>
        </p>
        <p className="text-gray-400 text-sm">
          Size: <span className="text-white font-medium">{data.size_gb.toFixed(2)} GB</span>
        </p>
      </div>
    );
  }
  return null;
};

// Stacked Bar Chart Component
export const TierBarChart: React.FC<TierDistributionProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([tier, info]) => {
    const tierKey = tier.toUpperCase();
    const colors = tierColors[tierKey] || tierColors.HOT;
    return {
      tier,
      files: info.files,
      size_gb: info.size_gb,
      ...colors
    };
  });

  return (
    <div className="gd-chart-container h-[300px]">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Database size={18} className="text-[#00d4ff]" />
        Tier Distribution
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {Object.entries(tierColors).map(([tier, colors]) => (
              <linearGradient key={tier} id={`gradient-${tier}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.fill} stopOpacity={1} />
                <stop offset="100%" stopColor={colors.fill} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="tier"
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
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,255,0.05)' }} />
          <Bar
            dataKey="files"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#gradient-${entry.tier})`}
                stroke={entry.stroke}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie Chart Component
export const TierPieChart: React.FC<TierDistributionProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([tier, info]) => {
    const tierKey = tier.toUpperCase();
    const colors = tierColors[tierKey] || tierColors.HOT;
    return {
      name: tier,
      value: info.size_gb,
      files: info.files,
      ...colors
    };
  });

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="gd-chart-container h-[300px]">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Database size={18} className="text-[#00d4ff]" />
        Storage by Tier
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={90}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
            animationBegin={0}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke={entry.stroke}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: item.fill, boxShadow: `0 0 6px ${item.fill}` }}
            />
            <span className="text-xs text-gray-400">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tier Stats Cards
export const TierStats: React.FC<TierDistributionProps> = ({ data }) => {
  const totalFiles = Object.values(data).reduce((sum, t) => sum + t.files, 0);
  const totalSize = Object.values(data).reduce((sum, t) => sum + t.size_gb, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(data).map(([tier, info]) => {
        const tierKey = tier.toUpperCase();
        const colors = tierColors[tierKey] || tierColors.HOT;
        const percentFiles = totalFiles > 0 ? (info.files / totalFiles * 100).toFixed(1) : '0';
        const percentSize = totalSize > 0 ? (info.size_gb / totalSize * 100).toFixed(1) : '0';

        return (
          <div
            key={tier}
            className="gd-card p-4 hover:border-opacity-50 transition-all"
            style={{ borderColor: colors.fill + '30' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="gd-badge"
                style={{
                  background: colors.fill + '15',
                  color: colors.fill,
                  border: `1px solid ${colors.fill}30`
                }}
              >
                {colors.icon}
                {tier}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold text-white">{info.files}</p>
                <p className="text-xs text-gray-400">Files ({percentFiles}%)</p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-[#ffffff10] to-transparent" />

              <div>
                <p className="text-lg font-semibold" style={{ color: colors.fill }}>
                  {info.size_gb.toFixed(1)} GB
                </p>
                <p className="text-xs text-gray-400">Storage ({percentSize}%)</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TierBarChart;
