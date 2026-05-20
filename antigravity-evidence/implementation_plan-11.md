# Implementation Plan — Visualizing the Fusion Engine (Version 11)

## Goal Description
Visually prove to the Hackathon judges that our system is successfully fusing 8 distinct data streams and using multiple autonomous AI agents to make decisions. We will update the JARVIS Command Center frontend to display the raw signals on the map, show multi-agent conversations in the terminal, and build a dedicated deep-dive "Agent Reasoning" screen to explain the AI's logic (e.g., handling false positives).

## User Review Required
> [!IMPORTANT]
> Please review the visualization strategy below. Once you approve, we will begin coding these updates into the frontend to make the AI's "brain" visible to the judges.

## Proposed Changes

### [MODIFY] [mobile/src/screens/GovernmentHomeScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/GovernmentHomeScreen.tsx)

**1. 8-Signal Ingestion Matrix (System Status)**
- We will replace the generic "System Status" progress bars in the bottom right corner with a dense, futuristic **8-Signal Ingestion Matrix**. 
- It will list all 8 signals (Citizen App, Weather, IoT Sensors, Traffic, 1122 Calls, ER Beds, Social Media, Drone Feed) with a glowing, pulsing green dot next to each to indicate live data flow.

**2. Multi-Agent Terminal Logs**
- We will update the `activityLogs` mock data to explicitly show the different AI agents talking to each other.
- Format: `[AGENT-NAME] Action/Decision`. 
- Example: `[SIGNAL-AGENT] Detected 12 anomaly spikes in G-10` followed by `[COMMANDER-AGENT] Fusing with Traffic API. Declaring verified Crisis.`

**3. GIS Radar Signal Plotting**
- We will update `buildMiniMapHTML` to plot not just confirmed incidents, but also "Raw Signals" across the map.
- We will add distinct emojis/icons for the signals (e.g., 🐦 for Social, 🌡️ for IoT, 🚗 for Traffic bottlenecks).

---

### [NEW] [mobile/src/screens/AgentTracePanelScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/AgentTracePanelScreen.tsx)

**4. The Agent Reasoning Deep Dive**
- We will create a completely new, dedicated screen that acts as an "X-Ray" into the AI's brain. 
- **Purpose**: To satisfy the challenge requirement of showing *how* the system handles misinformation, false positives, and predictions.
- **Design**: A matrix-style timeline showing the exact JSON logic the AI used (e.g., "Discarded tweet as rumor because Weather API confirmed 0mm rainfall").
- This screen will be accessible via the "View All Agent Reasoning Traces ›" button on the Command Center.

---

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to ensure the new screen and updated data interfaces are type-safe.

### Manual Verification
- Render the Command Center in the Expo preview.
- Ensure all 8 signals appear in the ingestion matrix.
- Navigate to the new `AgentTracePanelScreen` and verify the JARVIS aesthetic carries over seamlessly.
