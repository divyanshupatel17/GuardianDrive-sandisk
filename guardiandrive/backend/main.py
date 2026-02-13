"""
GuardianDrive - FastAPI Backend
AI-Powered Storage Health, Risk-Aware Tiering, and Automated Cloud Orchestration
"""

import json
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

# Initialize FastAPI app
app = FastAPI(
    title="GuardianDrive API",
    description="Intelligent Storage Orchestration Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load mock data
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "mock_data.json")

with open(DATA_PATH, "r") as f:
    MOCK_DATA = json.load(f)

# ============================================================================
# Pydantic Models
# ============================================================================

class Drive(BaseModel):
    id: str
    name: str
    type: str
    capacity: int
    used: int
    health_score: float
    risk_level: str
    temperature: int
    power_on_hours: int
    reallocated_sectors: int
    pending_sectors: int
    read_error_rate: float
    write_error_rate: float
    udma_crc_errors: int
    seek_error_rate: float
    predicted_failure_days: Optional[int]
    smart_data: Dict[str, Any]
    last_updated: str

class File(BaseModel):
    id: str
    name: str
    path: str
    size: int
    type: str
    extension: str
    tier: str
    access_frequency: str
    last_accessed: str
    created: str
    modified: str
    access_count: int
    compressibility: float
    risk_level: str

class TieringPlanRequest(BaseModel):
    max_cost: Optional[float] = None
    region: str = "us-east-1"
    risk_tolerance: str = "balanced"  # conservative, balanced, aggressive

class TieringRecommendation(BaseModel):
    file_id: str
    file_name: str
    current_tier: str
    recommended_tier: str
    recommended_cloud: str
    estimated_savings: float
    migration_urgency: str
    reason: str
    confidence: float

class CompressionRecommendation(BaseModel):
    file_id: str
    file_name: str
    current_size: int
    compressed_size: int
    compression_ratio: float
    algorithm: str
    monthly_savings: float
    compression_time: int
    roi_score: float
    recommend: bool

class CloudOption(BaseModel):
    provider: str
    tier: str
    monthly_cost_per_gb: float
    retrieval_time: str
    total_cost: float
    savings_percent: float

class StrategyOption(BaseModel):
    name: str
    description: str
    score: float
    monthly_cost: float
    risk_reduction: float
    replication_factor: int
    cloud_tier: str
    compression_level: str

class Alert(BaseModel):
    id: str
    drive_id: str
    severity: str
    message: str
    recommended_action: str
    timestamp: str
    acknowledged: bool

# ============================================================================
# Helper Functions
# ============================================================================

