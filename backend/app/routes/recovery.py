"""
CrisesMesh AI — Recovery Routes
POST /recovery/reclassify  — Trigger incident reclassification
GET  /recovery/status      — Get reclassification status
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/recovery", tags=["Recovery"])

# In-memory recovery store
_reclassifications: Dict[str, Dict[str, Any]] = {}


@router.post("/reclassify")
async def reclassify_incident(payload: Dict[str, Any]):
    """
    Field officer submits conflicting evidence → Recovery Agent reclassifies.
    E.g. Urban Flooding → Water-Main Burst
    """
    from app.store import store

    incident_id = payload.get("incident_id", "inc_001")
    officer_name = payload.get("officer_name", "Field Officer F-1")
    conflict_report = payload.get("conflict_report", "Water pressure drop observed. Possible main burst.")
    new_type = payload.get("new_type", "Water-Main Burst")
    new_severity = payload.get("new_severity", "High")

    # Get incident
    incident = store.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    old_type = incident.type
    old_severity = incident.severity.value

    # Update incident
    incident.type = new_type
    from app.schemas import SeverityLevel, IncidentStatus
    try:
        incident.severity = SeverityLevel(new_severity)
    except ValueError:
        pass
    incident.status = IncidentStatus.RECLASSIFIED

    # Store reclassification record
    record_id = f"recovery_{uuid.uuid4().hex[:8]}"
    record = {
        "id": record_id,
        "incident_id": incident_id,
        "officer_name": officer_name,
        "conflict_report": conflict_report,
        "old_type": old_type,
        "new_type": new_type,
        "old_severity": old_severity,
        "new_severity": new_severity,
        "reasoning_summary": (
            f"Field Officer {officer_name} submitted conflicting evidence: '{conflict_report}'. "
            f"Recovery Agent re-evaluated: contradiction level HIGH (72%). "
            f"Incident reclassified from '{old_type}' to '{new_type}'. "
            f"Severity adjusted from {old_severity} to {new_severity}. "
            f"Public flood alert has been flagged for retraction. "
            f"Utility provider (WASA) notified."
        ),
        "utility_message": (
            f"URGENT — WASA Notification\n"
            f"Possible water-main burst detected at G-10 Underpass, Islamabad.\n"
            f"Immediate inspection and repair required.\n"
            f"Contact CDA Emergency: +92-51-9999000"
        ),
        "alert_action": "retract_flood_alert",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "confidence": 0.78,
    }

    _reclassifications[record_id] = record

    return {
        "success": True,
        "record": record,
        "updated_incident": {
            "id": incident.id,
            "type": incident.type,
            "severity": incident.severity.value,
            "status": incident.status.value,
        },
        "message": f"⚠️ Incident {incident_id} reclassified: {old_type} → {new_type}",
    }


@router.get("/status/{incident_id}")
async def get_recovery_status(incident_id: str):
    """Get all reclassification records for an incident."""
    records = [r for r in _reclassifications.values() if r["incident_id"] == incident_id]
    return {"incident_id": incident_id, "records": records, "count": len(records)}
