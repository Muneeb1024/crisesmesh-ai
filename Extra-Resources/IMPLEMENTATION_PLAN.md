# CrisesMesh AI — Implementation Plan

## 1. Mission

CrisesMesh AI is a Pakistan-focused multi-crisis management system designed to help citizens report urban crises and help government responders verify, prioritize, simulate, and coordinate emergency response.

The MVP focuses on one complete end-to-end crisis workflow: **Urban Flooding**.

The app will also show a scalable multi-crisis command structure where other crisis modules are visible but marked as future modules.

---

## 2. Product Decision

### App Type

Build one mandatory mobile app with a dual-interface experience:

```text
CrisesMesh AI Mobile App
├── Citizen Module
└── Government Command Center Module
```

### MVP Functional Scope

Only the **Urban Flooding** module will be fully functional in the MVP.

Other crisis modules will appear in the sidebar as future scalable modules:

```text
Urban Flooding — Functional
Traffic Blockage — Future
Heat Emergency — Future
Power Outage — Future
Disease Cluster — Future
Public Disorder — Future
Infrastructure Failure — Future
```

### Demo City

Primary demo location:

```text
Islamabad / Rawalpindi
```

Use realistic mock geospatial zones, flood-prone areas, traffic points, and resource locations around Islamabad/Rawalpindi.

---

## 3. Challenge Requirement Mapping

| Challenge Requirement | CrisesMesh AI Implementation |
|---|---|
| Mandatory mobile app | React Native + Expo mobile app |
| Multi-signal fusion | 7 urban flooding signals |
| Crisis classification | Urban flooding classification with confidence and severity |
| Location and affected area | Mapbox map with Red Zone circle/polygon |
| Severity prediction | Severity level, affected population, duration, peak impact estimate |
| Resource allocation | AI suggests rescue teams, ambulances, police units, water pumps, field officers |
| Multi-crisis coordination | Sidebar shows multiple crisis types; Urban Flooding fully functional first |
| Impact simulation | Reroute simulation, ETA before/after, resource cost, congestion side effect |
| Stakeholder notification | Public alert, rescue team notice, hospital readiness, traffic police, utility provider |
| False positive/recovery | Flood reclassified as water-main burst after field verification |
| Robustness/degraded mode | Mock fallback if API fails; stale/missing signals flagged |
| Antigravity usage | Used during development for multi-agent planning, coding, testing, artifact generation, and trace evidence |

---

## 4. Correct Antigravity Interpretation

Google Antigravity is used as a development-time agentic orchestration environment.

It is not embedded inside the deployed mobile app as a production runtime.

### Antigravity will be used for:

```text
Planning
Code generation
Multi-agent development tasks
Testing
Debugging
Documentation
Trace/evidence creation
Workflow simulation during development
```

### Runtime app intelligence will be handled by:

```text
FastAPI Backend
→ Google ADK Agents
→ Gemini
→ Supabase PostgreSQL
→ React Native / Web UI
```

### Submission evidence must show:

```text
Antigravity prompts
Agent traces
Screenshots
Generated artifacts
Test logs
Demo recordings
Development decision logs
```

---

## 5. Tech Stack

### Mobile App

```text
React Native
Expo
TypeScript
NativeWind
Zustand
Axios or TanStack Query
Mapbox React Native SDK
Expo AV / audio for siren and voice warning
Expo Image Picker for camera/gallery
Expo Location for GPS
Expo Audio or speech/transcription integration for voice note
```

### Backend

```text
FastAPI
Python
Google ADK
Gemini API
Pydantic
SQLAlchemy or Supabase client
PostgreSQL/PostGIS via Supabase
```

### Database

```text
Supabase PostgreSQL
PostGIS enabled
```

### Maps

```text
Mapbox
```

### Weather

```text
Open-Meteo API
```

### Traffic

```text
Mock congestion index
Mapbox route ETA as traffic proxy
```

### Deployment

```text
Mobile app: Expo build / APK demo
Backend: Google Cloud Run
Database: Supabase
Optional web dashboard: Vercel
```

---

## 6. User Roles

### Citizen

Citizen users can:

```text
Enter name and phone number through mock form
Report flooding-related issue
Submit text in English or Roman Urdu
Attach photo from camera/gallery
Record voice note and transcribe it
Use auto GPS and correct location with map pin
Track report status
Receive in-app alerts
Hear siren and voice warning near Red Zone
View simulated SMS/WhatsApp alert preview
```

