# CrisesMesh AI — Antigravity Task Sequence

This file contains copy-paste-ready prompts for Google Antigravity. Use it after creating `IMPLEMENTATION_PLAN.md` and `README_STRUCTURE.md`.

Core rule for every task:

```text
Read IMPLEMENTATION_PLAN.md first. Follow it exactly. Do not change architecture, stack, product scope, or naming unless explicitly instructed.
```

Evidence rule for every task:

```text
Save development evidence in antigravity-evidence/ using the correct subfolder:
- traces/
- screenshots/
- prompts/
- generated-artifacts/
- test-logs/
- demo-recordings/
```

---

# Day 1 — Mobile App UI Skeleton

## Task 1.1 — Initialize Mobile App

```text
Read IMPLEMENTATION_PLAN.md first. Create the React Native + Expo + TypeScript mobile app for CrisesMesh AI. Set up the initial project structure, navigation, NativeWind styling, and placeholder screens. Do not implement backend integration yet.

Required screens:
- Landing Screen
- Citizen Onboarding Screen
- Citizen Home Screen
- Citizen Flood Report Screen
- Citizen Alerts Screen
- Citizen Map Screen
- Government PIN Screen
- Government Command Center Home
- Urban Flooding Incident Screen

Acceptance criteria:
- Expo app runs successfully
- Navigation works between Citizen and Government flows
- App name and branding show CrisesMesh AI
- Citizen side uses clean/light style
- Government side uses dark command-center style
- No backend dependency yet

Save evidence:
- Screenshot of app running
- Summary of generated files
- Any setup logs
```

---

## Task 1.2 — Build Landing + Role Flow

```text
Read IMPLEMENTATION_PLAN.md first. Build the CrisesMesh AI landing screen with two clear buttons:
1. Continue as Citizen
2. Government Command Center

Citizen button should navigate to Citizen Onboarding.
Government button should navigate to Government PIN screen.

Design requirements:
- Clean, modern, Pakistan-focused public safety feel
- Clear emergency/crisis management branding
- Mobile-first layout

Acceptance criteria:
- Both buttons work
- Citizen and Government flows are visually distinct
- Screen is polished enough for demo

Save evidence:
- Screenshot of landing screen
- Screenshot of both navigation paths
```

---

## Task 1.3 — Build Citizen Onboarding + Home

```text
Read IMPLEMENTATION_PLAN.md first. Build Citizen Onboarding and Citizen Home screens.

Citizen Onboarding fields:
- Name
- Phone number
- Continue button

Citizen Home sections:
- Report Urban Flooding
- Nearby Alerts
- My Reports
- Safety Map
- Emergency Contacts

No real authentication. Store citizen name/phone in local state only for now.

Acceptance criteria:
- Citizen can enter name and phone
- Continue navigates to Citizen Home
- Citizen Home shows all required sections
- Report Urban Flooding opens the report screen

Save evidence:
- Screenshots
- Generated component summary
```

---

## Task 1.4 — Build Citizen Flood Report UI

```text
Read IMPLEMENTATION_PLAN.md first. Build the Citizen Flood Report screen UI.

Required inputs:
- Category selector: Urban Flooding, Water Logging, Drain Overflow
- Description input supporting English/Roman Urdu
- Photo upload placeholders: Camera and Gallery
- Voice note record placeholder
- Location section: Auto GPS placeholder + manual map pin correction placeholder
- Submit Report button

Do not implement backend submission yet. Use local mock submit behavior.

Acceptance criteria:
- All fields are visible
- Form validation exists for required category, description/location
- Submit shows local success state
- Report status becomes Submitted locally

Save evidence:
- Screenshot of empty form
- Screenshot of filled form
- Screenshot of local submitted state
```

---

## Task 1.5 — Build Government Command Center UI Shell

