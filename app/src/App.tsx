import React, { useState, useEffect } from 'react';
import { Navigation, TopBar } from '@/components/Navigation';
import { StatsOverview, HealthStatusCard, StorageUtilizationCard } from '@/components/StatsOverview';
import { DriveHealthList } from '@/components/DriveHealth';
import { TierBarChart, TierStats } from '@/components/TierDistribution';
import { CostProjectionChart, SavingsSummary } from '@/components/CostSavings';
import { AlertList, AlertStats } from '@/components/AlertBanner';
import {
  HardDrive,
  Layers,
  FileArchive,
  Cloud,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Zap,
  Database,
  ArrowRight,
  RefreshCw,
  Download
} from 'lucide-react';
import type {
  DashboardSummary,
  Drive,
  TieringPlanResponse,
  CompressionResponse,
  CloudOption
} from '@/types';

// Import mock data
import mockData from '@/data/mock_data.json';

// Mock API responses
const mockDashboardSummary: DashboardSummary = {
  storage_summary: {
    total_capacity_gb: 28672,
    total_used_gb: 24015,
    utilization_percent: 83.7,
    total_files: 55
  },
  health_summary: {
    average_health_score: 62.6,
    critical_drives: 1,
    high_risk_drives: 1,
    healthy_drives: 3
  },
  tier_distribution: mockData.cost_projections.tier_distribution,
  cost_summary: mockData.cost_projections,
  alerts: {
    total: 3,
    critical: 1,
    high: 1,
    items: mockData.alerts as any
  }
};

const mockTieringPlan: TieringPlanResponse = {
  total_recommendations: 23,
  total_estimated_savings: 1245.30,
  recommendations: [
    {
      file_id: "FILE-021",
      file_name: "error_logs_archive_2025.log",
      current_tier: "COLD",
      recommended_tier: "ARCHIVE",
      recommended_cloud: "AWS S3 Glacier Deep",
      estimated_savings: 324.50,
      migration_urgency: "7_DAYS",
      reason: "Access pattern: 0% frequency, 100% recency - Never accessed",
      confidence: 0.95
    },
    {
      file_id: "FILE-044",
      file_name: "legacy_database_dump.sql",
      current_tier: "ARCHIVE",
      recommended_tier: "ARCHIVE",
      recommended_cloud: "AWS S3 Glacier Deep",
      estimated_savings: 289.75,
      migration_urgency: "30_DAYS",
      reason: "Access pattern: 0% frequency, 100% recency - Historical archive",
      confidence: 0.92
    },
    {
      file_id: "FILE-039",
      file_name: "security_camera_footage.mp4",
      current_tier: "COLD",
      recommended_tier: "ARCHIVE",
      recommended_cloud: "AWS S3 Glacier Instant",
      estimated_savings: 198.40,
      migration_urgency: "30_DAYS",
      reason: "Access pattern: 5% frequency, 85% recency - Rarely accessed",
      confidence: 0.88
    },
    {
      file_id: "FILE-031",
      file_name: "email_archive_2025.pst",
      current_tier: "ARCHIVE",
      recommended_tier: "ARCHIVE",
      recommended_cloud: "AWS S3 Glacier Deep",
      estimated_savings: 156.20,
      migration_urgency: "30_DAYS",
      reason: "Access pattern: 2% frequency, 90% recency - Compliance archive",
      confidence: 0.90
    },
    {
      file_id: "FILE-009",
      file_name: "training_video_module1.mp4",
      current_tier: "WARM",
      recommended_tier: "COLD",
      recommended_cloud: "AWS S3 Glacier Instant",
      estimated_savings: 142.80,
      migration_urgency: "7_DAYS",
      reason: "Access pattern: 15% frequency, 60% recency - Monthly access",
      confidence: 0.85
    }
  ],
  strategy_options: [
    {
      name: "Conservative",
      description: "Maximum redundancy, high cost",
      score: 0.85,
      monthly_cost: 7118.75,
      risk_reduction: 95.0,
      replication_factor: 3,
      cloud_tier: "standard",
      compression_level: "none"
    },
    {
      name: "Balanced",
      description: "Recommended - optimal risk-cost balance",
      score: 0.42,
      monthly_cost: 2847.50,
      risk_reduction: 85.0,
      replication_factor: 2,
      cloud_tier: "intelligent_tiering",
      compression_level: "medium"
    },
    {
      name: "Aggressive",
      description: "Minimum cost, acceptable risk",
      score: 0.38,
      monthly_cost: 1139.00,
      risk_reduction: 70.0,
      replication_factor: 1,
      cloud_tier: "glacier_deep",
      compression_level: "heavy"
    }
  ],
  summary: {
    hot_to_warm: 3,
    warm_to_cold: 8,
    cold_to_archive: 10,
    critical_migrations: 2
  }
};