### Government User

Government users enter through:

```text
Government Command Center
Demo PIN: 1122
```

Government module roles:

```text
Command Officer
Field Officer
Resource Manager
```

Government users can:

```text
View active incidents
View detailed agent traces
Verify signals
Approve or reject AI-suggested alerts
Approve resource allocation
View Red Zone and reroute simulation
Notify rescue, hospital, traffic police, and utility teams
Handle flood-to-water-main-burst reclassification
Retract/correct public alerts
```

---

## 7. Mobile App Screens

## 7.1 Landing Screen

Purpose: choose app mode.

Buttons:

```text
Continue as Citizen
Government Command Center
```

Design:

```text
Clean Pakistan-focused branding
CrisesMesh AI logo/name
Short mission statement
Emergency-safe visual language
```

---

## 7.2 Citizen Onboarding Screen

Fields:

```text
Name
Phone number
Continue button
```

No real authentication for MVP.

---

## 7.3 Citizen Home Screen

Main sections:

```text
Report Urban Flooding
Nearby Alerts
My Reports
Safety Map
Emergency Contacts
```

---

## 7.4 Citizen Flood Report Screen

Inputs:

```text
Category:
- Urban Flooding
- Water Logging
- Drain Overflow

Description:
- English
- Roman Urdu

Photo:
- Camera
- Gallery

Voice Note:
- Record
- Transcribe to text

Location:
- Auto GPS
- Manual map pin correction
```

Submit behavior:

```text
Create report
Store report in Supabase
Send report to backend signal fusion endpoint
Update status to Submitted / Under Review
```

---

## 7.5 Citizen Report Status Screen

Statuses:

```text
Submitted
Under Review
Verified
Rejected
Resolved
```

Citizen reports are signals only. They do not directly become official incidents.

---

## 7.6 Citizen Alerts Screen

Shows:

```text
Active alert title
Severity
Location
Safety instructions
English + Roman Urdu alert text
Simulated SMS/WhatsApp preview
```

If user is near Red Zone:

```text
Play siren
Play text-to-speech warning
Show Red Zone warning card
```

---

## 7.7 Citizen Map Screen

Mapbox map showing:

```text
User location
Incident point
Red Zone circle/polygon
Safe/unsafe zones
Nearby alerts
```

---

## 7.8 Government PIN Screen

Fields:

```text
PIN input
```

Correct PIN:

```text
1122
```

After PIN:

```text
Role selection or direct Government Command Center access
```

---

## 7.9 Government Command Center Home

Dark command-center design.

Sections:

```text
Crisis sidebar
Active incident map
Incident priority cards
Agent trace panel
Resource panel
Simulation panel
Alert approval panel
```

---

## 7.10 Crisis Sidebar

Items:

```text
Urban Flooding — Active/Functional
Traffic Blockage — Future
Heat Emergency — Future
Power Outage — Future
Disease Cluster — Future
Public Disorder — Future
Infrastructure Failure — Future
```

Clicking future modules shows:

```text
This module is planned for future expansion.
Current MVP demonstrates full workflow for Urban Flooding.
```

---

## 7.11 Urban Flooding Incident Screen

Shows:

```text
Incident type
Location
Severity
Confidence
Priority score
Affected radius
Estimated affected population
Expected duration
Peak impact estimate
Signal summary
Contradictions
Recommended response
```

Confidence format:

```text
86% — High Confidence
```

Severity levels:

```text
Low
Medium
High
Critical
```

Priority score formula:

```text
Priority = severity weight + confidence weight + population impact weight + urgency weight
```

Example:

```text
Priority: 89/100 — High
Severity: Critical
Confidence: 86% — High Confidence
Affected Population: 12,000
```

---

## 7.12 Agent Trace Panel

Visible only to government users.

Agents shown:

```text
Signal Fusion Agent
Classification Agent
Severity Agent
Resource Allocation Agent
Simulation Agent
Notification Agent
Recovery Agent
```

Each trace should show:

```text
Timestamp
Agent name
Input summary
Reasoning summary
Output
Confidence
Status
```

Do not expose private chain-of-thought. Show safe reasoning summaries only.

---

## 7.13 Field Officer Verification Screen

Field officer actions:

```text
View assigned incident
Navigate to incident area
Upload proof photo
Submit location confirmation
Confirm flooding
Reject flooding
Update classification to water-main burst
Add field notes
```

