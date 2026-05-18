"""
CrisesMesh AI — Alert Routes
GET  /alerts              — List all alerts
POST /alerts/generate     — AI generates bilingual alert draft
POST /alerts/approve      — Government approves alert
POST /alerts/retract      — Retract / correct an alert
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/alerts", tags=["Alerts"])

# In-memory alerts store
_alerts: Dict[str, Dict[str, Any]] = {}


@router.get("")
async def list_alerts():
    """List all alerts."""
    return {"alerts": list(_alerts.values()), "count": len(_alerts)}


@router.post("/generate")
async def generate_alert(payload: Dict[str, Any]):
    """
    AI drafts bilingual alert for an incident.
    Called automatically by NotificationAgent, or manually by government.
    """
    incident_id = payload.get("incident_id", "inc_001")
    incident_type = payload.get("incident_type", "Urban Flooding")
    severity = payload.get("severity", "Critical")
    location = payload.get("location", "G-10 Underpass, Islamabad")

    alert_id = f"alert_{uuid.uuid4().hex[:8]}"

    english = (
        f"🚨 EMERGENCY ALERT — {severity.upper()} {incident_type.upper()}\n"
        f"Location: {location}\n"
        f"Danger level: {severity}. Residents must avoid the area immediately.\n"
        f"Emergency services have been dispatched. Stay indoors and await further instructions."
    )

    roman_urdu = (
        f"🚨 HATAMI KHABAR — {severity.upper()} {incident_type.upper()}\n"
        f"Muqam: {location}\n"
        f"Khatarnak satah: {severity}. Logon ko is ilaqe se fori door rehna chahiye.\n"
        f"Emergency services bhaij diye gaye hain. Ghar ke andar rahein aur aaglay احکامات ka intezaar karein."
    )

    alert = {
        "id": alert_id,
        "incident_id": incident_id,
        "status": "Draft",
        "severity": severity,
        "incident_type": incident_type,
        "location": location,
        "english_text": english,
        "roman_urdu_text": roman_urdu,
        "channels": ["in_app", "sms", "whatsapp"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "approved_by": None,
        "approved_at": None,
    }

    _alerts[alert_id] = alert
    return alert


@router.post("/approve")
async def approve_alert(payload: Dict[str, Any]):
    """Government official approves an alert draft — makes it Live."""
    alert_id = payload.get("alert_id")
    approved_by = payload.get("approved_by", "Government Official")

    if not alert_id or alert_id not in _alerts:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    alert = _alerts[alert_id]
    if alert["status"] == "Retracted":
        raise HTTPException(status_code=400, detail="Cannot approve a retracted alert")

    alert["status"] = "Approved"
    alert["approved_by"] = approved_by
    alert["approved_at"] = datetime.now(timezone.utc).isoformat()

    return {
        "success": True,
        "alert": alert,
        "message": f"✅ Alert {alert_id} approved and published by {approved_by}",
    }


@router.post("/retract")
async def retract_alert(payload: Dict[str, Any]):
    """
    Retract / correct an existing alert.
    Used by Recovery Agent when incident is reclassified.
    """
    alert_id = payload.get("alert_id")
    reason = payload.get("reason", "Incident reclassified")
    new_alert_text = payload.get("new_english_text", None)

    if not alert_id or alert_id not in _alerts:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")

    alert = _alerts[alert_id]
    alert["status"] = "Retracted"
    alert["retracted_at"] = datetime.now(timezone.utc).isoformat()
    alert["retraction_reason"] = reason

    if new_alert_text:
        alert["correction_text"] = new_alert_text

    return {
        "success": True,
        "alert": alert,
        "message": f"⚠️ Alert {alert_id} retracted. Reason: {reason}",
    }