```text
Read IMPLEMENTATION_PLAN.md first. Build the Government PIN screen and Government Command Center shell.

PIN:
- Correct demo PIN: 1122

Command Center must include:
- Crisis sidebar
- Urban Flooding functional item
- Future modules locked/placeholder:
  - Traffic Blockage
  - Heat Emergency
  - Power Outage
  - Disease Cluster
  - Public Disorder
  - Infrastructure Failure
- Active incident map placeholder
- Incident card placeholder
- Agent trace panel placeholder
- Resource panel placeholder
- Simulation panel placeholder
- Alert approval panel placeholder

Acceptance criteria:
- Wrong PIN shows error
- PIN 1122 opens Government Command Center
- Sidebar displays all crisis types
- Future modules show “planned for future expansion” message
- Urban Flooding screen opens correctly

Save evidence:
- PIN screen screenshot
- Command Center screenshot
- Sidebar screenshot
```

---

# Day 2 — Backend + Vertical Slice Connection

## Task 2.1 — Initialize FastAPI Backend

```text
Read IMPLEMENTATION_PLAN.md first. Create the FastAPI backend for CrisesMesh AI.

Required setup:
- FastAPI app structure
- /api/v1 base routing
- CORS enabled for mobile/web clients
- health check endpoint
- environment variable loading
- clean folder structure for routes, services, agents, models, schemas

Initial endpoints:
- GET /health
- POST /api/v1/citizen/reports
- GET /api/v1/government/incidents
- POST /api/v1/demo/reset

Acceptance criteria:
- Backend runs locally with uvicorn
- Health endpoint returns OK
- Citizen report endpoint accepts mock payload
- Government incidents endpoint returns created incident/report data

Save evidence:
- Backend run log
- API test screenshots/logs
- Generated file summary
```

---

## Task 2.2 — Create Supabase Schema

```text
Read IMPLEMENTATION_PLAN.md first. Create the Supabase PostgreSQL schema for the MVP.

Required tables:
- citizen_reports
- signals
- incidents
- resources
- resource_allocations
- agent_traces
- alerts
- simulation_results

Use fields from IMPLEMENTATION_PLAN.md section 11.

Include seed data for resources:
- Rescue teams
- Ambulances
- Police units
- Water pumps
- Field officers

Acceptance criteria:
- SQL migration file exists
- Tables match MVP data model
- Resource seed data exists
- PostGIS-compatible fields are prepared for location/geometry

Save evidence:
- SQL file
- Schema screenshot/log
- Seed data summary
```

---

## Task 2.3 — Connect Mobile Report to Backend

```text
Read IMPLEMENTATION_PLAN.md first. Connect the Citizen Flood Report screen to the FastAPI backend.

Flow:
- Citizen fills report
- App sends POST /api/v1/citizen/reports
- Backend stores report
- Backend creates initial signal
- Backend returns report ID and status Submitted/Under Review
- Mobile app shows success and report status

Acceptance criteria:
- Report submission works from mobile app
- Backend receives payload
- Data is stored or mocked consistently
- Citizen sees report status

Save evidence:
- Mobile screenshot after submission
- Backend API log
- Database/saved data screenshot if available
```

---

## Task 2.4 — Show Citizen Report in Government Module

```text
Read IMPLEMENTATION_PLAN.md first. Connect Government Command Center to backend incidents/reports.

Flow:
- Citizen submits flood report
- Government module fetches active incidents/reports
- Urban Flooding screen displays the report as an incident candidate

Required display:
- Report category
- Description
- Location
- Status
- Time submitted
- Source: Citizen Report

Acceptance criteria:
- Government screen updates after report submission
- Incident candidate is visible
- No AI analysis required yet

Save evidence:
- Citizen report screenshot
- Government incident view screenshot
- API response log
```

---

# Day 3 — AI Agents + 7 Signal Fusion

## Task 3.1 — Add Google ADK + Gemini Runtime Agent Skeleton

