import React from 'react';
import {
  HardDrive,
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap
} from 'lucide-react';
import type { Drive, DriveHealthDetail } from '@/types';

interface DriveHealthProps {
  drive: Drive;
  healthDetail?: DriveHealthDetail;
  onClick?: (drive: Drive) => void;
}

// Circular Health Gauge Component
const HealthGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const getColor = (s: number): string => {
    if (s >= 80) return '#10b981'; // Success green
    if (s >= 60) return '#3b82f6'; // Professional blue
    if (s >= 40) return '#f59e0b'; // Warning orange
    return '#ef4444'; // Critical red
  };

  const color = getColor(score);
  // const glowColor = color + '40'; // Add transparency

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background glow effect - Removed */}
      {/* <div 
        className="absolute inset-0 rounded-full blur-xl"
        style={{ 
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          transform: 'scale(1.2)'
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

        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.6} />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${score})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            // filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold"
          style={{ color, textShadow: `0 0 10px ${color}50` }}
        >
          {Math.round(score)}
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
};

// Risk Badge Component
const RiskBadge: React.FC<{ level: string }> = ({ level }) => {
  const styles: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    LOW: {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: '#10b981',
      border: 'rgba(16, 185, 129, 0.2)',
      icon: <CheckCircle size={14} />
    },
    MEDIUM: {
      bg: 'rgba(59, 130, 246, 0.1)',
      text: '#3b82f6',
      border: 'rgba(59, 130, 246, 0.2)',
      icon: <Activity size={14} />
    },
    HIGH: {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.2)',
      icon: <AlertTriangle size={14} />
    },
    CRITICAL: {
      bg: 'rgba(239, 68, 68, 0.1)',
      text: '#ef4444',
      border: 'rgba(239, 68, 68, 0.2)',
      icon: <XCircle size={14} />
    }
  };

  const style = styles[level] || styles.LOW;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`
      }}
    >
      {style.icon}
      {level}
    </span>
  );
};

// SMART Attribute Bar
const SmartBar: React.FC<{ label: string; value: number; max?: number; unit?: string }> = ({
  label,
  value,
  max = 100,
  unit = ''
}) => {
  const percentage = Math.min(100, (value / max) * 100);
  const getColor = (p: number) => {
    if (p < 30) return '#10b981';
    if (p < 60) return '#3b82f6';
    if (p < 80) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(percentage);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span style={{ color }}>{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow: `0 0 8px ${color}50`
          }}
        />
      </div>
    </div>
  );
};

// Main DriveHealth Component
export const DriveHealth: React.FC<DriveHealthProps> = ({ drive, onClick }) => {
  const utilizationPercent = (drive.used / drive.capacity) * 100;

  const getDriveIcon = (type: string) => {
    if (type.includes('NVMe') || type.includes('SSD')) {
      return <Zap size={18} className="text-blue-500" />;
    }
    return <HardDrive size={18} className="text-gray-400" />;
  };

  return (
    <div
      className="gd-card p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      onClick={() => onClick?.(drive)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 
                          flex items-center justify-center border border-gray-800">
            {getDriveIcon(drive.type)}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{drive.name}</h3>
            <p className="text-xs text-gray-400">{drive.type}</p>
          </div>
        </div>
        <RiskBadge level={drive.risk_level} />
      </div>

      {/* Health Gauge */}
      <div className="flex items-center justify-center py-4">
        <HealthGauge score={drive.health_score} size={140} />
      </div>

      {/* Drive Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#ffffff08]">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Thermometer size={12} />
            Temperature
          </div>
          <span className={`text-lg font-semibold ${drive.temperature > 50 ? 'text-[#ff4757]' :
            drive.temperature > 45 ? 'text-[#ffb800]' : 'text-[#00ff88]'
            }`}>
            {drive.temperature}°C
          </span>
        </div>

        <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#ffffff08]">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <Clock size={12} />
            Power-On
          </div>
          <span className="text-lg font-semibold text-white">
            {Math.round(drive.power_on_hours / 8760 * 10) / 10}y
          </span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Capacity</span>
          <span className="text-white">
            {(drive.used / 1024).toFixed(1)} / {(drive.capacity / 1024).toFixed(1)} TB
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${utilizationPercent}%`,
              // boxShadow: '0 0 10px rgba(0, 212, 255, 0.4)'
            }}
          />
        </div>
      </div>

      {/* SMART Attributes */}
      <div className="space-y-2 pt-3 border-t border-[#ffffff08]">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">SMART Metrics</p>
        <SmartBar
          label="Reallocated Sectors"
          value={drive.reallocated_sectors}
          max={100}
        />
        <SmartBar
          label="Pending Sectors"
          value={drive.pending_sectors}
          max={50}
        />
        <SmartBar
          label="UDMA CRC Errors"
          value={drive.udma_crc_errors}
          max={30}
        />
      </div>

      {/* Failure Prediction */}
      {drive.predicted_failure_days && (
        <div className={`mt-4 p-3 rounded-lg border ${drive.predicted_failure_days <= 7
          ? 'bg-[#ff475715] border-[#ff475730] text-[#ff4757]'
          : 'bg-[#ffb80015] border-[#ffb80030] text-[#ffb800]'
          }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">
              Predicted failure in {drive.predicted_failure_days} days
            </span>
          </div>
        </div>
      )}

      {drive.health_score >= 80 && (
        <div className="mt-4 p-3 rounded-lg bg-[#00ff8815] border border-[#00ff8830] text-[#00ff88]">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Drive operating normally</span>
          </div>
        </div>
      )}
    </div>
  );
};

// DriveHealthList Component
export const DriveHealthList: React.FC<{
  drives: Drive[];
  onDriveClick?: (drive: Drive) => void;
}> = ({ drives, onDriveClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {drives.map((drive, index) => (
        <div
          key={drive.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <DriveHealth
            drive={drive}
            onClick={onDriveClick}
          />
        </div>
      ))}
    </div>
  );
};

export default DriveHealth;
