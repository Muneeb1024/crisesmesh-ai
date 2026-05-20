# Implementation Plan: Premium Landing Screen Enhancements & Live Telemetry

We will upgrade the first screen of the application ([LandingScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/LandingScreen.tsx)) to deliver a premium, high-tech "World No. 1" first impression. The screen will transition from static placeholders to dynamic live telemetry, responsive tactile physics, and a futuristic holographic UI.

## User Review Required
> [!IMPORTANT]
> - **Live Telemetry Connection**: The landing screen will poll the backend every 10 seconds to sync connection status, compute active signal nodes, and display the real-time Pakistani threat index. If the backend is offline, it will gracefully fall back to a styled offline state with cached figures.
> - **Holographic Sweeping Laser**: A green neon scanner line will sweep vertically across the national shield to represent active threat monitoring.
> - **Micro-Interaction Physics**: Cards will scale dynamically (using spring physics) on press/tap.

## Proposed Changes

### Mobile App Frontend

---

#### [MODIFY] [LandingScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/LandingScreen.tsx)
* **Real-time Telemetry State**:
  * Implement active polling using `setInterval` (10s intervals) calling `checkHealth()`, `listIncidents()`, and `listReports()` from the [API service](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/services/api.ts).
  * State variables:
    * `isOnline`: boolean (shows `ONLINE` in green or `OFFLINE` in pulsing red).
    * `activeNodesCount`: number (sum of active reports and incidents).
    * `threatIndex`: string (calculated dynamically: `LOW`, `MODERATE`, `ELEVATED`, or `CRITICAL` based on max severity).
* **Tactile Spring Physics**:
  * Add `Animated.Value` instances for `citizenCardScale` and `govCardScale`.
  * Trigger spring scale reduction down to `0.97` on press-in and spring back to `1.0` on press-out to give a realistic mechanical feel.
* **Sweeping Holographic Laser**:
  * Add a vertical neon green sweeping laser overlaying the shield badge.
  * Drive it using a looping `Animated.timing` chain (`0` to `140` height offset).
* **Custom Tactical Shield**:
  * Replace the simple flag emoji `🇵🇰` with a dual-ringed high-tech tactical crescent-and-star emblem with inner glowing neon drops.

---

## Verification Plan

### Automated Verification
- Verify the mobile compilation succeeds without warnings or TypeScript errors.

### Manual Verification
1. Launch the backend server (on port 8000) and verify that the landing screen telemetry shows `ONLINE`, 0 active nodes initially, and a `LOW` threat index.
2. In the Citizen Portal, submit a mock emergency report.
3. Return to the Landing Screen and verify that "Active Signals" immediately increments (reflecting the live backend database).
4. Run the demo flood scenario in the Government Portal (pin `1122`) to spawn critical incidents.
5. Return to the Landing Screen and verify that "Threat Index" updates dynamically to `CRITICAL` in a red warning text.
6. Terminate the backend server, and verify that the Landing Screen status seamlessly transitions to `OFFLINE` (pulsing red) while maintaining safety.
7. Tap the portal selection cards to verify the spring scaling animations work on both web and mobile modes.
