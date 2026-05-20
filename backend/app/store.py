"""
CrisesMesh AI — In-Memory Data Store
Thread-safe in-memory storage for MVP development.
Will be replaced with Supabase in Task 2.2.
"""

from typing import Dict, List
from datetime import datetime, timezone
import uuid

from app.schemas import (
    CitizenReportCreate,
    CitizenReportResponse,
    SignalResponse,
    IncidentResponse,
    ReportStatus,
    IncidentStatus,
    SeverityLevel,
)


class InMemoryStore:
    """Simple in-memory store for MVP. Thread-safe enough for single-worker uvicorn."""

    def __init__(self):
        self.reset()

    def reset(self):
        """Clear all data — used by POST /demo/reset."""
        self.reports: Dict[str, CitizenReportResponse] = {}
        self.signals: Dict[str, SignalResponse] = {}
        self.incidents: Dict[str, IncidentResponse] = {}
        self._report_counter = 0
        self._signal_counter = 0
        self._incident_counter = 0
        
        # Shelter Seeds
        self.shelters: Dict[str, dict] = {
            "shelter_001": {
                "id": "shelter_001",
                "name": "G-10 Community Center Shelter",
                "status": "Available",
                "capacity": 250,
                "occupancy": 85,
                "lat": 33.6912,
                "lng": 73.0485
            },
            "shelter_002": {
                "id": "shelter_002",
                "name": "F-11 CDA Model School Safe Zone",
                "status": "Available",
                "capacity": 180,
                "occupancy": 42,
                "lat": 33.6824,
                "lng": 73.0189
            },
            "shelter_003": {
                "id": "shelter_003",
                "name": "Sector I-9 Social Welfare Center",
                "status": "Closed",
                "capacity": 300,
                "occupancy": 0,
                "lat": 33.6591,
                "lng": 73.0632
            }
        }

        # Seed an initial incident for testing and demo consistency
        now = datetime.now(timezone.utc)
        self.incidents["inc_001"] = IncidentResponse(
            id="inc_001",
            type="Urban Flooding",
            status=IncidentStatus.ACTIVE,
            severity=SeverityLevel.CRITICAL,
            confidence=0.88,
            priority_score=85,
            lat=33.6938,
            lng=73.0652,
            affected_radius_m=1200,
            estimated_population=15000,
            expected_duration_hours=6,
            created_at=now
        )


    # ──────────── Reports ────────────

    def create_report(self, data: CitizenReportCreate) -> CitizenReportResponse:
        self._report_counter += 1
        report_id = f"report_{self._report_counter:03d}"
        now = datetime.now(timezone.utc)

        report = CitizenReportResponse(
            id=report_id,
            citizen_name=data.citizen_name,
            phone=data.phone,
            category=data.category,
            severity=data.severity,
            description=data.description,
            transcribed_voice_text=data.transcribed_voice_text,
            photo_url=data.photo_url,
            lat=data.lat,
            lng=data.lng,
            road_blocked=data.road_blocked,
            status=ReportStatus.SUBMITTED,
            created_at=now,
        )
        self.reports[report_id] = report

        # Auto-create signal from citizen report
        self._create_signal_from_report(report)

        return report

    def get_report(self, report_id: str) -> CitizenReportResponse | None:
        return self.reports.get(report_id)

    def list_reports(self) -> List[CitizenReportResponse]:
        return list(self.reports.values())

    # ──────────── Signals ────────────

    def _create_signal_from_report(self, report: CitizenReportResponse) -> SignalResponse:
        self._signal_counter += 1
        signal_id = f"sig_{self._signal_counter:03d}"

        signal = SignalResponse(
            id=signal_id,
            source="citizen_report",
            incident_candidate_id=None,
            text=f"{report.category.value}: {report.description[:100]}",
            lat=report.lat,
            lng=report.lng,
            credibility_score=0.78,
            geo_confidence=0.91,
            urgency_score=0.84 if report.road_blocked else 0.65,
            timestamp=report.created_at,
        )
        self.signals[signal_id] = signal
        return signal

    def list_signals(self) -> List[SignalResponse]:
        return list(self.signals.values())

    # ──────────── Incidents ────────────

    def create_incident_from_report(self, report: CitizenReportResponse) -> IncidentResponse:
        self._incident_counter += 1
        incident_id = f"inc_{self._incident_counter:03d}"
        now = datetime.now(timezone.utc)

        # Map severity
        severity = report.severity or SeverityLevel.MEDIUM

        incident = IncidentResponse(
            id=incident_id,
            type=report.category.value,
            status=IncidentStatus.CANDIDATE,
            severity=severity,
            confidence=0.65,  # Initial confidence from single report
            priority_score=55,
            lat=report.lat,
            lng=report.lng,
            affected_radius_m=300,
            estimated_population=3000,
            expected_duration_hours=2,
            peak_impact_time=None,
            report_ids=[report.id],
            signal_ids=[],
            created_at=now,
        )
        self.incidents[incident_id] = incident
        return incident

    def list_incidents(self) -> List[IncidentResponse]:
        return list(self.incidents.values())

    def get_incident(self, incident_id: str) -> IncidentResponse | None:
        return self.incidents.get(incident_id)

    # ──────────── Shelters ────────────

    def list_shelters(self) -> List[dict]:
        return list(self.shelters.values())

    def get_shelter(self, shelter_id: str) -> dict | None:
        return self.shelters.get(shelter_id)

    def toggle_shelter(self, shelter_id: str) -> bool:
        if shelter_id in self.shelters:
            curr = self.shelters[shelter_id]["status"]
            next_status = "Closed" if curr == "Available" else "Available"
            self.shelters[shelter_id]["status"] = next_status
            if next_status == "Closed":
                self.shelters[shelter_id]["occupancy"] = 0
            return True
        return False


# Global singleton
store = InMemoryStore()