def format_bytes(size_bytes: int) -> str:
    """Convert bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"

def calculate_health_score(smart_data: Dict) -> float:
    """
    ML-based health score calculation using weighted SMART attributes
    Simulates XGBoost inference
    """
    # Feature weights (simulating trained XGBoost model)
    weights = {
        'reallocated_sector_ct': -0.35,
        'seek_error_rate': -0.25,
        'power_on_hours': -0.15,
        'raw_read_error_rate': -0.15,
        'udma_crc_errors': -0.10
    }
    
    score = 100.0
    
    # Apply feature weights
    reallocated = smart_data.get('reallocated_sector_ct', 0)
    score += weights['reallocated_sector_ct'] * min(reallocated * 2, 50)
    
    seek_error = 100 - smart_data.get('seek_error_rate', 100)
    score += weights['seek_error_rate'] * seek_error
    
    power_on = smart_data.get('power_on_hours', 0)
    score += weights['power_on_hours'] * min(power_on / 1000, 30)
    
    read_error = smart_data.get('raw_read_error_rate', 0)
    score += weights['raw_read_error_rate'] * min(read_error / 10, 30)
    
    udma_errors = smart_data.get('udma_crc_errors', 0)
    score += weights['udma_crc_errors'] * min(udma_errors * 5, 25)
    
    return max(0, min(100, score))

def get_risk_level(health_score: float) -> str:
    """Convert health score to risk level"""
    if health_score >= 80:
        return "LOW"
    elif health_score >= 60:
        return "MEDIUM"
    elif health_score >= 40:
        return "HIGH"
    else:
        return "CRITICAL"

def predict_failure_days(health_score: float, smart_data: Dict) -> Optional[int]:
    """Predict days until failure based on health metrics"""
    if health_score >= 80:
        return None
    
    # Simulate time-series prediction
    reallocated = smart_data.get('reallocated_sector_ct', 0)
    pending = smart_data.get('pending_sectors', 0)
    
    if health_score < 30:
        base_days = 7
    elif health_score < 50:
        base_days = 14
    elif health_score < 70:
        base_days = 45
    else:
        base_days = 90
    
    # Adjust based on degradation rate
    degradation_factor = (reallocated * 0.5) + (pending * 0.3)
    predicted_days = max(1, int(base_days - degradation_factor))
    
    return predicted_days

def classify_access_pattern(file_data: Dict) -> Dict:
    """
    K-means clustering simulation for access pattern classification
    Returns tier classification and confidence
    """
    # Extract features
    days_since_access = (datetime.now() - datetime.fromisoformat(file_data['last_accessed'].replace('Z', '+00:00'))).days
    access_count = file_data['access_count']
    size_gb = file_data['size'] / (1024**3)
    
    # Normalize features (simulating StandardScaler)
    recency_score = max(0, 1 - (days_since_access / 365))
    frequency_score = min(1, access_count / 1000)
    size_normalized = min(1, size_gb / 10)
    
    # K-means cluster centers (pre-trained)
    clusters = {
        'HOT': {'recency': 0.9, 'frequency': 0.8, 'size': 0.3},
        'WARM': {'recency': 0.6, 'frequency': 0.4, 'size': 0.5},
        'COLD': {'recency': 0.3, 'frequency': 0.2, 'size': 0.7},
        'ARCHIVE': {'recency': 0.1, 'frequency': 0.05, 'size': 0.9}
    }
    
    # Calculate distances to each cluster
    min_distance = float('inf')
    best_tier = 'COLD'
    
    for tier, center in clusters.items():
        distance = (
            (recency_score - center['recency'])**2 +
            (frequency_score - center['frequency'])**2 +
            (size_normalized - center['size'])**2
        ) ** 0.5
        
        if distance < min_distance:
            min_distance = distance
            best_tier = tier
    
    confidence = max(0, min(1, 1 - min_distance))
    
    return {
        'tier': best_tier,
        'confidence': round(confidence, 2),
        'recency_score': round(recency_score, 2),
        'frequency_score': round(frequency_score, 2)
    }

def calculate_compression_benefit(file_data: Dict) -> Dict:
    """
    Heuristic-based compression optimizer
    """
    type_compressibility = {
        'txt': 0.75, 'csv': 0.72, 'json': 0.70, 'sql': 0.68, 'log': 0.80,
        'xml': 0.78, 'yaml': 0.60, 'html': 0.65,
        'pdf': 0.40, 'docx': 0.35, 'xlsx': 0.30, 'pptx': 0.25,
        'jpg': 0.02, 'jpeg': 0.02, 'png': 0.03, 'mp4': 0.02, 
        'zip': 0.01, 'gz': 0.01, 'tar': 0.05,
        'exe': 0.08, 'bin': 0.10, 'apk': 0.08,
        'pkl': 0.15, 'parquet': 0.55, 'pbix': 0.20,
        'fig': 0.10, 'pcap': 0.45, 'pst': 0.20
    }
    
    ext = file_data['extension'].lower()
    benefit = type_compressibility.get(ext, 0.15)
    
    # If already compressed or low benefit, don't recommend
    if benefit < 0.20:
        return {
            'recommend': False,
            'reason': 'Already compressed or low compressibility',
            'compression_ratio': benefit
        }
    
    # Determine algorithm based on benefit
    if benefit > 0.70:
        algorithm = 'zstd-19'
        speed_factor = 0.5
    elif benefit > 0.50:
        algorithm = 'zstd-11'
        speed_factor = 1.0
    else:
        algorithm = 'gzip-9'
        speed_factor = 2.0
    
    # Calculate sizes
    current_size = file_data['size']
    compressed_size = int(current_size * (1 - benefit))
    
    # Cost analysis (₹2/hour compute, ₹0.023/GB/month storage)
    storage_cost_per_gb = 0.023
    compute_cost_per_hour = 2.0
    
    compression_time_hours = (current_size / (1024**3)) / (2 * speed_factor)  # 2GB/hour base
    cpu_cost = compression_time_hours * compute_cost_per_hour
    
    monthly_savings = ((current_size - compressed_size) / (1024**3)) * storage_cost_per_gb
    
    # ROI calculation
    if cpu_cost > 0:
        roi_score = monthly_savings / cpu_cost
    else:
        roi_score = 999
    
    return {
        'recommend': roi_score > 1.5,
        'algorithm': algorithm,
        'compression_ratio': round(benefit, 2),
        'current_size': current_size,
        'compressed_size': compressed_size,
        'compression_time_minutes': int(compression_time_hours * 60),
        'monthly_savings': round(monthly_savings * 83, 2),  # Convert to INR
        'cpu_cost': round(cpu_cost * 83, 2),
        'roi_score': round(roi_score, 2),
        'reason': f'High compressibility ({benefit*100:.0f}%) with ROI {roi_score:.1f}x'
    }

def get_cloud_options(tier: str, size_gb: float) -> List[CloudOption]:
    """Get cloud storage options for a given tier"""
    pricing = MOCK_DATA['cloud_pricing']
    options = []
    
    tier_mapping = {
        'HOT': [
            ('aws', 'standard', pricing['aws']['standard'], 'Instant'),
            ('azure', 'hot', pricing['azure']['hot'], 'Instant'),
            ('gcp', 'standard', pricing['gcp']['standard'], 'Instant')
        ],
        'WARM': [
            ('aws', 'intelligent-tiering', pricing['aws']['intelligent_tiering'], 'Instant'),
            ('azure', 'cool', pricing['azure']['cool'], 'Instant'),
            ('gcp', 'nearline', pricing['gcp']['nearline'], 'Instant')
        ],
        'COLD': [
            ('aws', 'glacier-instant', pricing['aws']['glacier_instant'], '3-5 hours'),
            ('azure', 'archive', pricing['azure']['archive'], '12 hours'),
            ('gcp', 'coldline', pricing['gcp']['coldline'], 'Instant')
        ],
        'ARCHIVE': [
            ('aws', 'glacier-deep', pricing['aws']['glacier_deep'], '12-48 hours'),
            ('azure', 'archive', pricing['azure']['archive'], '12 hours'),
            ('gcp', 'archive', pricing['gcp']['archive'], 'Instant')
        ]
    }
    
    for provider, cloud_tier, cost_per_gb, retrieval in tier_mapping.get(tier, tier_mapping['COLD']):
        total_cost = size_gb * cost_per_gb * 83  # Convert to INR
        options.append(CloudOption(
            provider=provider.upper(),
            tier=cloud_tier,
            monthly_cost_per_gb=round(cost_per_gb * 83, 2),
            retrieval_time=retrieval,
            total_cost=round(total_cost, 2),
            savings_percent=round((1 - cost_per_gb / pricing['aws']['standard']) * 100, 1)
        ))
    
    return sorted(options, key=lambda x: x.total_cost)

def weighted_scalarization_optimization(
    cost: float,
    risk: float,
    latency: float,
    user_pref: float,
    weights: Dict[str, float]
) -> float:
    """
    Risk-Cost Trade-off Optimizer using Weighted Scalarization
    Score = w1*cost + w2*risk + w3*latency + w4*user_pref
    Lower score is better
    """
    score = (
        weights.get('cost', 0.40) * cost +
        weights.get('risk', 0.35) * risk +
        weights.get('latency', 0.15) * latency +
        weights.get('user', 0.10) * user_pref
    )
    return score

def generate_tiering_strategies(
    files: List[Dict],
    drives: List[Dict],
    risk_tolerance: str
) -> List[StrategyOption]:
    """Generate top 3 tiering strategies using weighted scalarization"""
    
    # Calculate base metrics
    total_size_gb = sum(f['size'] for f in files) / (1024**3)
    critical_files = sum(1 for f in files if f['risk_level'] == 'CRITICAL')
    
    strategies = []
    
    for strategy_key, strategy_data in MOCK_DATA['tiering_strategies'].items():
        # Calculate normalized metrics
        cost_normalized = strategy_data['cost_multiplier']
        risk_normalized = 1 - strategy_data['risk_reduction']
        latency_normalized = 0.3 if strategy_key == 'conservative' else (0.6 if strategy_key == 'balanced' else 0.9)
        user_pref = 0.5  # Neutral user preference
        
        # Apply weighted scalarization
        weights = {
            'cost': 0.40 if risk_tolerance == 'aggressive' else (0.30 if risk_tolerance == 'conservative' else 0.35),
            'risk': 0.30 if risk_tolerance == 'conservative' else (0.25 if risk_tolerance == 'balanced' else 0.20),
            'latency': 0.20 if risk_tolerance == 'conservative' else 0.15,
            'user': 0.15 if risk_tolerance == 'balanced' else 0.10
        }
        
        score = weighted_scalarization_optimization(
            cost_normalized,
            risk_normalized,
            latency_normalized,
            user_pref,
            weights
        )
        
        monthly_cost = total_size_gb * 0.023 * 83 * strategy_data['cost_multiplier']
        
        strategies.append(StrategyOption(
            name=strategy_data['name'],
            description=strategy_data['description'],
            score=round(score, 3),
            monthly_cost=round(monthly_cost, 2),
            risk_reduction=round(strategy_data['risk_reduction'] * 100, 1),
            replication_factor=strategy_data['replication_factor'],
            cloud_tier=strategy_data['cloud_tier'],
            compression_level=strategy_data['compression']
        ))
    
    return sorted(strategies, key=lambda x: x.score)

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "GuardianDrive API - Intelligent Storage Orchestration Platform",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/api/drives", response_model=List[Drive])
async def get_drives():
    """Get all drives with health metrics"""
    return MOCK_DATA['drives']

@app.get("/api/drives/{drive_id}")
async def get_drive(drive_id: str):
    """Get specific drive details"""
    for drive in MOCK_DATA['drives']:
        if drive['id'] == drive_id:
            return drive
    raise HTTPException(status_code=404, detail="Drive not found")

@app.get("/api/drives/{drive_id}/health")
async def get_drive_health(drive_id: str):
    """Get detailed health analysis for a drive"""
    for drive in MOCK_DATA['drives']:
        if drive['id'] == drive_id:
            # Recalculate health using ML model simulation
            health_score = calculate_health_score(drive['smart_data'])
            risk_level = get_risk_level(health_score)
            predicted_failure = predict_failure_days(health_score, drive['smart_data'])
            
            return {
                "drive_id": drive_id,
                "health_score": round(health_score, 1),
                "risk_level": risk_level,
                "predicted_failure_days": predicted_failure,
                "confidence": 0.92,
                "top_factors": [
                    {"factor": "Reallocated Sectors", "impact": drive['reallocated_sectors'] * 0.35},
                    {"factor": "Power-On Hours", "impact": min(drive['power_on_hours'] / 100000, 0.25)},
                    {"factor": "Read Error Rate", "impact": (100 - drive['read_error_rate']) / 100 * 0.25}
                ],
                "recommendations": [
                    "Schedule backup within 7 days" if health_score < 50 else "Monitor closely",
                    "Enable cloud sync for critical files" if health_score < 70 else "Standard monitoring",
                    "Consider drive replacement" if health_score < 40 else "No immediate action needed"
                ]
            }
    raise HTTPException(status_code=404, detail="Drive not found")

@app.get("/api/files", response_model=List[File])
async def get_files(tier: Optional[str] = None, drive_id: Optional[str] = None):
    """Get all files with optional filtering"""
    files = MOCK_DATA['files']
    
    if tier:
        files = [f for f in files if f['tier'] == tier.upper()]
    
    return files

@app.get("/api/files/{file_id}")
async def get_file(file_id: str):
    """Get specific file details"""
    for file in MOCK_DATA['files']:
        if file['id'] == file_id:
            # Add access pattern analysis
            access_analysis = classify_access_pattern(file)
            compression_analysis = calculate_compression_benefit(file)
            
            return {
                **file,
                "access_analysis": access_analysis,
                "compression_analysis": compression_analysis,
                "size_formatted": format_bytes(file['size'])
            }
    raise HTTPException(status_code=404, detail="File not found")

@app.post("/api/tiering-plan")
async def create_tiering_plan(request: TieringPlanRequest):
    """Generate intelligent tiering recommendations"""
    
    recommendations = []
    total_savings = 0
    
    for file in MOCK_DATA['files']:
        # Get access pattern classification
        access_info = classify_access_pattern(file)
        
        # Determine recommended tier
        current_tier = file['tier']
        recommended_tier = access_info['tier']
        
        # Override based on drive health
        file_drive = None
        for drive in MOCK_DATA['drives']:
            if drive['health_score'] < 50 and file['risk_level'] == 'CRITICAL':
                recommended_tier = 'HOT'  # Move critical files from failing drives
                break
        
        if current_tier != recommended_tier:
            size_gb = file['size'] / (1024**3)
            
            # Calculate cost delta
            tier_costs = {'HOT': 0.023, 'WARM': 0.0125, 'COLD': 0.004, 'ARCHIVE': 0.00099}
            current_cost = size_gb * tier_costs.get(current_tier, 0.023)
            new_cost = size_gb * tier_costs.get(recommended_tier, 0.023)
            savings = (current_cost - new_cost) * 83  # Convert to INR
            
            # Determine urgency
            if file['risk_level'] == 'CRITICAL' and any(d['health_score'] < 40 for d in MOCK_DATA['drives']):
                urgency = "IMMEDIATE"
            elif access_info['confidence'] > 0.8:
                urgency = "7_DAYS"
            else:
                urgency = "30_DAYS"
            
            recommendations.append(TieringRecommendation(
                file_id=file['id'],
                file_name=file['name'],
                current_tier=current_tier,
                recommended_tier=recommended_tier,
                recommended_cloud="AWS S3 " + recommended_tier,
                estimated_savings=round(savings, 2),
                migration_urgency=urgency,
                reason=f"Access pattern: {access_info['frequency_score']*100:.0f}% frequency, {access_info['recency_score']*100:.0f}% recency",
                confidence=access_info['confidence']
            ))
            
            total_savings += savings
    
    # Generate strategy options
    strategies = generate_tiering_strategies(
        MOCK_DATA['files'],
        MOCK_DATA['drives'],
        request.risk_tolerance
    )
    
    return {
        "total_recommendations": len(recommendations),
        "total_estimated_savings": round(total_savings, 2),
        "recommendations": sorted(recommendations, key=lambda x: x.estimated_savings, reverse=True)[:20],
        "strategy_options": strategies,
        "summary": {
            "hot_to_warm": sum(1 for r in recommendations if r.current_tier == 'HOT' and r.recommended_tier == 'WARM'),
            "warm_to_cold": sum(1 for r in recommendations if r.current_tier == 'WARM' and r.recommended_tier == 'COLD'),
            "cold_to_archive": sum(1 for r in recommendations if r.current_tier == 'COLD' and r.recommended_tier == 'ARCHIVE'),
            "critical_migrations": sum(1 for r in recommendations if r.migration_urgency == 'IMMEDIATE')
        }
    }

@app.get("/api/compression")
async def get_compression_recommendations(min_roi: float = 1.5):
    """Get compression optimization recommendations"""
    
    recommendations = []
    total_savings = 0
    total_size_reduction = 0
    
    for file in MOCK_DATA['files']:
        compression_info = calculate_compression_benefit(file)
        
        if compression_info.get('recommend', False) and compression_info.get('roi_score', 0) >= min_roi:
            recommendations.append(CompressionRecommendation(
                file_id=file['id'],
                file_name=file['name'],
                current_size=file['size'],
                compressed_size=compression_info['compressed_size'],
                compression_ratio=compression_info['compression_ratio'],
                algorithm=compression_info['algorithm'],
                monthly_savings=compression_info['monthly_savings'],
                compression_time=compression_info['compression_time_minutes'],
                roi_score=compression_info['roi_score'],
                recommend=True
            ))
            
            total_savings += compression_info['monthly_savings']
            total_size_reduction += file['size'] - compression_info['compressed_size']
    
    return {
        "total_recommendations": len(recommendations),
        "total_monthly_savings": round(total_savings, 2),
        "total_size_reduction": format_bytes(total_size_reduction),
        "recommendations": sorted(recommendations, key=lambda x: x.roi_score, reverse=True)[:15]
    }

@app.get("/api/cloud-options")
async def get_cloud_options_endpoint(tier: str = "COLD", size_gb: float = 100):
    """Get multi-cloud storage options"""
    return get_cloud_options(tier.upper(), size_gb)

@app.get("/api/alerts")
async def get_alerts(severity: Optional[str] = None):
    """Get system alerts"""
    alerts = MOCK_DATA['alerts']
    
    if severity:
        alerts = [a for a in alerts if a['severity'] == severity.lower()]
    
    return alerts

@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert"""
    for alert in MOCK_DATA['alerts']:
        if alert['id'] == alert_id:
            alert['acknowledged'] = True
            return {"message": "Alert acknowledged", "alert_id": alert_id}
    raise HTTPException(status_code=404, detail="Alert not found")