const mockCompressionData: CompressionResponse = {
  total_recommendations: 12,
  total_monthly_savings: 2847.50,
  total_size_reduction: "45.2 GB",
  recommendations: [
    {
      file_id: "FILE-021",
      file_name: "error_logs_archive_2025.log",
      current_size: 4194304000,
      compressed_size: 838860800,
      compression_ratio: 0.80,
      algorithm: "zstd-19",
      monthly_savings: 624.80,
      compression_time: 180,
      roi_score: 45.2,
      recommend: true
    },
    {
      file_id: "FILE-006",
      file_name: "server_logs_2026_02.log",
      current_size: 838860800,
      compressed_size: 167772160,
      compression_ratio: 0.80,
      algorithm: "zstd-19",
      monthly_savings: 124.96,
      compression_time: 36,
      roi_score: 42.8,
      recommend: true
    },
    {
      file_id: "FILE-001",
      file_name: "sales_q4_2025.csv",
      current_size: 52428800,
      compressed_size: 14680064,
      compression_ratio: 0.72,
      algorithm: "zstd-11",
      monthly_savings: 78.45,
      compression_time: 12,
      roi_score: 28.5,
      recommend: true
    },
    {
      file_id: "FILE-004",
      file_name: "customer_data_analytics.json",
      current_size: 157286400,
      compressed_size: 47185920,
      compression_ratio: 0.70,
      algorithm: "zstd-11",
      monthly_savings: 68.20,
      compression_time: 28,
      roi_score: 18.3,
      recommend: true
    },
    {
      file_id: "FILE-043",
      file_name: "realtime_analytics_stream.json",
      current_size: 5368709120,
      compressed_size: 1610612736,
      compression_ratio: 0.70,
      algorithm: "zstd-11",
      monthly_savings: 245.60,
      compression_time: 180,
      roi_score: 15.8,
      recommend: true
    }
  ]
};

const mockCloudOptions: CloudOption[] = [
  {
    provider: "AWS",
    tier: "S3 Glacier Deep Archive",
    monthly_cost_per_gb: 0.08,
    retrieval_time: "12-48 hours",
    total_cost: 987.40,
    savings_percent: 65.3
  },
  {
    provider: "Azure",
    tier: "Blob Archive",
    monthly_cost_per_gb: 0.08,
    retrieval_time: "12 hours",
    total_cost: 987.40,
    savings_percent: 65.3
  },
  {
    provider: "GCP",
    tier: "Cloud Storage Archive",
    monthly_cost_per_gb: 0.10,
    retrieval_time: "Instant",
    total_cost: 1234.25,
    savings_percent: 56.7
  }
];

// Format bytes helper
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Overview Tab
const OverviewTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <StatsOverview data={mockDashboardSummary} />

      {/* Alerts Section */}
      {mockDashboardSummary.alerts.total > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-[#ff4757]" />
            <h2 className="text-white font-semibold text-lg">Active Alerts</h2>
            <span className="bg-[#ff4757] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {mockDashboardSummary.alerts.total}
            </span>
          </div>
          <AlertList alerts={mockDashboardSummary.alerts.items} maxDisplay={3} />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-6">
          <CostProjectionChart data={mockDashboardSummary.cost_summary} />
          <TierBarChart data={mockDashboardSummary.tier_distribution} />
        </div>

        {/* Right Column - Status Cards */}
        <div className="space-y-6">
          <HealthStatusCard data={mockDashboardSummary} />
          <StorageUtilizationCard data={mockDashboardSummary} />
          <AlertStats alerts={mockDashboardSummary.alerts.items} />
        </div>
      </div>

      {/* Tier Stats */}
      <div className="space-y-4">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Layers size={20} className="text-[#00d4ff]" />
          Storage Tiers
        </h2>
        <TierStats data={mockDashboardSummary.tier_distribution} />
      </div>
    </div>
  );
};

