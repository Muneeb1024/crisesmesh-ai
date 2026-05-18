# CrisesMesh AI — README Structure

This file defines the final README structure for the hackathon submission. The README should be judge-focused, clear, technical, and aligned with the challenge requirements.

---

# 1. Project Title

```text
CrisesMesh AI — Multi-Crisis Management Command Center for Pakistan
```

Include a short one-line description:

```text
A dual-interface mobile crisis management system that helps citizens report urban flooding and helps government responders verify signals, allocate resources, simulate actions, and coordinate alerts using AI agents.
```

---

# 2. Problem Statement

Explain the Pakistan-specific urban crisis problem:

- fragmented crisis signals
- delayed verification
- limited emergency resources
- flooding, water logging, traffic disruption, infrastructure issues
- need for coordinated response

Mention that the MVP focuses on **Urban Flooding** in **Islamabad/Rawalpindi**.

---

# 3. Solution Overview

Describe CrisesMesh AI as:

```text
A dual-interface mobile app with a Citizen Module and Government Command Center.
```

Citizen side:

- report flooding
- submit text, photo, voice note, and location
- receive alerts
- hear siren/voice warning near Red Zone

Government side:

- view and verify incidents
- see AI agent traces
- approve resource allocation
- simulate rerouting
- approve public alerts
- handle reclassification/retraction

---

# 4. Key Features

## 4.1 Citizen Module

- name + phone mock onboarding
- urban flooding report
- English + Roman Urdu text
- photo upload
- voice note transcription
- GPS + manual map pin correction
- report status tracking
- in-app alerts
- simulated SMS/WhatsApp preview
- siren + voice warning

## 4.2 Government Command Center

- demo PIN: `1122`
- crisis sidebar
- Urban Flooding workflow
- detailed agent trace panel
- severity/confidence/priority score
- Red Zone map
- resource allocation approval
- reroute simulation
- public alert approval
- field officer verification
- water-main burst reclassification
- alert correction/retraction

## 4.3 Scalable Multi-Crisis Shell

Sidebar modules:

```text
Urban Flooding — Functional
Traffic Blockage — Future
Heat Emergency — Future
Power Outage — Future
Disease Cluster — Future
Public Disorder — Future
Infrastructure Failure — Future
```

Explain that Urban Flooding is fully functional and other modules demonstrate future scalability.

---

# 5. Challenge Requirement Mapping

Include a table:

| Requirement | Implementation |
|---|---|
| Mobile app mandatory | React Native + Expo mobile app |
| 3+ signal sources | 7 signal sources for Urban Flooding |
| Crisis detection | AI classification, severity, confidence |
| Resource allocation | AI-suggested, government-approved resources |
| Action simulation | Mapbox reroute, ETA before/after, side effects |
| Stakeholder communication | Public, rescue, hospital, traffic police, utility messages |
| False positive handling | Flood reclassified as water-main burst |
| Antigravity traces | Development artifacts stored in `antigravity-evidence/` |

---

# 6. System Architecture

Add architecture diagram in text or image.

Text version:

```text
React Native Mobile App
        ↓
FastAPI Backend
        ↓
Google ADK Agent Workflow
        ↓
Gemini Reasoning + Scoring
        ↓
Supabase PostgreSQL/PostGIS
        ↓
Mapbox + Open-Meteo + Mock Streams
```

Explain:

- mobile app is frontend
- agents run in backend
- Antigravity is used for development orchestration and evidence
- Supabase stores reports, incidents, resources, alerts, and traces

---

# 7. Antigravity Usage

Explain clearly:

```text
Google Antigravity was used during development to orchestrate multiple development agents for planning, coding, testing, debugging, documentation, and workflow validation.
```

Mention evidence folder:

```text
antigravity-evidence/
├── traces/
├── screenshots/
├── prompts/
├── generated-artifacts/
├── test-logs/
└── demo-recordings/
```

Include examples of evidence:

- mobile UI generation trace
- backend API generation trace
- signal fusion workflow trace
- resource allocation trace
- recovery/retraction trace
- test logs
- screenshots

Important wording:

```text
Antigravity is used as a development-time orchestration environment. Runtime app decisions are handled by FastAPI + Google ADK agents + Gemini.
```

---

# 8. Runtime Agent Workflow

List runtime backend agents:

```text
Signal Fusion Agent
Classification Agent
Severity Agent
Resource Allocation Agent
Simulation Agent
Notification Agent
Recovery Agent
```

For each agent, briefly describe:

- input
- responsibility
- output

Example:

```text
Signal Fusion Agent combines citizen reports, weather, traffic, sensors, field reports, emergency call frequency, and historical flood polygons into one incident candidate.
```

---

# 9. Data Sources

## Real Sources

```text
Mapbox — maps, red zones, routing/ETA
Open-Meteo — rainfall/weather data
```

## Mock Sources

```text
Citizen report stream
Traffic congestion index
Water-level sensors
Emergency call frequency
Field officer reports
Historical flood-prone area polygons
```

Explain why mock streams are used:

```text
The challenge allows mock streams, and government/sensor/emergency-call data is not publicly available in real time.
```

---

# 10. Urban Flooding Demo Scenario

Describe the story-based demo:

```text
1. Citizen reports flooding near Islamabad/Rawalpindi.
2. Weather shows rainfall.
3. Mock traffic congestion increases.
4. Mock water-level sensor crosses threshold.
5. Emergency call frequency increases.
6. Historical flood-prone map confirms vulnerability.
7. AI fuses signals and classifies Urban Flooding.
8. Government sees severity, confidence, and priority score.
9. AI suggests resources.
10. Government approves allocation.
11. Reroute simulation shows before/after ETA.
12. AI drafts public alert.
13. Government approves alert.
14. Citizen receives alert with siren/voice warning.
15. Field officer verifies water-main burst.
16. System reclassifies incident and retracts/corrects flood alert.
17. Utility provider notification is simulated.
```

