# Implementation Plan — 8-Signal Fusion Dashboard (Version 12)

## Goal Description
The user requested a dedicated box/screen to showcase the 8-Signal Fusion engine in full detail. We will build a brand-new, standalone `SignalFusionScreen` that expands on the JARVIS UI. This screen will act as a massive control board displaying the live (and simulated) telemetry of all 8 data streams simultaneously, proving to the judges that the backend is processing complex multi-modal data.

## User Review Required
> [!IMPORTANT]
> Please review the architecture and design of this new screen below. Once you approve, I will create the screen, link it to the Command Center, and run tests.

## Proposed Changes

### [NEW] [mobile/src/screens/SignalFusionScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/SignalFusionScreen.tsx)
We will create a completely new full-screen dashboard specifically dedicated to the 8 signals.
- **Design Aesthetic**: True black JARVIS UI with glowing neon cyan borders and monospace fonts.
- **Content layout**: An 8-panel grid. Each panel represents one signal stream.
    1. **Citizen App Feed**: Scrolling text of mock citizen reports.
    2. **Weather API**: Live mocked temperature/rain gauges.
    3. **Social Firehose**: Simulated chaotic Twitter feed parsing hashtags.
    4. **IoT City Sensors**: A water-level bar chart.
    5. **Traffic Routing API**: Congestion percentage dials.
    6. **1122 Emergency Calls**: A line-chart representation of call volume spikes.
    7. **Hospital ER Beds**: A capacity matrix (e.g., PIMS: 8 beds left).
    8. **Drone CCTV**: Text-based computer vision outputs ("Drone-04: clear").

### [MODIFY] [mobile/src/constants/types.ts](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/constants/types.ts)
- Add `SignalFusion: undefined;` to the `RootStackParamList` to ensure perfect TypeScript typing for navigation.

### [MODIFY] [mobile/src/navigation/RootNavigator.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/navigation/RootNavigator.tsx)
- Import `SignalFusionScreen` and register it in the main Stack Navigator so the app can route to it.

### [MODIFY] [mobile/src/screens/GovernmentHomeScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/GovernmentHomeScreen.tsx)
- We will add a glowing "🔍 OPEN MASTER FUSION DASHBOARD" button just below the 8-Signal Ingestion Matrix in the bottom right corner. Pressing this button will navigate to the new screen.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to ensure the new screen and navigation types do not break the strict TypeScript build.

### Manual Verification
- Open the Command Center, click the new "Open Master Fusion Dashboard" button.
- Verify the 8-panel JARVIS dashboard loads correctly and animations run smoothly.