// Drives Tab
const DrivesTab: React.FC = () => {
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive size={20} className="text-[#00d4ff]" />
          <h2 className="text-white font-semibold text-lg">Drive Health Monitor</h2>
        </div>
        <button className="gd-btn-secondary text-sm flex items-center gap-2">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Drive Health Cards */}
      <DriveHealthList
        drives={mockData.drives as any}
        onDriveClick={setSelectedDrive}
      />

      {/* Drive Details Modal (simplified) */}
      {selectedDrive && (
        <div className="gd-card p-6 border-[#00d4ff40]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">{selectedDrive.name} - Details</h3>
            <button
              onClick={() => setSelectedDrive(null)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#ffffff08]">
              <p className="text-gray-400 text-xs uppercase">Health Score</p>
              <p className={`text-2xl font-bold ${selectedDrive.health_score >= 80 ? 'text-[#00ff88]' :
                  selectedDrive.health_score >= 60 ? 'text-[#00d4ff]' :
                    selectedDrive.health_score >= 40 ? 'text-[#ffb800]' : 'text-[#ff4757]'
                }`}>
                {selectedDrive.health_score}%
              </p>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#ffffff08]">
              <p className="text-gray-400 text-xs uppercase">Temperature</p>
              <p className="text-2xl font-bold text-white">{selectedDrive.temperature}°C</p>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#ffffff08]">
              <p className="text-gray-400 text-xs uppercase">Power-On Hours</p>
              <p className="text-2xl font-bold text-white">
                {(selectedDrive.power_on_hours / 8760).toFixed(1)}y
              </p>
            </div>
            <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#ffffff08]">
              <p className="text-gray-400 text-xs uppercase">Risk Level</p>
              <p className={`text-2xl font-bold ${selectedDrive.risk_level === 'LOW' ? 'text-[#00ff88]' :
                  selectedDrive.risk_level === 'MEDIUM' ? 'text-[#00d4ff]' :
                    selectedDrive.risk_level === 'HIGH' ? 'text-[#ffb800]' : 'text-[#ff4757]'
                }`}>
                {selectedDrive.risk_level}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tiering Tab
const TieringTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-[#00d4ff]" />
          <h2 className="text-white font-semibold text-lg">Intelligent Tiering Plan</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="gd-btn-secondary text-sm flex items-center gap-2">
            <Download size={14} />
            Export Plan
          </button>
          <button className="gd-btn-primary text-sm flex items-center gap-2">
            <CheckCircle size={14} />
            Apply Plan
          </button>
        </div>
      </div>

      {/* Strategy Options */}
      <SavingsSummary data={mockDashboardSummary.cost_summary} />

      {/* Recommendations Table */}
      <div className="gd-card overflow-hidden">
        <div className="p-4 border-b border-[#ffffff08] flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <TrendingDown size={18} className="text-[#00ff88]" />
            Top Recommendations
          </h3>
          <span className="text-[#00ff88] text-sm">
            Total Savings: ₹{mockTieringPlan.total_estimated_savings.toFixed(2)}/mo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="gd-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Current Tier</th>
                <th>Recommended</th>
                <th>Cloud</th>
                <th>Savings</th>
                <th>Urgency</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {mockTieringPlan.recommendations.map((rec) => (
                <tr key={rec.file_id}>
                  <td>
                    <div>
                      <p className="text-white font-medium text-sm">{rec.file_name}</p>
                      <p className="text-gray-500 text-xs">{rec.file_id}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`gd-badge gd-badge-${rec.current_tier.toLowerCase()}`}>
                      {rec.current_tier}
                    </span>
                  </td>
                  <td>
                    <span className={`gd-badge gd-badge-${rec.recommended_tier.toLowerCase()}`}>
                      {rec.recommended_tier}
                    </span>
                  </td>
                  <td className="text-gray-300 text-sm">{rec.recommended_cloud}</td>
                  <td className="text-[#00ff88] font-medium">₹{rec.estimated_savings.toFixed(2)}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${rec.migration_urgency === 'IMMEDIATE' ? 'bg-[#ff475720] text-[#ff4757]' :
                        rec.migration_urgency === '7_DAYS' ? 'bg-[#ffb80020] text-[#ffb800]' :
                          'bg-[#00d4ff20] text-[#00d4ff]'
                      }`}>
                      {rec.migration_urgency.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00d4ff] rounded-full"
                          style={{ width: `${rec.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs">{(rec.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Comparison */}
      <div className="gd-card p-5">
        <h3 className="text-white font-semibold mb-4">Strategy Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockTieringPlan.strategy_options.map((strategy) => (
            <div
              key={strategy.name}
              className={`p-4 rounded-xl border ${strategy.name === 'Balanced'
                  ? 'bg-[#00d4ff10] border-[#00d4ff40]'
                  : 'bg-[#0a0a0f] border-[#ffffff08]'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold">{strategy.name}</span>
                {strategy.name === 'Balanced' && (
                  <span className="bg-[#00d4ff] text-black text-xs font-bold px-2 py-0.5 rounded">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Cost</span>
                  <span className="text-white">₹{strategy.monthly_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Reduction</span>
                  <span className="text-[#00ff88]">{strategy.risk_reduction}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Replication</span>
                  <span className="text-white">{strategy.replication_factor}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cloud Tier</span>
                  <span className="text-[#00d4ff]">{strategy.cloud_tier}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Compression Tab
const CompressionTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileArchive size={20} className="text-[#00d4ff]" />
          <h2 className="text-white font-semibold text-lg">Compression Optimizer</h2>
        </div>
        <button className="gd-btn-primary text-sm flex items-center gap-2">
          <Zap size={14} />
          Compress All
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="gd-card p-5">
          <p className="text-gray-400 text-sm mb-1">Files to Compress</p>
          <p className="text-3xl font-bold text-white">{mockCompressionData.total_recommendations}</p>
        </div>
        <div className="gd-card p-5">
          <p className="text-gray-400 text-sm mb-1">Monthly Savings</p>
          <p className="text-3xl font-bold text-[#00ff88]">₹{mockCompressionData.total_monthly_savings.toFixed(2)}</p>
        </div>
        <div className="gd-card p-5">
          <p className="text-gray-400 text-sm mb-1">Size Reduction</p>
          <p className="text-3xl font-bold text-[#00d4ff]">{mockCompressionData.total_size_reduction}</p>
        </div>
      </div>

      {/* Compression Table */}
      <div className="gd-card overflow-hidden">
        <div className="p-4 border-b border-[#ffffff08]">
          <h3 className="text-white font-semibold">Compression Recommendations</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="gd-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Current Size</th>
                <th>Compressed</th>
                <th>Ratio</th>
                <th>Algorithm</th>
                <th>Time</th>
                <th>Monthly Savings</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {mockCompressionData.recommendations.map((rec) => (
                <tr key={rec.file_id}>
                  <td>
                    <div>
                      <p className="text-white font-medium text-sm">{rec.file_name}</p>
                      <p className="text-gray-500 text-xs">{rec.file_id}</p>
                    </div>
                  </td>
                  <td className="text-gray-300">{formatBytes(rec.current_size)}</td>
                  <td className="text-[#00d4ff]">{formatBytes(rec.compressed_size)}</td>
                  <td>
                    <span className="text-[#00ff88] font-medium">
                      {(rec.compression_ratio * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-gray-300">{rec.algorithm}</td>
                  <td className="text-gray-400">{rec.compression_time} min</td>
                  <td className="text-[#00ff88] font-medium">₹{rec.monthly_savings.toFixed(2)}</td>
                  <td>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-[#00ff8820] text-[#00ff88]">
                      {rec.roi_score.toFixed(1)}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Cloud Tab
const CloudTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud size={20} className="text-[#00d4ff]" />
          <h2 className="text-white font-semibold text-lg">Multi-Cloud Orchestrator</h2>
        </div>
        <button className="gd-btn-secondary text-sm flex items-center gap-2">
          <Download size={14} />
          Export Terraform
        </button>
      </div>

      {/* Cloud Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockCloudOptions.map((option) => (
          <div
            key={option.provider}
            className={`gd-card p-5 ${option.provider === 'AWS' ? 'border-[#00d4ff40]' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ffffff10] flex items-center justify-center">
                  <Cloud size={20} className="text-[#00d4ff]" />
                </div>
                <div>
                  <p className="text-white font-semibold">{option.provider}</p>
                  <p className="text-gray-400 text-xs">{option.tier}</p>
                </div>
              </div>
              {option.provider === 'AWS' && (
                <span className="bg-[#00d4ff] text-black text-xs font-bold px-2 py-0.5 rounded">
                  BEST
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cost per GB</span>
                <span className="text-white">₹{option.monthly_cost_per_gb}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Retrieval Time</span>
                <span className="text-white">{option.retrieval_time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-[#00d4ff] font-semibold">₹{option.total_cost.toFixed(2)}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Savings</span>
                <span className="text-[#00ff88]">{option.savings_percent}%</span>
              </div>
            </div>

            <button className="w-full mt-4 gd-btn-secondary text-sm py-2">
              Select {option.provider}
            </button>
          </div>
        ))}
      </div>

      {/* Lifecycle Policy */}
      <div className="gd-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Database size={18} className="text-[#00d4ff]" />
            Generated S3 Lifecycle Policy
          </h3>
          <button className="text-[#00d4ff] text-sm hover:underline flex items-center gap-1">
            Copy JSON
            <ArrowRight size={14} />
          </button>
        </div>

        <pre className="bg-[#0a0a0f] rounded-lg p-4 text-sm text-gray-300 overflow-x-auto border border-[#ffffff08]">
          {`{
  "Rules": [
    {
      "ID": "GuardianDrive-HotToWarm",
      "Status": "Enabled",
      "Filter": {"Prefix": ""},
      "Transitions": [
        {"Days": 30, "StorageClass": "INTELLIGENT_TIERING"}
      ]
    },
    {
      "ID": "GuardianDrive-WarmToCold",
      "Status": "Enabled",
      "Filter": {"Prefix": "archive/"},
      "Transitions": [
        {"Days": 90, "StorageClass": "GLACIER_IR"}
      ]
    },
    {
      "ID": "GuardianDrive-ColdToDeep",
      "Status": "Enabled",
      "Filter": {"Prefix": "deep-archive/"},
      "Transitions": [
        {"Days": 365, "StorageClass": "DEEP_ARCHIVE"}
      ]
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("App mounted. initializing...");
    console.log("Mock Data:", mockData);
    // Simulate loading
    const timer = setTimeout(() => {
      console.log("Loading complete, setting isLoading to false");
      setIsLoading(false)
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'drives':
        return <DrivesTab />;
      case 'tiering':
        return <TieringTab />;
      case 'compression':
        return <CompressionTab />;
      case 'cloud':
        return <CloudTab />;
      default:
        return <OverviewTab />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Dashboard Overview', subtitle: 'Real-time storage health and optimization insights' };
      case 'drives':
        return { title: 'Drive Health Monitor', subtitle: 'SMART metrics and failure predictions' };
      case 'tiering':
        return { title: 'Intelligent Tiering', subtitle: 'AI-powered storage optimization recommendations' };
      case 'compression':
        return { title: 'Compression Optimizer', subtitle: 'ROI-based compression recommendations' };
      case 'cloud':
        return { title: 'Cloud Orchestrator', subtitle: 'Multi-cloud tier comparison and lifecycle policies' };
      default:
        return { title: 'Dashboard Overview', subtitle: '' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#00a8cc] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Database size={32} className="text-black" />
          </div>
          <h1 className="text-white text-xl font-bold mb-2">GuardianDrive</h1>
          <p className="text-gray-400 text-sm">Initializing AI-powered storage orchestration...</p>
        </div>
      </div>
    );
  }

  const { title, subtitle } = getTabTitle();

  return (
    <div className="min-h-screen bg-black bg-grid-pattern">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={mockDashboardSummary.alerts.total}
      />

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        <TopBar title={title} subtitle={subtitle} />
        {renderTab()}
      </main>
    </div>
  );
}

export default App;
