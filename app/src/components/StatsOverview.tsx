import React from 'react';
import {
  HardDrive,
  FileText,
  Activity,
  TrendingUp,
  Database,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import type { DashboardSummary } from '@/types';

interface StatsOverviewProps {
  data: DashboardSummary;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: string;
  glowColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  glowColor
}) => {
  return (
    <div
      className="gd-card p-5 relative overflow-hidden group"
      style={{ borderColor: color + '20' }}
    >
      {/* Glow effect - Removed */}
      {/* <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{ background: glowColor }}
      /> */}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              border: `1px solid ${color}30`,
              color: color
            }}
          >
            {icon}
          </div>

          {trend && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background: trend.isPositive ? '#10b98120' : '#ef444420',
                color: trend.isPositive ? '#10b981' : '#ef4444'
              }}
            >
              <TrendingUp size={12} className={trend.isPositive ? '' : 'rotate-180'} />
              {trend.value}%
            </div>
          )}
        </div>

        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ data }) => {
  const { storage_summary, health_summary } = data;

  const stats: StatCardProps[] = [
    {
      title: 'Total Storage',
      value: `${(storage_summary.total_used_gb / 1024).toFixed(2)} TB`,
      subtitle: `of ${(storage_summary.total_capacity_gb / 1024).toFixed(2)} TB capacity`,
      icon: <Database />,
      icon: <Database />,
      color: '#3b82f6',
      glowColor: '#3b82f6',
      trend: { value: 12, isPositive: false }
    },
    {
      title: 'Total Files',
      value: storage_summary.total_files.toLocaleString(),
      subtitle: 'Across all tiers',
      icon: <FileText />,
      color: '#10b981',
      glowColor: '#10b981',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Avg Health Score',
      value: `${health_summary.average_health_score.toFixed(0)}%`,
      subtitle: health_summary.average_health_score >= 70 ? 'Good condition' : 'Needs attention',
      icon: <Activity />,
      color: health_summary.average_health_score >= 70 ? '#10b981' : '#f59e0b',
      glowColor: health_summary.average_health_score >= 70 ? '#10b981' : '#f59e0b'
    },
    {
      title: 'Active Alerts',
      value: data.alerts.total,
      subtitle: `${data.alerts.critical} critical, ${data.alerts.high} high`,
      icon: <AlertTriangle />,
      color: data.alerts.critical > 0 ? '#ef4444' : '#f59e0b',
      glowColor: data.alerts.critical > 0 ? '#ef4444' : '#f59e0b'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};

// Health Status Card
export const HealthStatusCard: React.FC<{ data: DashboardSummary }> = ({ data }) => {
  const { health_summary } = data;
  const totalDrives = health_summary.healthy_drives + health_summary.high_risk_drives + health_summary.critical_drives;

  const healthSegments = [
    {
      label: 'Healthy',
      count: health_summary.healthy_drives,
      color: '#10b981',
      icon: <CheckCircle size={14} />
    },
    {
      label: 'At Risk',
      count: health_summary.high_risk_drives,
      color: '#f59e0b',
      icon: <AlertTriangle size={14} />
    },
    {
      label: 'Critical',
      count: health_summary.critical_drives,
      color: '#ef4444',
      icon: <Zap size={14} />
    }
  ];

  return (
    <div className="gd-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <HardDrive size={18} className="text-[#00d4ff]" />
        <h3 className="text-white font-semibold">Drive Health Status</h3>
      </div>

      <div className="space-y-3">
        {healthSegments.map((segment) => {
          const percentage = totalDrives > 0 ? (segment.count / totalDrives) * 100 : 0;

          return (
            <div key={segment.label} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: segment.color + '15',
                  color: segment.color
                }}
              >
                {segment.icon}
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{segment.label}</span>
                  <span className="text-white font-medium">{segment.count}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      background: segment.color,
                      boxShadow: `0 0 8px ${segment.color}50`
                    }}
                  />
                </div>
              </div>

              <span
                className="text-sm font-medium w-12 text-right"
                style={{ color: segment.color }}
              >
                {percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-[#ffffff08] text-center">
        <p className="text-gray-400 text-sm">
          Total Drives: <span className="text-white font-semibold">{totalDrives}</span>
        </p>
      </div>
    </div>
  );
};

// Storage Utilization Card
export const StorageUtilizationCard: React.FC<{ data: DashboardSummary }> = ({ data }) => {
  const { storage_summary } = data;
  const utilizationPercent = storage_summary.utilization_percent;

  const getColor = (percent: number) => {
    if (percent < 50) return '#10b981';
    if (percent < 80) return '#3b82f6';
    if (percent < 90) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(utilizationPercent);

  // Calculate circle properties
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (utilizationPercent / 100) * circumference;

  return (
    <div className="gd-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Database size={18} className="text-[#00d4ff]" />
        <h3 className="text-white font-semibold">Storage Utilization</h3>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background glow - Removed */}
          {/* <div 
            className="absolute inset-0 rounded-full blur-xl"
            style={{ 
              background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
              transform: 'scale(1.3)'
            }}
          /> */}

          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={strokeWidth}
            />

            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
              style={{
                // filter: `drop-shadow(0 0 8px ${color})`
              }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-bold"
              style={{ color, textShadow: `0 0 10px ${color}50` }}
            >
              {utilizationPercent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Used</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="text-center p-3 rounded-lg bg-[#0a0a0f] border border-[#ffffff08]">
          <p className="text-lg font-semibold text-white">
            {(storage_summary.total_used_gb / 1024).toFixed(2)} TB
          </p>
          <p className="text-xs text-gray-400">Used</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[#0a0a0f] border border-[#ffffff08]">
          <p className="text-lg font-semibold text-[#00d4ff]">
            {((storage_summary.total_capacity_gb - storage_summary.total_used_gb) / 1024).toFixed(2)} TB
          </p>
          <p className="text-xs text-gray-400">Free</p>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
