"""
CrisesMesh AI — Citizen Routes
POST /citizen/reports — Submit flood report
GET  /citizen/reports/{report_id} — Get report status
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas import CitizenReportCreate, CitizenReportResponse
from app.store import store

router = APIRouter(prefix="/citizen", tags=["Citizen"])


@router.post("/reports", response_model=CitizenReportResponse, status_code=201)
async def create_report(payload: CitizenReportCreate):
    """
    Submit a new citizen flood report.
    Automatically creates a signal and an incident candidate.
    """
    report = store.create_report(payload)

    # Auto-create incident candidate from report
    store.create_incident_from_report(report)

    # Update status to Under Review
    report.status = "Under Review"

    return report


@router.get("/reports/{report_id}", response_model=CitizenReportResponse)
async def get_report(report_id: str):
    """Get a specific report by ID."""
    report = store.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    return report


@router.get("/reports", response_model=List[CitizenReportResponse])
async def list_reports():
    """List all citizen reports."""
    return store.list_reports()