```text
Read IMPLEMENTATION_PLAN.md first. Add runtime backend agent structure using Google ADK + Gemini.

Create agent modules:
- Signal Fusion Agent
- Classification Agent
- Severity Agent
- Resource Allocation Agent
- Simulation Agent
- Notification Agent
- Recovery Agent

For this task, only implement skeletons and safe placeholder outputs. Do not fully implement all logic yet.

Acceptance criteria:
- Agent modules exist
- Backend can call a basic agent workflow
- Agent trace records can be generated
- No private chain-of-thought is stored; only safe reasoning summaries

Save evidence:
- Agent file summary
- Test log calling basic workflow
- Trace output sample
```

---

## Task 3.2 — Build Mock Signal Generator

```text
Read IMPLEMENTATION_PLAN.md first. Build controlled mock signal generator for Urban Flooding.

Signals required:
1. Citizen report
2. Weather/rainfall
3. Traffic congestion
4. Field officer report
5. Mock water-level sensor
6. Emergency call frequency
7. Historical flood-prone area map

Add endpoint:
POST /api/v1/demo/start-flood-scenario

Behavior:
- Generate a controlled real-time mock flood scenario near Islamabad/Rawalpindi
- Create realistic signal records
- Keep scenario reliable for judge demo

Acceptance criteria:
- Start Flood Scenario creates 7 signals
- Signals are associated with one incident candidate
- Signals have timestamps, confidence, source, lat/lng, and summaries

Save evidence:
- API test log
- Generated signal JSON
- Backend console screenshot/log
```

---

## Task 3.3 — Implement Signal Fusion Agent

```text
Read IMPLEMENTATION_PLAN.md first. Implement Signal Fusion Agent for Urban Flooding.

Inputs:
- 7 signals from demo scenario or citizen report flow

Outputs:
- signal agreement score
- contradiction level
- source credibility summary
- geo-confidence
- merged incident candidate

Store trace in agent_traces.

Acceptance criteria:
- Agent produces stable JSON output
- Output includes confidence-related scores
- Government UI can display signal fusion result
- Trace is stored and visible

Save evidence:
- Signal fusion trace
- API response
- Government UI screenshot
```

---

## Task 3.4 — Implement Classification + Severity Agents

```text
Read IMPLEMENTATION_PLAN.md first. Implement Classification Agent and Severity Agent.

Classification outputs:
- incident_type
- confidence
- alternative hypotheses
- reasoning summary

Severity outputs:
- severity: Low / Medium / High / Critical
- affected radius
- estimated affected population
- expected duration
- peak impact time
- uncertainty range
- priority score

Acceptance criteria:
- Incident is classified as Urban Flooding for normal scenario
- Confidence format supports percentage + label
- Severity and priority are shown in Government UI
- Traces are stored for both agents

Save evidence:
- Classification trace
- Severity trace
- Government incident screenshot
```

---

## Task 3.5 — Add Agent Trace Panel UI

```text
Read IMPLEMENTATION_PLAN.md first. Build detailed Agent Trace Panel in Government module.

Visible only to Government users.

Show traces for:
- Signal Fusion Agent
- Classification Agent
- Severity Agent
- Resource Allocation Agent
- Simulation Agent
- Notification Agent
- Recovery Agent

Each trace card shows:
- timestamp
- agent name
- input summary
- reasoning summary
- output summary
- confidence
- status

Acceptance criteria:
- Traces load from backend
- Trace panel is readable on mobile
- No private chain-of-thought is shown
- Empty states are handled

Save evidence:
- Agent trace panel screenshot
- Backend trace API log
```

---

# Day 4 — Command Tools + Simulation + Recovery

## Task 4.1 — Implement Resource Allocation Agent

```text
Read IMPLEMENTATION_PLAN.md first. Implement Resource Allocation Agent.

Resources:
- Rescue teams
- Ambulances
- Police units
- Water pumps
- Field officers

Flow:
- AI suggests allocation
- Government reviews
- Government approves
- Resource statuses update

Resource statuses:
- Available
- Assigned
- En Route
- Unavailable

Acceptance criteria:
- AI recommendation generated
- Recommendation includes reason summary and trade-off summary
- Government can approve allocation
- Resource statuses update
- Trace is stored

Save evidence:
- Resource recommendation JSON
- Government resource panel screenshot
- Agent trace screenshot
```

