# Implementation Plan — JARVIS-Inspired Government Command Center (Version 9)

## Goal Description
Transform the `GovernmentHomeScreen.tsx` into a state-of-the-art, visually stunning Command Center inspired by Tony Stark's JARVIS. We will apply "First Principles" of modern premium UI design—replacing flat elements with dynamic glassmorphism, animated data visualizations, holographic cyan/gold neon glows, and a futuristic typography stack to wow the user at first glance.

## User Review Required
> [!IMPORTANT]
> Please review the JARVIS-specific aesthetic upgrades proposed below. If you approve this Iron Man holographic theme, I will begin execution immediately!

## Proposed Changes

### [MODIFY] [mobile/src/screens/GovernmentHomeScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/GovernmentHomeScreen.tsx)

**1. JARVIS Holographic Color Palette & Glassmorphism**
- **Background**: Replace the flat background with a deep space radial gradient, fading from true black (`#000000`) at the edges to a very dark midnight blue (`#020617`) in the center.
- **Holographic Panels**: Upgrade all flat metric cards to true Glassmorphism. We will use translucent `rgba(0, 229, 255, 0.05)` backgrounds with sharp, thin glowing cyan borders (`rgba(0, 229, 255, 0.3)`) and inner shadows to simulate floating glass displays.
- **Accents**: Neon Cyan (`#00E5FF`) for primary data, Warning Gold (`#FFB300`) for alerts, and Critical Crimson (`#FF003C`) for active threats.

**2. Dynamic Data Visualizations & Micro-Animations**
- **Boot-up Resource Progress Bars**: Wrap the static progress bars in `Animated.View`. On load, they will sweep from 0% to their target capacity, mimicking a system diagnostic boot sequence.
- **SOS Signal & Live Indicators (Arc Reactor Pulse)**: Upgrade the SOS button and "LIVE" badges with a continuous `Animated.loop` that scales and fades concentric rings, simulating a beating energy core or radar pulse.
- **Interactive Scaling**: Add `Animated.spring` scaling on all cards and buttons so they depress dynamically when touched, feeling highly responsive.

**3. JARVIS Terminal Stream (AI Coordination Feed)**
- Restyle the **AI Coordination Feed** to feel like JARVIS's internal monologue processing data. 
- Implement a fade-in / slide-up animation for each new log entry.
- Apply a stark, monospace futuristic typography for all system logs and timestamps.

**4. Advanced GIS Radar Scanner (Central Map)**
- Update the HTML payload in `buildMiniMapHTML` to inject a custom CSS `@keyframes` rotating radar sweep. This will overlay a sweeping translucent green/cyan cone over the Leaflet map, aggressively emphasizing the "live satellite tracking" capability.

---

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` in the mobile directory to verify that the newly added React Native `Animated` references and state hooks are type-safe.

### Manual Verification
- Render the screen in the Expo web preview.
- Confirm the background gradients, translucent panels, and pulsing animations load smoothly without layout shift.
- Test the rapid action buttons and map interactions to verify responsiveness.