@app.get("/api/dashboard")
async def get_dashboard_summary():
    """Get dashboard overview data"""
    
    drives = MOCK_DATA['drives']
    files = MOCK_DATA['files']
    
    # Calculate statistics
    total_capacity = sum(d['capacity'] for d in drives)
    total_used = sum(d['used'] for d in drives)
    avg_health = sum(d['health_score'] for d in drives) / len(drives)
    
    critical_drives = sum(1 for d in drives if d['risk_level'] == 'CRITICAL')
    high_risk_drives = sum(1 for d in drives if d['risk_level'] == 'HIGH')
    
    # Tier distribution
    tier_counts = {}
    tier_sizes = {}
    for file in files:
        tier = file['tier']
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
        tier_sizes[tier] = tier_sizes.get(tier, 0) + file['size']
    
    # Recent alerts
    unacknowledged_alerts = [a for a in MOCK_DATA['alerts'] if not a['acknowledged']]
    
    return {
        "storage_summary": {
            "total_capacity_gb": total_capacity,
            "total_used_gb": total_used,
            "utilization_percent": round(total_used / total_capacity * 100, 1),
            "total_files": len(files)
        },
        "health_summary": {
            "average_health_score": round(avg_health, 1),
            "critical_drives": critical_drives,
            "high_risk_drives": high_risk_drives,
            "healthy_drives": len(drives) - critical_drives - high_risk_drives
        },
        "tier_distribution": {
            tier: {
                "files": count,
                "size_gb": round(tier_sizes.get(tier, 0) / (1024**3), 2)
            }
            for tier, count in tier_counts.items()
        },
        "cost_summary": MOCK_DATA['cost_projections'],
        "alerts": {
            "total": len(unacknowledged_alerts),
            "critical": sum(1 for a in unacknowledged_alerts if a['severity'] == 'critical'),
            "high": sum(1 for a in unacknowledged_alerts if a['severity'] == 'high'),
            "items": unacknowledged_alerts
        }
    }

