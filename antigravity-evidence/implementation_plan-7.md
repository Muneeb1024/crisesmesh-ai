# Implementation Plan — Premium Report Screen Improvements & Web Camera/Gallery Fix (Version 7)

## Goal Description
Resolve camera/gallery and alert feedback issues on Expo Web, and overall elevate the Citizen Report screen to absolute top tier (world-class citizen-friendly) standards using clean layout architecture, complete language isolation, and smart situational telemetry features.

## Proposed Changes

### Mobile Citizen Report Screen

#### [MODIFY] [CitizenReportScreen.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/screens/CitizenReportScreen.tsx)
- Added a cross-platform helper `showAlert` that uses `window.alert`/`window.confirm` fallbacks when running in Web browsers, preventing silent failures when users interact before selection.
- Created `triggerWebFilePicker` using HTML5 file uploads to allow desktop/mobile browser users to upload real pictures from their local libraries or cameras when hardware modes are active.
- Refactored `handleCameraOpen` and `handleGalleryOpen` to hook into `triggerWebFilePicker` on Web, and use native `expo-image-picker` permissions/API on iOS/Android.
- Upgraded the situational Quick Phrase suggester `getQuickPhrases` to display pristine English phrases in English mode and beautiful Urdu script in Urdu mode.
- Localized the AI Voice Note transcription simulation (`handleVoiceRecordStop`) so that it transcribes to pure English or pure Urdu script depending on the app's global language setting.

---

## Verification Plan

### Automated Verification
- Run a typecheck on the React Native mobile codebase:
  ```powershell
  npx tsc --noEmit
  ```