---

## Task 4.2 — Implement Mapbox Red Zone

```text
Read IMPLEMENTATION_PLAN.md first. Implement Mapbox Red Zone visualization.

Red Zone logic:
- 1 report = small circle
- 3+ nearby reports = larger circle
- 5+ signals + traffic/weather/sensor = polygon Red Zone

Map must show:
- incident marker
- signal markers
- affected Red Zone
- resource markers if available

Acceptance criteria:
- Real interactive Mapbox map appears
- Red Zone circle/polygon appears for flood scenario
- Incident location is visible
- Map works in Citizen and Government views where needed

Save evidence:
- Map screenshot with Red Zone
- Implementation summary
```

---

## Task 4.3 — Implement Reroute Simulation

```text
Read IMPLEMENTATION_PLAN.md first. Implement reroute simulation for Urban Flooding.

Show:
- original unsafe route
- safer alternate route
- before ETA
- after ETA
- response time saved
- resource cost
- congestion side effect

Use Mapbox route ETA where possible and mock congestion impact if needed.

Acceptance criteria:
- Government can run reroute simulation
- Map shows unsafe and safer route
- ETA before/after is displayed
- Simulation trace is stored

Save evidence:
- Reroute map screenshot
- Simulation JSON output
- Agent trace screenshot
```

---

## Task 4.4 — Implement Notification + Alert Approval

```text
Read IMPLEMENTATION_PLAN.md first. Implement Notification Agent and public alert approval flow.

Notification Agent generates:
- Public alert
- Rescue team message
- Hospital readiness message
- Traffic police message
- Water/sewerage utility message
- Command center summary

Public alert languages:
- English
- Roman Urdu

Flow:
- AI drafts alert
- Government reviews
- Government approves
- Citizen module receives alert
- Simulated SMS/WhatsApp preview appears

Acceptance criteria:
- Alert draft generated
- Government can approve alert
- Citizen receives in-app alert
- Simulated SMS/WhatsApp preview appears
- Trace is stored

Save evidence:
- Alert approval screenshot
- Citizen alert screenshot
- Notification trace
```

---

## Task 4.5 — Add Siren + Voice Warning

```text
Read IMPLEMENTATION_PLAN.md first. Add siren and text-to-speech warning for Citizen alerts.

Behavior:
- If active approved alert exists near citizen location, show Red Zone warning
- Play siren sound
- Play or display English warning
- Play or display Roman Urdu warning

Warning text:
English: Warning: Red Zone ahead. Avoid this route.
Roman Urdu: Warning: Red Zone qareeb hai. Is raaste se parhez karein.

Acceptance criteria:
- Alert screen triggers siren/warning in demo mode
- User can stop/dismiss warning
- Works without real push notifications

Save evidence:
- Alert warning screenshot
- Short screen recording if possible
```

---

## Task 4.6 — Implement Recovery / Water-Main Burst Reclassification

```text
Read IMPLEMENTATION_PLAN.md first. Implement Recovery Agent and water-main burst reclassification flow.

Scenario:
- Initial classification: Urban Flooding
- Field officer submits conflicting report: possible water-main burst
- Recovery Agent re-evaluates
- Incident classification changes to Water-main Burst
- Public flood alert is corrected/retracted
- Utility provider notification is generated
- Resource allocation is downgraded or adjusted
- Audit/agent trace is preserved

Acceptance criteria:
- Government can trigger field verification conflict
- Incident reclassifies correctly
- Alert status changes to retracted/corrected
- Utility message is shown
- Recovery trace is visible

Save evidence:
- Before/after incident screenshots
- Recovery trace
- Alert retraction screenshot
```

---

# Day 5 — Polish + Submission

## Task 5.1 — UI Polish Pass