@app.post("/api/apply-plan")
async def apply_tiering_plan(plan_id: str = "default"):
    """Simulate applying a tiering plan"""
    return {
        "status": "simulated",
        "message": "Tiering plan execution simulated (hackathon demo mode)",
        "plan_id": plan_id,
        "timestamp": datetime.now().isoformat(),
        "simulated_actions": {
            "files_migrated": 23,
            "estimated_time": "45 minutes",
            "cost_savings": 1245.30
        }
    }

@app.get("/api/export/lifecycle")
async def export_lifecycle_policy(provider: str = "aws"):
    """Export S3 lifecycle policy JSON"""
    
    if provider.lower() == "aws":
        policy = {
            "Rules": [
                {
                    "ID": "GuardianDrive-HotToWarm",
                    "Status": "Enabled",
                    "Filter": {"Prefix": ""},
                    "Transitions": [
                        {
                            "Days": 30,
                            "StorageClass": "INTELLIGENT_TIERING"
                        }
                    ]
                },
                {
                    "ID": "GuardianDrive-WarmToCold",
                    "Status": "Enabled",
                    "Filter": {"Prefix": "archive/"},
                    "Transitions": [
                        {
                            "Days": 90,
                            "StorageClass": "GLACIER_IR"
                        }
                    ]
                },
                {
                    "ID": "GuardianDrive-ColdToDeep",
                    "Status": "Enabled",
                    "Filter": {"Prefix": "deep-archive/"},
                    "Transitions": [
                        {
                            "Days": 365,
                            "StorageClass": "DEEP_ARCHIVE"
                        }
                    ]
                }
            ]
        }
    else:
        policy = {"message": f"Lifecycle policy for {provider} not yet implemented"}
    
    return policy

# ============================================================================
# Startup
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
