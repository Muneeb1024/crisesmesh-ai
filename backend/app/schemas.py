"""
CrisesMesh AI — Pydantic Schemas
Request/response models for all API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ──────────── Enums ────────────

class ReportCategory(str, Enum):
    URBAN_FLOODING = "Urban Flooding"
    WATER_LOGGING = "Water Logging"
    DRAIN_OVERFLOW = "Drain Overflow"
    FIRE_INCIDENT = "Fire Incident"
    EARTHQUAKE_DAMAGE = "Earthquake Damage"
    ROAD_BLOCKAGE = "Road Blockage"
    INFRASTRUCTURE_DAMAGE = "Infrastructure Damage"
    MEDICAL_EMERGENCY = "Medical Emergency"
    LANDSLIDE = "Landslide"
    GAS_LEAK = "Gas Leak"
    POWER_OUTAGE = "Power Outage"
    OTHER_EMERGENCY = "Other Emergency"


class ReportStatus(str, Enum):
    SUBMITTED = "Submitted"
    UNDER_REVIEW = "Under Review"
    VERIFIED = "Verified"
    RESOLVED = "Resolved"


class SeverityLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class IncidentStatus(str, Enum):
    CANDIDATE = "Candidate"
    ACTIVE = "Active"
    RESOLVED = "Resolved"
    FALSE_ALARM = "False Alarm"


# ──────────── Citizen Report ────────────

class CitizenReportCreate(BaseModel):
    citizen_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=5, max_length=20)
    category: ReportCategory
    severity: Optional[SeverityLevel] = None
    description: str = Field(..., min_length=5, max_length=2000)
    transcribed_voice_text: Optional[str] = None
    photo_url: Optional[str] = None
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    road_blocked: bool = False


class CitizenReportResponse(BaseModel):
    id: str
    citizen_name: str
    phone: str
    category: ReportCategory
    severity: Optional[SeverityLevel] = None
    description: str
    transcribed_voice_text: Optional[str] = None
    photo_url: Optional[str] = None
    lat: float
    lng: float
    road_blocked: bool = False
    status: ReportStatus
    created_at: datetime


# ──────────── Signal ────────────

class SignalResponse(BaseModel):
    id: str
    source: str
    incident_candidate_id: Optional[str] = None
    text: str
    lat: float
    lng: float
    credibility_score: float
    geo_confidence: float
    urgency_score: float
    timestamp: datetime


# ──────────── Incident ────────────

class IncidentResponse(BaseModel):
    id: str
    type: str
    status: IncidentStatus
    severity: SeverityLevel
    confidence: float
    priority_score: int
    lat: float
    lng: float
    affected_radius_m: int
    estimated_population: int
    expected_duration_hours: int
    peak_impact_time: Optional[str] = None
    report_ids: List[str] = []
    signal_ids: List[str] = []
    created_at: datetime


# ──────────── Health ────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    app_name: str
    version: str
    timestamp: datetime


# ──────────── Demo ────────────

class DemoResetResponse(BaseModel):
    status: str = "reset"
    message: str = "All demo data cleared"
    timestamp: datetime
