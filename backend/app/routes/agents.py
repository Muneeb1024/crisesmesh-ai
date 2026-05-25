"""
CrisesMesh AI — Agent Routes
POST /agents/run-pipeline — Run full 7-agent pipeline for an incident
GET  /agents/traces/{incident_id} — Get traces for an incident
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from app.agents.orchestrator import orchestrator
from app.store import store

router = APIRouter(prefix="/agents", tags=["Agents"])

# In-memory trace storage
_trace_store: Dict[str, List[Dict[str, Any]]] = {}


@router.post("/run-pipeline")
async def run_agent_pipeline(incident_id: str = "inc_001"):
    """
    Run the full 7-agent pipeline for a given incident.
    Uses signals from the in-memory store.
    """
    # Get incident
    incident = store.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    # Get all signals
    all_signals = store.list_signals()
    signal_dicts = [
        {
            "id": s.id,
            "source": s.source,
            "text": s.text,
            "lat": s.lat,
            "lng": s.lng,
            "credibility_score": s.credibility_score,
            "geo_confidence": s.geo_confidence,
            "urgency_score": s.urgency_score,
            "timestamp": s.timestamp.isoformat(),
        }
        for s in all_signals
    ]

    # Run pipeline
    result = await orchestrator.run_pipeline(incident_id, signal_dicts)

    # Store traces
    _trace_store[incident_id] = result["traces"]

    # Save the notification alert to the global alerts store
    notification_output = result["final_output"].get("notification", {})
    if notification_output:
        alert_info = notification_output.get("alert", {})
        if alert_info:
            from app.routes.alerts import _alerts
            from datetime import datetime, timezone
            import uuid

            # Clear any existing alerts for this incident to avoid duplicate clutter
            keys_to_delete = [k for k, v in _alerts.items() if v.get("incident_id") == incident_id]
            for k in keys_to_delete:
                del _alerts[k]

            alert_id = f"alert_{uuid.uuid4().hex[:8]}"
            alert = {
                "id": alert_id,
                "incident_id": incident_id,
                "status": "Draft",
                "severity": alert_info.get("severity", incident.severity.value if (incident and incident.severity) else "Medium"),
                "incident_type": incident.type if incident else "Urban Flooding",
                "location": "G-10 Underpass, Islamabad" if (incident and incident.lat == 33.6793) else (f"Coordinates: {incident.lat:.4f}, {incident.lng:.4f}" if incident else "G-10 Underpass, Islamabad"),
                "english_text": alert_info.get("english_text", ""),
                "roman_urdu_text": alert_info.get("roman_urdu_text", ""),
                "channels": alert_info.get("channels", ["in_app", "sms", "whatsapp"]),
                "stakeholder_notifications": notification_output.get("stakeholder_notifications", []),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "approved_by": None,
                "approved_at": None,
            }
            _alerts[alert_id] = alert

    # Update incident with agent outputs
    severity_output = result["final_output"].get("severity", {})
    classification_output = result["final_output"].get("classification", {})
    fusion_output = result["final_output"].get("fusion", {})

    if incident:
        incident.confidence = fusion_output.get("overall_confidence", incident.confidence)
        incident.priority_score = severity_output.get("priority_score", incident.priority_score)
        incident.affected_radius_m = severity_output.get("affected_radius_m", incident.affected_radius_m)
        incident.estimated_population = severity_output.get("estimated_population", incident.estimated_population)
        incident.expected_duration_hours = severity_output.get("expected_duration_hours", incident.expected_duration_hours)
        incident.peak_impact_time = severity_output.get("peak_impact_time", incident.peak_impact_time)

        # Update status from Candidate to Active
        from app.schemas import IncidentStatus, SeverityLevel
        incident.status = IncidentStatus.ACTIVE
        sev_str = severity_output.get("severity", "Medium")
        try:
            incident.severity = SeverityLevel(sev_str)
        except ValueError:
            pass

    return result


@router.get("/traces/{incident_id}")
async def get_traces(incident_id: str):
    """Get all agent traces for a specific incident."""
    traces = _trace_store.get(incident_id, [])
    if not traces:
        raise HTTPException(status_code=404, detail=f"No traces found for {incident_id}")
    return {"incident_id": incident_id, "traces": traces, "count": len(traces)}


@router.get("/traces")
async def list_all_traces():
    """List all stored traces across all incidents."""
    all_traces = []
    for incident_id, traces in _trace_store.items():
        for t in traces:
            all_traces.append(t)
    return {"traces": all_traces, "count": len(all_traces)}
