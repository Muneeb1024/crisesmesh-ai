"""
CrisesMesh AI — Resource Routes
GET  /resources           — List all resources
GET  /resources/{id}      — Get single resource
POST /resources/approve   — Approve AI resource allocation
POST /resources/release   — Release / recall resource
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime, timezone

router = APIRouter(prefix="/resources", tags=["Resources"])

# ── Seed resource pool ────────────────────────────────────────────────
_resources: Dict[str, Dict[str, Any]] = {
    "res_001": {"id": "res_001", "type": "rescue_team",  "name": "Rescue Team Alpha",  "status": "Available",  "lat": 33.6938, "lng": 73.0652, "capacity": 8,  "eta_minutes": 8},
    "res_002": {"id": "res_002", "type": "rescue_team",  "name": "Rescue Team Bravo",  "status": "Available",  "lat": 33.7105, "lng": 73.0487, "capacity": 8,  "eta_minutes": 12},
    "res_003": {"id": "res_003", "type": "ambulance",    "name": "Ambulance Unit 3",   "status": "Available",  "lat": 33.6988, "lng": 73.0721, "capacity": 2,  "eta_minutes": 6},
    "res_004": {"id": "res_004", "type": "ambulance",    "name": "Ambulance Unit 7",   "status": "Available",  "lat": 33.7022, "lng": 73.0590, "capacity": 2,  "eta_minutes": 14},
    "res_005": {"id": "res_005", "type": "police",       "name": "Police Unit G-10",   "status": "Available",  "lat": 33.6901, "lng": 73.0670, "capacity": 4,  "eta_minutes": 5},
    "res_006": {"id": "res_006", "type": "police",       "name": "Police Unit G-11",   "status": "Unavailable","lat": 33.7150, "lng": 73.0410, "capacity": 4,  "eta_minutes": 20},
    "res_007": {"id": "res_007", "type": "water_pump",   "name": "Water Pump WP-1",    "status": "Available",  "lat": 33.6855, "lng": 73.0710, "capacity": 1,  "eta_minutes": 15},
    "res_008": {"id": "res_008", "type": "water_pump",   "name": "Water Pump WP-2",    "status": "Available",  "lat": 33.6822, "lng": 73.0555, "capacity": 1,  "eta_minutes": 18},
    "res_009": {"id": "res_009", "type": "field_officer","name": "Field Officer F-1",  "status": "Available",  "lat": 33.6960, "lng": 73.0605, "capacity": 1,  "eta_minutes": 4},
    "res_010": {"id": "res_010", "type": "field_officer","name": "Field Officer F-2",  "status": "Available",  "lat": 33.7080, "lng": 73.0530, "capacity": 1,  "eta_minutes": 9},
}

# Track approvals
_approvals: Dict[str, Dict[str, Any]] = {}  # incident_id -> approval record


@router.get("")
async def list_resources():
    """List all resources with their current status."""
    return {"resources": list(_resources.values()), "count": len(_resources)}


@router.get("/{resource_id}")
async def get_resource(resource_id: str):
    """Get a single resource by ID."""
    r = _resources.get(resource_id)
    if not r:
        raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")
    return r


@router.post("/approve")
async def approve_resource_allocation(payload: Dict[str, Any]):
    """
    Government approves AI-recommended resource allocation.
    Updates resource statuses to Assigned / En Route.
    """
    incident_id = payload.get("incident_id", "inc_001")
    resource_ids = payload.get("resource_ids", [])
    approved_by = payload.get("approved_by", "Government Official")

    if not resource_ids:
        raise HTTPException(status_code=400, detail="No resource IDs provided")

    assigned = []
    for rid in resource_ids:
        if rid in _resources:
            res = _resources[rid]
            if res["status"] == "Available":
                res["status"] = "En Route"
                res["assigned_incident"] = incident_id
                res["assigned_at"] = datetime.now(timezone.utc).isoformat()
                assigned.append(rid)

    # Record approval
    _approvals[incident_id] = {
        "incident_id": incident_id,
        "approved_by": approved_by,
        "approved_at": datetime.now(timezone.utc).isoformat(),
        "resource_ids": assigned,
        "status": "Approved",
    }

    return {
        "success": True,
        "incident_id": incident_id,
        "approved_resources": assigned,
        "skipped": [r for r in resource_ids if r not in assigned],
        "message": f"✅ {len(assigned)} resources dispatched for {incident_id}",
    }


@router.post("/release")
async def release_resources(payload: Dict[str, Any]):
    """Release / recall resources back to Available."""
    incident_id = payload.get("incident_id", "inc_001")

    released = []
    for rid, res in _resources.items():
        if res.get("assigned_incident") == incident_id:
            res["status"] = "Available"
            res.pop("assigned_incident", None)
            res.pop("assigned_at", None)
            released.append(rid)

    return {"success": True, "released": released}
