# Challenge Overview

Modern cities face increasingly complex and overlapping crises such as urban flooding, heatwaves, road blockages, accidents, infrastructure failures, public disorder, disease spikes, power outages, and emergency disruptions. Signals related to these incidents may emerge across social media, traffic systems, weather alerts, citizen complaints, emergency calls, sensors, and field reports, but most existing response systems remain fragmented, delayed, and reactive.

This challenge focuses on building an intelligent autonomous crisis coordination system capable of continuously monitoring multiple signal streams, detecting emerging crises, predicting impact, coordinating response actions, optimizing limited resources, and managing multiple simultaneous incidents in real time.

The objective is not only to detect crises, but to build a system capable of reasoning, prioritizing, coordinating, simulating actions, and adapting under uncertainty.

---

# Problem Statement

## Core Objective

Build an autonomous multi-agent crisis coordination system that can:

* Continuously monitor and fuse multiple real-world or simulated signals
* Detect and classify emerging crises
* Predict severity, spread, and impact
* Coordinate response actions across stakeholders
* Optimize limited emergency resources
* Simulate response outcomes and side effects
* Handle misinformation, uncertainty, and conflicting signals
* Operate reliably during degraded or incomplete conditions

The focus of this challenge is on what the system can intelligently achieve, not on which specific framework or SDK is used.

Teams may use any suitable orchestration or agent-development framework, including custom implementations.

Examples may include:

* Multi-agent orchestration systems
* Custom AI workflows
* Agent-based reasoning pipelines
* Distributed decision systems
* AI coordination architectures

Frameworks such as:

* Google ADK
* OpenAI Agent SDK
* Custom orchestrators
* Hybrid architectures

may be used if desired, but no specific framework is mandatory.

---

# System Requirements

## Multi-Signal Fusion

Use at least three sources such as:

* Social media / citizen posts
* Weather systems
* Maps / traffic feeds
* Emergency call frequency
* Mock sensors
* Public transport data
* Historical vulnerability maps
* Field reports

The system should intelligently combine signals and identify meaningful crisis patterns.

---

# Crisis Detection & Classification

The system should detect and classify incidents such as:

* Flood
* Heatwave
* Accident
* Infrastructure failure
* Power outage
* Protest
* Disease cluster
* Public safety incident

For every detected crisis, estimate:

* Crisis type
* Location
* Severity
* Confidence score
* Affected population
* Expected duration
* Spread risk
* Likely evolution

---

# Source Credibility & Misinformation Handling

The system should evaluate:

* Source credibility
* Geolocation confidence
* Urgency language
* Mention velocity
* Contradiction level
* Signal reliability

Low-confidence or suspicious signals should be flagged for verification.

---

# Multi-Agent Coordination

The system must demonstrate autonomous coordination between multiple intelligent agents or modules responsible for tasks such as:

* Signal analysis
* Crisis classification
* Severity prediction
* Resource optimization
* Stakeholder communication
* Action simulation
* Verification and escalation
* Recovery and correction handling

The architecture should clearly demonstrate coordinated decision-making and orchestration across the system.

---

# Severity & Evolution Prediction

Estimate:

* Affected radius
* Population impact
* Duration
* Peak impact time
* Spread risk
* Congestion effects
* Uncertainty range

The system should reason about how crises may evolve over time.

---

# Resource Allocation Optimization

Model constrained resources such as:

* Ambulances
* Police units
* Rescue teams
* Shelters
* Generators
* Water tankers
* Field teams
* Drones
* Medical outreach teams

Resources should be allocated based on:

* Severity
* Urgency
* Travel time
* Availability
* Population impact
* Predicted outcomes

---

# Multi-Crisis Coordination

The system must handle at least two simultaneous incidents and demonstrate:

* Priority ranking
* Resource trade-offs
* Conflict resolution
* Dynamic reallocation decisions

---

# Impact Simulation

For every major action, simulate:

* Before state
* Response action
* Expected after state
* Response-time improvement
* Congestion impact
* Resource cost
* Potential unintended consequences

---

# Stakeholder Notification

Generate tailored notifications for:

* Public
* Emergency services
* Hospitals
* Utility companies
* Transport authorities
* Command center operators
* Media coordination teams

---

# False Positive / Negative Handling

The system should demonstrate handling of:

* False alarms
* Conflicting signals
* Early low-confidence reports
* Missing information
* Incorrect classifications

Show:

* Verification logic
* Escalation process
* Correction handling
* Alert retraction
* Recovery workflow

---

# Robustness & Degraded Mode

The system should remain functional during:

* API downtime
* Missing data
* Delayed signals
* Duplicate incidents
* Rate limits
* Incomplete geolocation
* Sensor failures

The architecture should support:

* Fallback sources
* Cached reasoning
* Manual escalation
* Graceful degradation

---

# Example Scenario

## Input Signals

* Social posts report flooding in G-10
* Weather system reports heavy rainfall
* Traffic systems show congestion spikes
* A field report suggests a broken water main instead of flooding
* A heat emergency is reported in a nearby low-income neighborhood

---

## Detection

The system:

* Detects probable urban flooding
* Assigns confidence scores
* Identifies conflicting hypotheses
* Detects simultaneous heat-risk escalation

---

## Prediction

The system estimates:

* Affected zones
* Congestion spread
* Vulnerable population risk
* Likely duration
* Escalation probability

---

## Resource Allocation

The system prioritizes:

* Rescue teams
* Police traffic units
* Medical outreach
* Emergency routing

Based on:

* Severity
* Resource constraints
* Predicted impact

---

## Simulation

The system may:

* Reroute traffic
* Dispatch emergency units
* Notify hospitals
* Generate public alerts
* Update command dashboards
* Predict response impact

---

## Recovery

If verification confirms only a water-main burst:

* The classification is updated
* Incorrect alerts are retracted
* Relevant utility providers are notified
* System logs and reasoning history are updated

---

# Recommended Stress-Test Scenarios

1. Two or more crises occur within 30 minutes and compete for limited emergency resources.

2. Social media indicates flooding but official sensor data is unavailable or contradictory.

3. An external API fails mid-response and the system must rely on cached or alternate data.

4. Public alerts trigger evacuation congestion requiring rerouting or staged notifications.

5. A false alarm requires correction, retraction, and recovery handling.

---

# Deliverables

* Working prototype with:

  * Mandatory mobile app
  * Optional web dashboard

* Demo video (3–5 minutes) showing:

  * Multi-source input
  * Crisis detection
  * Severity prediction
  * Resource allocation
  * Multi-agent coordination
  * Simulated response
  * Impact visualization
  * Recovery handling

* Architecture and orchestration traces/logs showing:

  * Signal fusion
  * Classification logic
  * Confidence scoring
  * Resource trade-offs
  * Stakeholder communication
  * Action execution
  * Recovery workflows
  * Fallback behavior

* README including:

  * System architecture
  * Data flow
  * Agent coordination design
  * APIs/tools used
  * Assumptions
  * Privacy/safety considerations
  * Cost/latency analysis
  * Scalability discussion
  * Limitations

---

# Evaluation Criteria

| Criteria                                            | Weight |
| --------------------------------------------------- | ------ |
| Multi-agent coordination & orchestration            | 20%    |
| Crisis detection and severity analysis              | 25%    |
| Resource optimization and multi-crisis coordination | 20%    |
| Impact simulation and stakeholder coordination      | 15%    |
| Robustness, scalability, cost and latency           | 10%    |
| Innovation and UX                                   | 10%    |