---

## 7.14 Resource Allocation Screen

Resources:

```text
Rescue teams
Ambulances
Police units
Water pumps
Field officers
```

Resource statuses:

```text
Available
Assigned
En Route
Unavailable
```

Flow:

```text
AI suggests resources
Government reviews
Government approves allocation
System updates resource status
Simulation runs
```

---

## 7.15 Reroute Simulation Screen

Shows on Mapbox:

```text
Original unsafe route
Red Zone/flooded road
Safer reroute
Before ETA
After ETA
Response time saved
Resource cost
Congestion side effect
```

Example:

```text
Before ETA: 18 min
After reroute: 11 min
Improvement: 7 min faster
Resource cost: 1 police unit + 1 rescue team
Side effect: Moderate congestion expected on alternate route
```

---

## 7.16 Public Alert Approval Screen

Flow:

```text
AI drafts alert
Government reviews
Government approves
Alert becomes visible to citizen module
Simulated SMS/WhatsApp preview generated
```

Alert languages:

```text
English
Roman Urdu
```

Example:

```text
English: Avoid G-10 underpass. Urban flooding risk detected.
Roman Urdu: G-10 underpass se parhez karein. Pani bharne ka khatra detect hua hai.
```

---

## 7.17 Recovery / Reclassification Screen

False/conflict scenario:

```text
Initial classification: Urban Flooding
Conflicting field report: Possible water-main burst
Field officer verifies: Water-main burst, not city-wide flooding
System updates classification
Flood alert corrected/retracted
Utility provider notified
Resource allocation downgraded
Audit log preserved
```

---

## 8. Seven Signal Sources

Urban Flooding MVP uses 7 signals:

```text
1. Citizen report
2. Weather/rainfall
3. Traffic congestion
4. Field officer report
5. Mock water-level sensor
6. Emergency call frequency
7. Historical flood-prone area map
```

### Real Data

```text
Mapbox map/location/routing
Open-Meteo rainfall/weather
```

### Mock Data

```text
Citizen report stream
Traffic congestion index
Field officer report
Water-level sensor
Emergency call frequency
Historical flood-prone polygons
```

---

## 9. Agent Architecture

Runtime agents run in backend using Google ADK + Gemini.

```text
Mobile App
→ FastAPI Backend
→ Agent Workflow Orchestrator
→ Specialized Agents
→ Supabase/PostGIS
→ Mobile/Web UI
```

### 9.1 Signal Fusion Agent

Inputs:

```text
Citizen reports
Weather data
Traffic data
Sensor data
Field reports
Emergency call frequency
Historical flood zone data
```

Outputs:

```text
Merged incident candidate
Signal agreement score
Contradiction level
Source credibility summary
Geo-confidence
```

---

### 9.2 Classification Agent

Classifies incident as:

```text
Urban Flooding
Water Logging
Drain Overflow
Water-main Burst
False/Duplicate
```

Outputs:

```text
incident_type
confidence
classification_reason_summary
alternative_hypotheses
```

---

### 9.3 Severity Agent

Computes:

```text
Severity level
Affected radius
Estimated population affected
Expected duration
Peak impact time
Spread risk
Uncertainty range
```

Severity levels:

```text
Low
Medium
High
Critical
```

---

### 9.4 Resource Allocation Agent

Inputs:

```text
Incident priority
Resource availability
Travel time
Affected population
Severity
Confidence
```

Outputs:

```text
Recommended rescue teams
Recommended ambulances
Recommended police units
Recommended water pumps
Recommended field officers
Justification summary
Trade-off summary
```

AI suggests, government approves.

---

### 9.5 Simulation Agent

Simulates:

```text
Traffic rerouting
Emergency dispatch
Hospital readiness
Utility escalation
Public alert impact
```

Outputs:

```text
Before state
Action
Expected after state
ETA improvement
Resource cost
Side effects
Confidence
```

---

### 9.6 Notification Agent

Generates tailored messages for:

```text
Public
Rescue team
Hospital
Traffic police
Water/sewerage utility
Government command center
```

Languages:

```text
English
Roman Urdu
```

Government approval required before public alert is shown.

---

### 9.7 Recovery Agent

Handles:

```text
False alarm
Water-main burst reclassification
Conflicting signals
Duplicate reports
Missing location
Stale data
API fallback
Alert correction/retraction
```

