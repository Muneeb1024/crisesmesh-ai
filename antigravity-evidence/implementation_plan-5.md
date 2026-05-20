# Implementation Plan — Complete Language Isolation for Citizen Portal (Version 5)

## Goal Description
Isolate English and Urdu translation tracks completely on all citizen-facing screens. Eliminate mixed-language strings, bilingual labels (e.g. "Label / لیبل"), and parenthetical translations. Ensure that selecting English displays *100% English* and selecting Urdu displays *100% Urdu*.

## Proposed Changes

### Citizen Portal Screens

#### [MODIFY] [CitizenOnboardingScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenOnboardingScreen.tsx)
- Cleaned onboarding welcome headers and labels (e.g., Full Name, Phone Number) of parallel translation blocks.
- Separated English text and Urdu text inside the `LOCALIZATION` table to remove redundant Urdu tags in English mode and English tags in Urdu mode.

#### [MODIFY] [CitizenHomeScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenHomeScreen.tsx)
- Cleansed mixed headers (`LIVE DISTRICT MONITOR`, `LIVE STATE BROADCAST`, `PRIMARY RESPONSE PORTALS`, `VERIFIED RESCUE LIFELINES`).
- Dynamically localized emergency speed-dial labels (Rescue, Police, Ambulance) and connect/dispatch simulation logs depending on `lang` setting.

#### [MODIFY] [CitizenReportScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenReportScreen.tsx)
- Removed bilingual slashes from input tags (e.g. Camera, Gallery, Voice recorder).
- Refactored category picker and `getDynamicSeverityLevels()` function to fetch only clean English or Urdu content dynamically depending on the selected language, preventing mixed descriptions from rendering.

#### [MODIFY] [CitizenAlertsScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenAlertsScreen.tsx)
- Refactored mock alert cards to dynamically display either English or Roman Urdu block details based on user preference instead of rendering both side-by-side.
- Added localized translation keys for simulated SMS previews.

#### [MODIFY] [CitizenMapScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenMapScreen.tsx)
- Cleansed Map HUD status labels and safety advisories titles of mixed translations and slash characters.

---

## Verification Plan

### Automated Verification
- Run a typecheck on the React Native mobile directory:
  ```powershell
  npx tsc --noEmit
  ```
