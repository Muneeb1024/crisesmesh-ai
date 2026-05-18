"""
CrisesMesh AI — Demo Routes
POST /demo/reset — Reset all in-memory data
GET  /demo/signals — List all signals
POST /demo/start-flood-scenario — Create demo data
"""

from fastapi import APIRouter
from datetime import datetime, timezone
from typing import List

from app.schemas import DemoResetResponse, SignalResponse, CitizenReportCreate, ReportCategory, SeverityLevel
from app.store import store

router = APIRouter(prefix="/demo", tags=["Demo"])


@router.post("/reset", response_model=DemoResetResponse)
async def reset_demo():
    """Reset all demo data."""
    store.reset()
    return DemoResetResponse(
        status="reset",
        message="All demo data cleared",
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/signals", response_model=List[SignalResponse])
async def list_signals():
    """List all signals (from reports + mock generators)."""
    return store.list_signals()


@router.post("/start-flood-scenario")
async def start_flood_scenario():
    """
    Task 3.2 — Full 7-signal controlled flood scenario near G-10 Islamabad.
    Creates 3 citizen reports + 7 distinct signals linked to one master incident.
    Reliable for judge demo.
    """
    store.reset()

    now = datetime.now(timezone.utc)

    # ── 3 Citizen Reports ──
    demo_reports = [
        CitizenReportCreate(
            citizen_name="Ali Khan",
            phone="03001234567",
            category=ReportCategory.URBAN_FLOODING,
            severity=SeverityLevel.HIGH,
            description="G-10 underpass mein pani bhar gaya hai, traffic ruk gaya hai",
            lat=33.6844, lng=73.0479, road_blocked=True,
        ),
        CitizenReportCreate(
            citizen_name="Fatima Bibi",
            phone="03211234567",
            category=ReportCategory.URBAN_FLOODING,
            severity=SeverityLevel.HIGH,
            description="Water level rising near G-10 markaz, cars stuck in underpass",
            lat=33.6850, lng=73.0485, road_blocked=True,
        ),
        CitizenReportCreate(
            citizen_name="Ahmed Raza",
            phone="03451234567",
            category=ReportCategory.DRAIN_OVERFLOW,
            severity=SeverityLevel.MEDIUM,
            description="Nala overflow near G-10/4, water entering shops",
            lat=33.6838, lng=73.0470, road_blocked=False,
        ),
    ]

    reports = []
    for r in demo_reports:
        report = store.create_report(r)
        report.status = "Under Review"
        reports.append(report)

    # ── 1 Master Incident ──
    master_incident = store.create_incident_from_report(reports[0])
    master_incident.report_ids = [r.id for r in reports]
    incident_id = master_incident.id

    # ── 7 Signals (one per source type) ──
    signal_defs = [
        {   # 1. Citizen Report (already created, add enriched version)
            "id": "sig_s01", "source": "citizen_report",
            "text": "Urban Flooding: G-10 underpass mein pani bhar gaya hai — 3 confirming citizen reports",
            "lat": 33.6844, "lng": 73.0479,
            "credibility_score": 0.82, "geo_confidence": 0.91, "urgency_score": 0.88,
        },
        {   # 2. Weather / Rainfall
            "id": "sig_s02", "source": "weather",
            "text": "Heavy rainfall recorded — 45mm/hr at Islamabad Met Station. Forecast: continues 3 hours.",
            "lat": 33.7100, "lng": 73.0500,
            "credibility_score": 0.95, "geo_confidence": 0.75, "urgency_score": 0.90,
        },
        {   # 3. Traffic Congestion
            "id": "sig_s03", "source": "traffic",
            "text": "Traffic congestion index 0.87 near G-10. Unusual slowdown pattern consistent with road flooding.",
            "lat": 33.6844, "lng": 73.0479,
            "credibility_score": 0.78, "geo_confidence": 0.88, "urgency_score": 0.75,
        },
        {   # 4. Field Officer
            "id": "sig_s04", "source": "field_officer",
            "text": "Field Officer Malik on scene: underpass has 1.2m water depth. Road blocked. Possible water-main contribution.",
            "lat": 33.6844, "lng": 73.0479,
            "credibility_score": 0.91, "geo_confidence": 0.97, "urgency_score": 0.92,
        },
        {   # 5. Water-Level Sensor
            "id": "sig_s05", "source": "water_level_sensor",
            "text": "Sensor G10-WL-01: water level 2.3m — 0.8m above critical threshold. Rising at +15cm/hr.",
            "lat": 33.6840, "lng": 73.0475,
            "credibility_score": 0.97, "geo_confidence": 0.99, "urgency_score": 0.94,
        },
        {   # 6. Emergency Calls
            "id": "sig_s06", "source": "emergency_calls",
            "text": "Rescue 1122: call frequency +340% in G-10 sector over last 30 minutes. Multiple flood reports.",
            "lat": 33.6844, "lng": 73.0479,
            "credibility_score": 0.88, "geo_confidence": 0.72, "urgency_score": 0.91,
        },
        {   # 7. Historical Data
            "id": "sig_s07", "source": "historical_data",
            "text": "G-10 underpass is a historically flood-prone zone — flooded in 2019, 2021, 2022 under similar rainfall.",
            "lat": 33.6844, "lng": 73.0479,
            "credibility_score": 0.85, "geo_confidence": 0.80, "urgency_score": 0.60,
        },
    ]

    # Add signals to store
    for sdef in signal_defs:
        store._signal_counter += 1
        sig = SignalResponse(
            id=sdef["id"],
            source=sdef["source"],
            incident_candidate_id=incident_id,
            text=sdef["text"],
            lat=sdef["lat"],
            lng=sdef["lng"],
            credibility_score=sdef["credibility_score"],
            geo_confidence=sdef["geo_confidence"],
            urgency_score=sdef["urgency_score"],
            timestamp=now,
        )
        store.signals[sdef["id"]] = sig

    # Link signals to master incident
    master_incident.signal_ids = [s["id"] for s in signal_defs]

    return {
        "status": "scenario_created",
        "incident_id": incident_id,
        "reports_created": len(reports),
        "signals_created": len(signal_defs),
        "signal_sources": [s["source"] for s in signal_defs],
        "next_step": f"POST /api/v1/agents/run-pipeline?incident_id={incident_id}",
        "data": {
            "reports": [{"id": r.id, "category": r.category.value} for r in reports],
            "signals": [{"id": s["id"], "source": s["source"], "credibility": s["credibility_score"]} for s in signal_defs],
        },
    }