---

# 11. Tech Stack

Table:

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo + TypeScript |
| Styling | NativeWind |
| Map | Mapbox |
| Backend | FastAPI + Python |
| Runtime Agents | Google ADK + Gemini |
| Database | Supabase PostgreSQL + PostGIS |
| Weather | Open-Meteo |
| Dashboard | Next.js + Vercel |
| Backend Deployment | Google Cloud Run |
| Auth | Mock login + PIN |

---

# 12. Database Overview

Mention main tables:

```text
citizen_reports
signals
incidents
resources
resource_allocations
agent_traces
alerts
simulation_results
```

Include a short data model explanation, not full SQL unless needed.

---

# 13. API Overview

List important endpoints:

```text
POST /api/v1/citizen/reports
GET /api/v1/citizen/alerts
GET /api/v1/government/incidents
POST /api/v1/government/incidents/{id}/verify
POST /api/v1/government/incidents/{id}/allocate-resources
POST /api/v1/government/incidents/{id}/simulate-reroute
POST /api/v1/government/incidents/{id}/approve-alert
POST /api/v1/government/incidents/{id}/reclassify
GET /api/v1/agents/traces/{incident_id}
POST /api/v1/demo/start-flood-scenario
```

---

# 14. Installation & Setup

Sections:

## 14.1 Prerequisites

```text
Node.js
Expo CLI
Python 3.11+
Supabase project
Mapbox token
Gemini API key
Open-Meteo access
```

## 14.2 Mobile App Setup

```bash
cd mobile
npm install
npx expo start
```

## 14.3 Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 14.4 Environment Variables

```text
MAPBOX_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GEMINI_API_KEY=
OPEN_METEO_BASE_URL=
```

---

# 15. Demo Credentials

```text
Government PIN: 1122
Citizen: any name + phone number
```

---

# 16. How to Run Demo

Steps:

```text
1. Open mobile app.
2. Continue as Citizen.
3. Submit urban flooding report.
4. Open Government Command Center with PIN 1122.
5. Click Start Flood Scenario.
6. Review signal fusion and agent traces.
7. Approve resources.
8. Run reroute simulation.
9. Approve public alert.
10. Switch to Citizen module and view alert.
11. Trigger field verification conflict.
12. Reclassify as water-main burst and retract alert.
```

---

# 17. Screenshots / Demo Media

Include screenshots:

- Landing screen
- Citizen report screen
- Mapbox Red Zone
- Government Command Center
- Agent trace panel
- Resource allocation
- Reroute simulation
- Alert approval
- Recovery/retraction flow

Include demo video link.

---

# 18. Safety, Privacy, and Governance

Mention:

- citizen reports are treated as unverified signals
- government approval required before public alerts
- no real SMS/WhatsApp sending in MVP
- no real emergency dispatch in MVP
- mock personal information only
- agent traces show safe summaries, not private chain-of-thought
- system designed as decision support, not autonomous authority

---

# 19. Cost & Latency Analysis

Discuss:

- lightweight FastAPI backend
- Open-Meteo free weather data
- mock streams reduce external costs
- Gemini calls limited to incident analysis and message generation
- Supabase free/low-cost tier possible
- Mapbox usage depends on map/routing requests

Mention approximate latency targets:

```text
Citizen report submission: < 2 seconds
Signal fusion + classification: 3–8 seconds
Alert generation: 2–5 seconds
Map/reroute rendering: depends on Mapbox response
```

---

# 20. Scalability Discussion

Explain future scalability:

- add real traffic APIs
- integrate government emergency systems
- add real sensors
- expand from Urban Flooding to other crisis modules
- add push notifications
- add role-based auth
- add city-level dashboards
- add offline/SMS fallback
- add more languages including Urdu script
- add province/city-specific vulnerability maps

---

# 21. Limitations

Be honest:

- only Urban Flooding is fully functional
- other crisis modules are future placeholders
- several data sources are mocked
- no real emergency dispatch
- no real SMS/WhatsApp sending
- no production auth
- agent outputs require government approval
- historical flood polygons are realistic mock data

---

# 22. Future Roadmap

Suggested roadmap:

```text
Phase 1: Urban Flooding MVP
Phase 2: Traffic Blockage + Power Outage modules
Phase 3: Heat Emergency + Disease Cluster modules
Phase 4: Real integrations with city authorities
Phase 5: Offline/SMS/WhatsApp bot mode
Phase 6: Multi-city Pakistan deployment
```

---

# 23. Repository Structure

Example:

```text
CrisesMesh-ai/
├── mobile/
├── backend/
├── dashboard/
├── docs/
├── antigravity-evidence/
│   ├── traces/
│   ├── screenshots/
│   ├── prompts/
│   ├── generated-artifacts/
│   ├── test-logs/
│   └── demo-recordings/
├── IMPLEMENTATION_PLAN.md
├── README_STRUCTURE.md
└── README.md
```

---

# 24. Final Judge Pitch

End README with a concise pitch:

```text
CrisesMesh AI demonstrates how Pakistani cities can move from fragmented, reactive crisis response to AI-assisted, verified, and coordinated emergency management. The MVP proves this through a complete Urban Flooding workflow with citizen reporting, multi-signal fusion, government verification, resource allocation, reroute simulation, public alert approval, and false-alarm recovery.
```

