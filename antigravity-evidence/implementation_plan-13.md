# Implementation Plan — AI Orchestrator Sandbox Control Panel (Version 13)

## Goal Description
We will build a brand-new **Interactive AI Orchestrator Sandbox Control Panel** widget directly inside the Government Command Center dashboard (`GovernmentHomeScreen.tsx`). This allows the operator (and judges) to manually alter AI threshold metrics, toggle individual cognitive agents in the vetting pipeline, and trigger chaos simulation events (like a WASA pump outage) to witness how the Multi-Agent system dynamically adapts.

## User Review Required
> [!IMPORTANT]
> The sandbox controls will be placed right above the **Rapid Actions** block on the dashboard. They will be styled with premium neon elements matching the JARVIS theme. Please review the proposed changes below. Once approved, I will implement this screen addition.

## Proposed Changes

### [MODIFY] [GovernmentHomeScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/GovernmentHomeScreen.tsx)

We will update the main Command Center dashboard screen:
1. **Interactive State Additions**:
   - `confidenceThreshold` (state integer, default `75%`) with `-` and `+` adjustments.
   - `vettingAgents` (state object toggling `Vetting Agent`, `Credibility Agent`, `Resource Allocator`, and `Translation Agent`).
   - `activeChaos` (state string indicating any active simulated emergency event, e.g. `'pump_outage'`, `'highway_block'`, or `'grid_failure'`).

2. **Dashboard UI Insertions**:
   - Add the **⚙️ AI ORCHESTRATOR SANDBOX** block with glowing cyan borders.
   - **Vetting Threshold Controller**: Displays `[ 75% ]` with neon buttons to decrease or increase the dispatch trigger threshold.
   - **Agent Pipeline Toggles**: Grid of buttons that light up green/cyan when active, or dim red when bypassed.
   - **Chaos Simulator Triggers**:
     - ⚠️ **WASA Pump Outage**: Appends warning logs to the terminal coordination feed and flags a critical pump repair SOP task.
     - 💥 **Srinagar Hwy Block**: Simulates a major detour event, changing routing advice lines in the log.
     - ⚡ **Power Grid Failure**: Simulates power grid snap, changing layout accents to emergency pulsing.

3. **Behavioral Wiring**:
   - Toggling agents or altering thresholds will print custom real-time cognitive trace entries to the **AI Coordination Feed** so the UI responds immediately to the user's clicks!

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type-safety and ensure compilation success.

### Manual Verification
- Deploy to browser or simulator, navigate to the Government Command Center.
- Interact with the Vetting Threshold buttons, toggle pipeline agents, and trigger the chaos simulation scenarios.
- Verify that terminal feed logs update instantly and display relevant warnings/routing instructions.