---

## 10. Backend API Design

Base URL:

```text
/api/v1
```

### Citizen APIs

```text
POST /citizen/reports
GET /citizen/reports/{report_id}
GET /citizen/alerts
GET /citizen/alerts/nearby?lat=&lng=
```

### Government APIs

```text
POST /government/login-pin
GET /government/incidents
GET /government/incidents/{incident_id}
POST /government/incidents/{incident_id}/verify
POST /government/incidents/{incident_id}/allocate-resources
POST /government/incidents/{incident_id}/simulate-reroute
POST /government/incidents/{incident_id}/approve-alert
POST /government/incidents/{incident_id}/reclassify
POST /government/incidents/{incident_id}/retract-alert
```

### Agent APIs

```text
POST /agents/fuse-signals
POST /agents/classify
POST /agents/score-severity
POST /agents/allocate-resources
POST /agents/simulate
POST /agents/generate-notifications
POST /agents/recover
GET /agents/traces/{incident_id}
```

### Mock Stream APIs

```text
POST /demo/start-flood-scenario
POST /demo/generate-signal
GET /demo/signals
POST /demo/reset
```

---

## 11. Data Models

## 11.1 Citizen Report

```json
{
  "id": "report_001",
  "citizen_name": "Ali Khan",
  "phone": "03000000000",
  "category": "Urban Flooding",
  "description": "G-10 underpass mein pani bhar gaya hai",
  "transcribed_voice_text": "Pani bohat zyada hai aur traffic ruk gaya hai",
  "photo_url": "https://...",
  "lat": 33.6844,
  "lng": 73.0479,
  "status": "Under Review",
  "created_at": "2026-05-15T10:30:00+05:00"
}
```

## 11.2 Signal

```json
{
  "id": "sig_001",
  "source": "citizen_report",
  "incident_candidate_id": "candidate_001",
  "text": "G-10 underpass flooded",
  "lat": 33.6844,
  "lng": 73.0479,
  "credibility_score": 0.78,
  "geo_confidence": 0.91,
  "urgency_score": 0.84,
  "timestamp": "2026-05-15T10:30:00+05:00"
}
```

## 11.3 Incident

```json
{
  "id": "inc_001",
  "type": "Urban Flooding",
  "status": "Active",
  "severity": "High",
  "confidence": 0.86,
  "priority_score": 89,
  "lat": 33.6844,
  "lng": 73.0479,
  "affected_radius_m": 900,
  "estimated_population": 12000,
  "expected_duration_hours": 4,
  "peak_impact_time": "2026-05-15T12:00:00+05:00",
  "red_zone_geojson": {},
  "created_at": "2026-05-15T10:35:00+05:00"
}
```

## 11.4 Resource

```json
{
  "id": "res_001",
  "type": "Rescue Team",
  "name": "Rescue Team A",
  "status": "Available",
  "lat": 33.7000,
  "lng": 73.0500,
  "capacity": 5,
  "eta_minutes": 12
}
```

## 11.5 Resource Allocation

```json
{
  "id": "alloc_001",
  "incident_id": "inc_001",
  "resources": [
    { "resource_id": "res_001", "type": "Rescue Team", "status": "Assigned" },
    { "resource_id": "res_002", "type": "Police Unit", "status": "Assigned" }
  ],
  "ai_reason_summary": "High severity flooding with traffic blockage near underpass requires rescue and traffic control.",
  "approved_by_government": true
}
```

## 11.6 Agent Trace

```json
{
  "id": "trace_001",
  "incident_id": "inc_001",
  "agent_name": "Signal Fusion Agent",
  "input_summary": "7 signals received around G-10 underpass",
  "reasoning_summary": "Rainfall, traffic delay, water-level sensor, and citizen reports agree. Field report indicates possible utility issue.",
  "output": {
    "signal_agreement": 0.82,
    "contradiction_level": 0.27
  },
  "confidence": 0.86,
  "created_at": "2026-05-15T10:36:00+05:00"
}
```

## 11.7 Alert

```json
{
  "id": "alert_001",
  "incident_id": "inc_001",
  "status": "Approved",
  "severity": "High",
  "english_text": "Avoid G-10 underpass. Urban flooding risk detected.",
  "roman_urdu_text": "G-10 underpass se parhez karein. Pani bharne ka khatra detect hua hai.",
  "channels": ["in_app", "simulated_sms", "simulated_whatsapp"],
  "approved_by": "Government Command Center"
}
```

