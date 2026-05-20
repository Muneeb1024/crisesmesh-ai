# Implementation Plan — Citizen Portal Complete Premium Overhaul (Version 3)

We will upgrade the remaining screens of the Citizen Portal (**Reports**, **Alert List**, **Live Siren Warnings**, and **Interactive Safety Maps**) to create a unified, world-class mobile user experience. 

Consistent with our theme guidelines, we will overhaul all dark panels in the Citizen screens into the **user-friendly Light Theme** (`#F8FAFC`), elevated with glassmorphism, thin emerald borders (`#10B981` at `0.15` opacity), and dynamic micro-animations.

---

## Proposed Changes

### 1. Global Language State Synchronization
To prevent citizens from having to select their language preference repeatedly on every screen, we will migrate the local `lang` state into our global Zustand state engine.

#### [MODIFY] [useAppStore.ts](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/store/useAppStore.ts)
* Add `lang: 'en' | 'ur'` and `setLang: (lang: 'en' | 'ur') => void` to `AppState`.
* Initialize `lang` to `'en'`.

#### [MODIFY] [CitizenOnboardingScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenOnboardingScreen.tsx)
* Import `useAppStore`.
* Replace local `lang` state with the global `lang` and `setLang` hooks.

#### [MODIFY] [CitizenHomeScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenHomeScreen.tsx)
* Replace local `lang` state with global `lang` and `setLang` hooks.

---

### 2. Citizen Report Screen Upgrades
#### [MODIFY] [CitizenReportScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenReportScreen.tsx)
* **Global Language Hook**: Replace local/hardcoded language parameters with Zustand's global `lang`. Add an English/Urdu pills switcher in the header row.
* **Premium Light Theme**: Polish card backdrops to use clean light-emerald glassmorphic parameters (`rgba(255,255,255,0.92)` with `rgba(16,185,129,0.15)` thin green borders).
* **Urdu Localization**: Add Urdu translations for all headers, categories, severity warnings, quick-phrases, and success screens.
* **Success Tracking**: Re-design the success screen to show a beautiful interactive multi-step vertical progress bar with active pulsating dots to track NDMA/AI classification status.

---

### 3. Citizen Alerts & Live Siren Warnings Upgrades
#### [MODIFY] [CitizenAlertsScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenAlertsScreen.tsx)
* **Urdu Support**: Connect global `lang` switcher in the header to toggle the alert text displaying in English and Urdu.
* **Visual Styling**: Refine card shadow parameters, borders, and colors to align with the friendly light-emerald styling.

#### [MODIFY] [CitizenAlertLiveScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenAlertLiveScreen.tsx)
* **Light Mode Overhaul**: Re-theme the dark elements (`backgroundColor`, inputs, cards) into our premium Light Mode theme.
* **TTS Warnings**: Hook up the voice warning triggers to use Roman Urdu or Urdu-accented scripts if Urdu is selected.
* **Bilingual UI**: Fully translate the Siren warnings, dismissed states, empty alert cards, and buttons dynamically based on `lang`.

---

### 4. Interactive Safety Navigation Map Upgrades
#### [MODIFY] [CitizenMapScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenMapScreen.tsx)
* **Bilingual Switcher**: Integrate language switching support inside the map HUD and advisories block.
* **Proximity HUD Overlay**: Style the HUD panel as a premium glassmorphic overlay floating on top of the Leaflet map. Add Urdu labels (`آپ محفوظ ہیں` / `خطرناک علاقہ`).
* **Interactive Threat Testing**: Ensure that when the citizen drags their marker pin inside the red zone boundaries, the warning acoustical sound effects and bilingual voice announcements dynamically respect their selected language.

---

## Verification Plan

### Automated Tests
- Type-check the React Native application to ensure zero syntax/TypeScript errors:
  ```powershell
  npx tsc --noEmit
  ```

### Manual Verification
1. Register a user in the Onboarding screen using **Urdu (اردو)**.
2. Confirm the **Citizen Dashboard** loads instantly in Urdu.
3. Open the **Report Screen**: Verify all fields, templates, and buttons are rendered in Urdu. Record a mock voice note and verify Urdu text-to-speech transcription.
4. Submit a report and watch the multi-step tracking progress bar.
5. Open the **Safety Map**: Drag the location marker into the red zone and verify that both English and Roman Urdu acoustic sirens/audio alerts fire.
6. Open the **Active Alerts** list and verify alerts toggle between English and Urdu.
