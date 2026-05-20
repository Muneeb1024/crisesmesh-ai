"""
CrisesMesh AI — FastAPI Backend Application
Main entry point with CORS, routing, and health check.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from app.config import settings
from app.schemas import HealthResponse
from app.routes import citizen, government, demo, agents, resources, alerts, recovery

# ──────────── App Setup ────────────

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="CrisesMesh AI — Multi-crisis management backend for Urban Flooding MVP",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ──────────── CORS ────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────── Routes ────────────

app.include_router(citizen.router, prefix="/api/v1")
app.include_router(government.router, prefix="/api/v1")
app.include_router(demo.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(resources.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(recovery.router, prefix="/api/v1")


# ──────────── Health Check ────────────

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc),
    )


import os
from fastapi.staticfiles import StaticFiles

static_path = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")
else:
    @app.get("/", tags=["System"])
    async def root():
        """Root endpoint with API info."""
        return {
            "app": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/health",
            "endpoints": {
                "citizen_reports": "/api/v1/citizen/reports",
                "government_incidents": "/api/v1/government/incidents",
                "demo_reset": "/api/v1/demo/reset",
                "demo_scenario": "/api/v1/demo/start-flood-scenario",
            },
        }