---

## 12. Red Zone Logic

Decision:

```text
Circle for MVP + polygon when enough signals exist
```

Rules:

```text
1 report = small circle
3+ nearby reports = larger circle
5+ signals + traffic/weather/sensor = polygon Red Zone
```

Mapbox should display:

```text
Red zone fill
Red zone border
Incident marker
Signal markers
Resource markers
Unsafe route
Safe reroute
```

---

## 13. Reroute Simulation Logic

Inputs:

```text
Incident location
Resource location
Red Zone geometry
Mapbox ETA
Mock congestion index
```

Outputs:

```text
Unsafe/original route
Safe alternate route
Before ETA
After ETA
Time saved
Resource cost
Congestion side effect
```

Example:

```text
Before ETA: 18 minutes
After reroute: 11 minutes
Time saved: 7 minutes
Resource cost: 1 police unit + 1 rescue team
Side effect: Moderate congestion expected on alternate route
```

---

## 14. Alert and Voice Warning Logic

### In-app Alert

Shown after government approval.

### Siren + TTS Warning

If citizen is near Red Zone:

```text
Play siren
Play English warning
Play Roman Urdu warning
```

Example:

```text
Warning: Red Zone ahead. Avoid this route.
Warning: Red Zone qareeb hai. Is raaste se parhez karein.
```

### Simulated SMS/WhatsApp

Show preview card only. Do not send real SMS/WhatsApp in MVP.

---

## 15. Demo Scenario

Use controlled real-time mock data with a **Start Flood Scenario** button.

### Scenario Flow

```text
1. Citizen reports flooding near G-10/G-11 or Rawalpindi low-lying road.
2. Open-Meteo shows rainfall.
3. Mock traffic congestion increases.
4. Mock water-level sensor crosses threshold.
5. Emergency call frequency increases.
6. Historical flood-prone map confirms vulnerability.
7. Field officer report introduces conflict: possible water-main burst.
8. Signal Fusion Agent merges signals.
9. Classification Agent classifies as probable Urban Flooding.
10. Severity Agent marks severity High/Critical.
11. Government Command Center receives incident.
12. Resource Allocation Agent suggests rescue team, police unit, water pump, field officer.
13. Simulation Agent shows reroute and ETA improvement.
14. Notification Agent drafts public alert in English + Roman Urdu.
15. Government approves alert.
16. Citizen app receives alert with siren/voice warning.
17. Field officer verifies water-main burst.
18. Recovery Agent reclassifies incident.
19. Flood alert corrected/retracted.
20. Water/sewerage utility notified.
```

---

## 16. Optional Web Dashboard

Small web dashboard only for demo support.

Stack:

```text
Next.js
Tailwind CSS
Vercel
```

Dashboard shows:

```text
Live incidents
Agent logs
Resource allocation
Simulation result
Antigravity evidence section/link
```

Mobile app remains the mandatory primary deliverable.

---

## 17. Antigravity Evidence Folder

Create:

```text
antigravity-evidence/
├── traces/
├── screenshots/
├── prompts/
├── generated-artifacts/
├── test-logs/
└── demo-recordings/
```

### What to save

```text
Every major Antigravity prompt
Agent plan outputs
Code generation summaries
Screenshots of Agent Manager
Screenshots of completed tasks
Test logs
Bug-fix traces
Fallback/recovery implementation traces
Demo scenario recordings
Final generated artifacts
```

### Naming convention

```text
YYYY-MM-DD_task-name_agent-name.ext
```

Examples:

```text
2026-05-15_mobile-ui_mobile-agent.png
2026-05-15_signal-fusion_backend-agent.md
2026-05-15_reroute-simulation_test-log.txt
```

---

## 18. 5-Day Build Strategy

### Day 1 — Mobile UI Skeleton

Goals:

```text
Create Expo app
Set up TypeScript
Set up NativeWind
Create landing screen
Create Citizen module skeleton
Create Government Command Center skeleton
Create Mapbox screen placeholder
Create crisis sidebar
Create mock navigation flow
```

Deliverable:

```text
Clickable mobile UI prototype
```

---

### Day 2 — Vertical Slice Connection

Goals:

```text
Set up FastAPI backend
Set up Supabase tables
Connect mobile app to backend
Submit citizen flood report
Store report in database
Show report in Government module
Create basic incident from report
```

