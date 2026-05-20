# Challenge Overview

Cities frequently face localized crises such as urban flooding, heatwaves, road blockages, accidents, infrastructure failures, public disorder, disease spikes, and power outages. Signals may exist across social media, traffic maps, weather alerts, citizen complaints, emergency calls, sensors, and field reports, but response systems are often fragmented and reactive.

This challenge requires an agentic system that fuses signals, detects emerging crises, predicts severity, allocates resources, coordinates stakeholders, simulates response actions, and recovers from false alarms or missed detections.

---

# Problem Statement

## Core Requirements

- Ingest and fuse at least three signal sources, such as:
  - Social posts
  - Weather
  - Traffic
  - Emergency calls
  - Mock sensors
  - Field reports
  - Historical data

- Detect and classify:
  - Crisis type
  - Location
  - Severity
  - Confidence
  - Affected population
  - Expected duration
  - Likely evolution

- Prioritize and allocate constrained response resources across one or more simultaneous crises.

- Simulate coordinated actions such as:
  - Traffic rerouting
  - Emergency dispatch
  - Hospital preparation
  - Utility escalation
  - Public alerts

- Predict:
  - Outcomes
  - Side effects
  - Unintended consequences for each response action

- Handle:
  - False positives
  - False negatives
  - Conflicting signals
  - Verification and escalation logic

---

# Mandatory Requirement: Google Antigravity

Use Google Antigravity to orchestrate:

- Multi-agent crisis detection
- Signal fusion
- Severity analysis
- Resource allocation
- Stakeholder communication
- Action simulation

Show Antigravity traces for:

- Signal interpretation
- Confidence scoring
- Priority ranking
- Resource trade-offs
- Action execution
- Recovery from false or conflicting signals

External APIs and mock streams are allowed, but Antigravity must coordinate planning and execution.

---

# Enhanced System Requirements

## Multi-Signal Fusion

Use at least three sources:

- Social media / citizen posts
- Weather
- Maps / traffic
- Emergency call frequency
- Mock sensors
- Public transport
- Historical vulnerability maps

## Source Credibility & Misinformation Handling

Score:

- Source credibility
- Geolocation confidence
- Urgency language
- Mention velocity
- Contradiction level

Flag low-confidence or suspicious signals.

## Crisis Classification

Classify incidents such as:

- Flood
- Heatwave
- Accident
- Infrastructure failure
- Power outage
- Protest
- Disease cluster

Include:

- Severity level
- Confidence score

## Severity & Evolution Prediction

Estimate:

- Affected radius
- Population impact
- Duration
- Peak impact time
- Spread risk
- Uncertainty range

## Resource Allocation Optimization

Model constrained resources such as:

- Ambulances
- Police units
- Rescue teams
- Shelters
- Generators
- Water tankers
- Field teams
- Drones

Allocate resources based on:

- Impact
- Urgency
- Travel time
- Resource availability

## Multi-Crisis Coordination

Handle at least two simultaneous incidents and show:

- Prioritization trade-offs
- Resource assignment decisions

## Impact Simulation

For each action, show:

- Before state
- Response action
- Expected after state
- Response time improvement
- Congestion impact
- Resource cost
- Possible side effects

## Stakeholder Notification

Generate tailored messages for:

- Public
- Emergency services
- Hospitals
- Utility companies
- Transport authority
- Media / command center

## False Positive / Negative Handling

Simulate:

- False alarms
- Early low-confidence signals
- Conflicting signals

Show:

- Verification
- Escalation
- Correction
- Alert retraction

## Robustness & Degraded Mode

Handle:

- API downtime
- Stale data
- Missing location
- Duplicate incidents
- Rate limits

Use:

- Fallback sources
- Manual escalation

---

# Example Scenario

## Input Signals

- Social posts report flooding in G-10
- Weather API shows heavy rainfall
- Traffic API shows congestion spike
- One field report suggests a broken water main instead of flooding
- A heat emergency is reported in a nearby low-income neighborhood

## Detection

- Classifies G-10 incident as probable urban flooding
- Assigns confidence score
- Identifies conflicting water-main hypothesis

## Prediction

Estimates:

- Affected zones
- Likely duration
- Congestion spread
- Vulnerable population risk

## Resource Allocation

Prioritizes:

- Rescue teams
- Police traffic units for G-10
- Medical outreach for heat emergency

Based on:

- Severity
- Resource constraints

## Simulation

System actions:

- Reroutes traffic
- Creates emergency ticket
- Sends public alert
- Notifies hospital
- Updates incident dashboard
- Simulates response impact

## Recovery

If field verification confirms only a water-main burst:

- System updates classification
- Retracts flood alert
- Notifies utility provider

---

# Recommended Stress-Test Scenarios

1. Two or more crises occur within 30 minutes and compete for limited emergency resources.
2. Social media indicates flooding but official sensor data is unavailable or contradictory.
3. An API fails mid-response and the system must use cached or alternate data.
4. Public alert causes evacuation congestion, requiring staged alerting or rerouting.
5. False alarm requires correction, apology/retraction, and log update.

---

# Deliverables

- Working prototype with:
  - Mandatory mobile app
  - Optional web app/dashboard

- Demo video (3–5 minutes) showing:
  - Multi-source input
  - Crisis detection
  - Severity prediction
  - Resource allocation
  - Simulated response
  - Impact visualization
  - Recovery scenario

- Antigravity agent trace/logs showing:
  - Signal fusion
  - Confidence scoring
  - Crisis classification
  - Allocation trade-offs
  - Stakeholder messages
  - Action execution
  - Fallback behavior

- README including:
  - Architecture
  - Data stream schemas
  - Antigravity usage
  - APIs/tools
  - Assumptions
  - Privacy/safety note
  - Cost/latency analysis
  - Baseline comparison
  - Scalability discussion
  - Limitations

---

# Evaluation Criteria

| Criteria | Weight |
|---|---|
| Antigravity integration | 20% |
| Crisis detection and severity analysis | 25% |
| Resource optimization and multi-crisis coordination | 20% |
| Impact simulation and stakeholder coordination | 15% |
| Robustness, scalability, cost and latency | 10% |
| Innovation and UX | 10% |