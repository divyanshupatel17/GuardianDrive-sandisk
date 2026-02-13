import React from 'react';
import { AlertTriangle, XCircle, Info, CheckCircle, X } from 'lucide-react';
import type { Alert } from '@/types';

interface AlertBannerProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

const alertConfig: Record<string, { 
  icon: React.ReactNode; 
  bg: string; 
  border: string; 
  text: string;
  glow: string;
}> = {
  critical: {
    icon: <XCircle size={20} />,
    bg: 'linear-gradient(90deg, rgba(255, 71, 87, 0.15), rgba(255, 71, 87, 0.05))',
    border: 'rgba(255, 71, 87, 0.4)',
    text: '#ff4757',
    glow: '0 0 30px rgba(255, 71, 87, 0.3)'
  },
  high: {
    icon: <AlertTriangle size={20} />,
    bg: 'linear-gradient(90deg, rgba(255, 184, 0, 0.15), rgba(255, 184, 0, 0.05))',
    border: 'rgba(255, 184, 0, 0.4)',
    text: '#ffb800',
    glow: '0 0 30px rgba(255, 184, 0, 0.3)'
  },
  medium: {
    icon: <Info size={20} />,
    bg: 'linear-gradient(90deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.05))',
    border: 'rgba(0, 212, 255, 0.4)',
    text: '#00d4ff',
    glow: '0 0 30px rgba(0, 212, 255, 0.3)'
  },
  low: {
    icon: <CheckCircle size={20} />,
    bg: 'linear-gradient(90deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05))',
    border: 'rgba(0, 255, 136, 0.4)',
    text: '#00ff88',
    glow: '0 0 30px rgba(0, 255, 136, 0.3)'
  }
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onAcknowledge, onDismiss }) => {
  const config = alertConfig[alert.severity] || alertConfig.medium;
  
  return (
    <div 
      className="relative rounded-xl overflow-hidden animate-slide-up"
      style={{ 
        background: config.bg,
        border: `1px solid ${config.border}`,
        boxShadow: config.glow
      }}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Icon */}
        <div 
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ 
            background: config.text + '20',
            color: config.text
          }}
        >
          {config.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ 
                background: config.text + '20',
                color: config.text
              }}
            >
              {alert.severity}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(alert.timestamp).toLocaleString()}
            </span>
          </div>
          
          <p className="text-white font-medium mb-2">{alert.message}</p>
          
          <div className="flex items-center gap-2 text-sm" style={{ color: config.text }}>
            <span className="font-medium">Action:</span>
            <span className="text-gray-300">{alert.recommended_action}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="gd-btn-secondary text-xs py-2 px-3"
              style={{ borderColor: config.text + '50', color: config.text }}
            >
              Acknowledge
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {/* Pulse animation for critical */}
      {alert.severity === 'critical' && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 71, 87, 0.1), transparent)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      )}
    </div>
  );
};

// Alert List Component
export const AlertList: React.FC<{
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  maxDisplay?: number;
}> = ({ alerts, onAcknowledge, onDismiss, maxDisplay = 5 }) => {
  const displayedAlerts = alerts.slice(0, maxDisplay);
  const remainingCount = alerts.length - maxDisplay;
  
  if (alerts.length === 0) {
    return (
      <div className="gd-card p-8 text-center">
        <CheckCircle size={48} className="mx-auto text-[#00ff88] mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">All Systems Normal</h3>
        <p className="text-gray-400">No active alerts at this time</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {displayedAlerts.map((alert, index) => (
        <div key={alert.id} style={{ animationDelay: `${index * 100}ms` }}>
          <AlertBanner 
            alert={alert} 
            onAcknowledge={onAcknowledge}
            onDismiss={onDismiss}
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="text-center py-3">
          <button className="text-[#00d4ff] text-sm hover:underline">
            + {remainingCount} more alerts
          </button>
        </div>
      )}
    </div>
  );
};

// Alert Stats Component
export const AlertStats: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const stats = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };
  
  const total = alerts.length;
  
  return (
    <div className="gd-card p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle size={18} className="text-[#ffb800]" />
        Alert Summary
      </h3>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-3 rounded-lg bg-[#ff475715] border border-[#ff475730]">
          <p className="text-2xl font-bold text-[#ff4757]">{stats.critical}</p>
          <p className="text-xs text-gray-400 uppercase">Critical</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[#ffb80015] border border-[#ffb80030]">
          <p className="text-2xl font-bold text-[#ffb800]">{stats.high}</p>
          <p className="text-xs text-gray-400 uppercase">High</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[#00d4ff15] border border-[#00d4ff30]">
          <p className="text-2xl font-bold text-[#00d4ff]">{stats.medium}</p>
          <p className="text-xs text-gray-400 uppercase">Medium</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[#00ff8815] border border-[#00ff8830]">
          <p className="text-2xl font-bold text-[#00ff88]">{stats.low}</p>
          <p className="text-xs text-gray-400 uppercase">Low</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#ffffff08] text-center">
        <p className="text-gray-400 text-sm">
          Total Active Alerts: <span className="text-white font-semibold">{total}</span>
        </p>
      </div>
    </div>
  );
};

export default AlertBanner;
