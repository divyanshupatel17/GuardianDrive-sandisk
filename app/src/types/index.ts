// GuardianDrive Type Definitions

export interface Drive {
  id: string;
  name: string;
  type: string;
  capacity: number;
  used: number;
  health_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  temperature: number;
  power_on_hours: number;
  reallocated_sectors: number;
  pending_sectors: number;
  read_error_rate: number;
  write_error_rate: number;
  udma_crc_errors: number;
  seek_error_rate: number;
  predicted_failure_days: number | null;
  smart_data: Record<string, number>;
  last_updated: string;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  extension: string;
  tier: 'HOT' | 'WARM' | 'COLD' | 'ARCHIVE';
  access_frequency: string;
  last_accessed: string;
  created: string;
  modified: string;
  access_count: number;
  compressibility: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DriveHealthDetail {
  drive_id: string;
  health_score: number;
  risk_level: string;
  predicted_failure_days: number | null;
  confidence: number;
  top_factors: Array<{ factor: string; impact: number }>;
  recommendations: string[];
}

export interface TieringRecommendation {
  file_id: string;
  file_name: string;
  current_tier: string;
  recommended_tier: string;
  recommended_cloud: string;
  estimated_savings: number;
  migration_urgency: 'IMMEDIATE' | '7_DAYS' | '30_DAYS';
  reason: string;
  confidence: number;
}

export interface CompressionRecommendation {
  file_id: string;
  file_name: string;
  current_size: number;
  compressed_size: number;
  compression_ratio: number;
  algorithm: string;
  monthly_savings: number;
  compression_time: number;
  roi_score: number;
  recommend: boolean;
}

export interface CloudOption {
  provider: string;
  tier: string;
  monthly_cost_per_gb: number;
  retrieval_time: string;
  total_cost: number;
  savings_percent: number;
}

export interface StrategyOption {
  name: string;
  description: string;
  score: number;
  monthly_cost: number;
  risk_reduction: number;
  replication_factor: number;
  cloud_tier: string;
  compression_level: string;
}

export interface Alert {
  id: string;
  drive_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  recommended_action: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface TierDistribution {
  [tier: string]: {
    files: number;
    size_gb: number;
  };
}

export interface CostProjections {
  current_monthly_cost: number;
  projected_savings: {
    conservative: number;
    balanced: number;
    aggressive: number;
  };
  tier_distribution: TierDistribution;
}

export interface DashboardSummary {
  storage_summary: {
    total_capacity_gb: number;
    total_used_gb: number;
    utilization_percent: number;
    total_files: number;
  };
  health_summary: {
    average_health_score: number;
    critical_drives: number;
    high_risk_drives: number;
    healthy_drives: number;
  };
  tier_distribution: TierDistribution;
  cost_summary: CostProjections;
  alerts: {
    total: number;
    critical: number;
    high: number;
    items: Alert[];
  };
}

export interface TieringPlanResponse {
  total_recommendations: number;
  total_estimated_savings: number;
  recommendations: TieringRecommendation[];
  strategy_options: StrategyOption[];
  summary: {
    hot_to_warm: number;
    warm_to_cold: number;
    cold_to_archive: number;
    critical_migrations: number;
  };
}

export interface CompressionResponse {
  total_recommendations: number;
  total_monthly_savings: number;
  total_size_reduction: string;
  recommendations: CompressionRecommendation[];
}
