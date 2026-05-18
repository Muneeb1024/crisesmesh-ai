"""
CrisesMesh AI — Government Routes
GET  /government/incidents — List all incidents
GET  /government/incidents/{id} — Get incident detail
POST /government/login-pin — Validate PIN
"""

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

from app.schemas import IncidentResponse
from app.store import store

router = APIRouter(prefix="/government", tags=["Government"])


class PinRequest(BaseModel):
    pin: str


class PinResponse(BaseModel):
    success: bool
    message: str


DEMO_PIN = "1122"


@router.post("/login-pin", response_model=PinResponse)
async def validate_pin(payload: PinRequest):
    """Validate government access PIN."""
    if payload.pin == DEMO_PIN:
        return PinResponse(success=True, message="Access granted")
    return PinResponse(success=False, message="Invalid PIN")


@router.get("/incidents", response_model=List[IncidentResponse])
async def list_incidents():
    """List all active incidents for the command center."""
    return store.list_incidents()


@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str):
    """Get detailed incident by ID."""
    incident = store.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return incident