```text
Read IMPLEMENTATION_PLAN.md first. Polish the mobile app UI for demo readiness.

Focus:
- Landing screen
- Citizen report flow
- Citizen alert flow
- Government Command Center
- Agent trace panel
- Red Zone map
- Resource allocation
- Reroute simulation
- Recovery/retraction screen

Do not add new features unless they directly improve demo reliability.

Acceptance criteria:
- UI is consistent
- No broken navigation
- Empty/loading/error states exist
- Text is clear and judge-friendly
- Demo path is obvious

Save evidence:
- Final screenshots of all main screens
```

---

## Task 5.2 — Create Final README.md

```text
Read README_STRUCTURE.md and IMPLEMENTATION_PLAN.md first. Create the final README.md for CrisesMesh AI.

README must include:
- project title
- problem statement
- solution overview
- key features
- challenge requirement mapping
- architecture
- Antigravity usage
- runtime agent workflow
- data sources
- demo scenario
- tech stack
- setup instructions
- demo credentials
- safety/privacy note
- cost/latency analysis
- scalability
- limitations
- roadmap

Acceptance criteria:
- README is judge-focused
- Antigravity interpretation is clear
- Mock vs real data is honest
- Urban Flooding MVP scope is clear

Save evidence:
- README generation trace
- README screenshot or file summary
```

---

## Task 5.3 — Prepare Demo Video Script

```text
Read IMPLEMENTATION_PLAN.md and README_STRUCTURE.md first. Create a 3–5 minute demo video script.

Style:
- Story-based crisis scenario
- English narration with Roman Urdu examples

Must show:
- Citizen reports flooding
- 7 signals fuse
- Government sees agent traces
- Severity/confidence/priority score
- Red Zone map
- Resource allocation approval
- Reroute simulation
- Alert approval
- Citizen siren/voice warning
- Water-main burst reclassification
- Alert correction/retraction
- Antigravity evidence folder

Acceptance criteria:
- Script fits 3–5 minutes
- Clear scene-by-scene structure
- Includes exact UI actions to record

Save evidence:
- Script in docs/demo-video-script.md
```

---

## Task 5.4 — Create Final Submission Checklist

```text
Read IMPLEMENTATION_PLAN.md first. Create FINAL_SUBMISSION_CHECKLIST.md.

Checklist must include:
- mobile app build ready
- backend deployed or locally demoable
- Supabase configured
- Mapbox token configured
- demo scenario works
- README complete
- demo video recorded
- Antigravity evidence folder complete
- screenshots included
- limitations stated
- mock data disclosed

Acceptance criteria:
- Checklist is clear
- Every challenge deliverable is mapped to a file/demo item

Save evidence:
- Checklist file
```

---

# Emergency Backup Tasks

Use these if time is short.

## Backup A — If Google ADK Setup Is Slow

```text
Read IMPLEMENTATION_PLAN.md first. Implement custom Python agent services with Gemini API instead of full Google ADK wiring, but keep the same agent names, outputs, and trace format. Preserve the architecture so Google ADK can be added later.

Acceptance criteria:
- Agent outputs work
- Traces are stored
- README clearly says runtime agent workflow uses Gemini-backed Python services if ADK integration is incomplete
```

---

## Backup B — If Mapbox Routing Is Slow

```text
Read IMPLEMENTATION_PLAN.md first. Implement visual reroute simulation using predefined mock route GeoJSON lines. Keep Mapbox map, Red Zone, original route, safer route, and ETA before/after values.

Acceptance criteria:
- Judges can see reroute simulation visually
- README states routing is simulated for MVP
```

---

## Backup C — If Supabase Integration Is Slow

```text
Read IMPLEMENTATION_PLAN.md first. Use local JSON/in-memory storage temporarily while preserving API response shapes and data models. Keep Supabase schema files ready for final integration.

Acceptance criteria:
- Demo works end-to-end
- Data model remains compatible with Supabase
```

---

# Final Instruction for Antigravity

When working on this project, always optimize for:

```text
1. Working demo path
2. Urban Flooding end-to-end flow
3. Clear agent traces
4. Mapbox Red Zone and reroute visualization
5. Government approval and recovery logic
6. Clean README and evidence folder
```

Do not overbuild future crisis modules. They should remain visible as scalable placeholders only.