Deliverable:

```text
Citizen report → backend → database → government view working
```

---

### Day 3 — AI Agents + 7 Signal Fusion

Goals:

```text
Set up Google ADK/Gemini integration
Create Signal Fusion Agent
Create Classification Agent
Create Severity Agent
Create mock signal generator
Add Open-Meteo weather signal
Generate confidence/severity/priority score
Store agent traces
Show traces in Government module
```

Deliverable:

```text
Agent-based incident analysis working
```

---

### Day 4 — Command Tools + Simulation + Recovery

Goals:

```text
Create Resource Allocation Agent
Create Simulation Agent
Create Notification Agent
Create Recovery Agent
Add resource approval flow
Add reroute simulation on Mapbox
Add public alert approval
Add siren + TTS warning
Add water-main burst reclassification
Add alert correction/retraction
```

Deliverable:

```text
Full Urban Flooding workflow working end-to-end
```

---

### Day 5 — Polish + Demo + Submission

Goals:

```text
Improve UI polish
Fix bugs
Prepare demo scenario
Record 3–5 minute video
Write README
Write architecture notes
Finalize Antigravity evidence folder
Deploy backend to Cloud Run
Deploy web dashboard to Vercel if ready
Prepare final submission package
```

Deliverable:

```text
Final hackathon submission-ready prototype
```

---

## 19. MVP Boundaries

### Real

```text
Mobile app UI
Mapbox map
Citizen report creation
Backend API
Supabase database
Agent workflow endpoint
Agent trace storage
Open-Meteo weather call
Government approval flows
Alert display
Siren/voice warning
```

### Mocked

```text
Traffic congestion
Water-level sensors
Emergency call frequency
Historical flood polygons
Field officer external dispatch
Rescue/hospital/utility actual notifications
SMS/WhatsApp sending
```

### Optional

```text
Full web dashboard
Real push notifications
Real authentication
Full multi-crisis functionality
Live government integrations
```

---

## 20. Development Instructions for Antigravity

Every Antigravity task should begin with:

```text
Read IMPLEMENTATION_PLAN.md first. Follow the decisions exactly. Do not change architecture unless explicitly asked.
```

Recommended task pattern:

```text
Task title:
Context:
Relevant section from IMPLEMENTATION_PLAN.md:
Expected files to modify:
Acceptance criteria:
Save evidence to antigravity-evidence/:
```

Example prompt:

```text
Read IMPLEMENTATION_PLAN.md. Build only the Citizen Flood Report screen in React Native + Expo + TypeScript. Use the fields defined in section 7.4. Do not implement backend yet. Save a screenshot and summary in antigravity-evidence/screenshots and antigravity-evidence/generated-artifacts.
```

---

## 21. Success Criteria

The MVP is successful if the demo can show:

```text
Citizen submits flood report
System fuses 7 signals
AI classifies Urban Flooding
Government sees confidence, severity, and priority
Red Zone appears on Mapbox
AI suggests resources
Government approves resources
Reroute simulation shows ETA improvement
AI drafts public alert
Government approves alert
Citizen receives in-app alert with siren/voice warning
Field officer verifies water-main burst
System reclassifies incident
Alert is corrected/retracted
Utility team notification is simulated
Agent traces are visible
Antigravity evidence folder proves development orchestration
```

---

## 22. Final Build Principle

Do not overbuild.

Build one excellent, complete, judge-visible Urban Flooding workflow.

The app should feel scalable, but only one module must be fully functional in the MVP.

Priority order:

```text
1. Working flow
2. Clear agent intelligence
3. Strong Mapbox visualization
4. Government approval/control
5. Recovery/retraction scenario
6. Clean demo and documentation
```

---

## 23. Final Decision Summary

```text
Product: CrisesMesh AI
App Type: Dual-interface mobile app
Primary Module: Urban Flooding
Demo City: Islamabad/Rawalpindi
Mobile Stack: React Native + Expo + TypeScript
Map: Mapbox
Backend: FastAPI + Python
Runtime Agents: Google ADK + Gemini
Database: Supabase PostgreSQL + PostGIS
Weather: Open-Meteo
Deployment: Cloud Run backend, Vercel optional dashboard
Auth: Mock citizen form + government PIN 1122
Alert Control: AI suggests, government approves
Agent Traces: Government-only
Antigravity: Development orchestration + evidence
Build Timeline: 5 days
```

