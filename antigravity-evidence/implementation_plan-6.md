# Implementation Plan — Premium Typography Stack for English & Urdu (Version 6)

## Goal Description
Enhance application typography to make it look exceptionally neat, clean, and professional. Inject high-fidelity Google Fonts (`Inter` for English, `Noto Sans Arabic` for Urdu) at the root level on Expo Web, and configure optimized native font stacks for Android and iOS in the design system.

## Proposed Changes

### Configuration files

#### [MODIFY] [App.tsx](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/App.tsx)
- Dynamically preconnects and loads Google Fonts (`Inter` and `Noto Sans Arabic`) at runtime on Web.
- Injects a global `<style>` block to apply font stacks to all components, adding `-webkit-font-smoothing` and `-moz-osx-font-smoothing` for pristine anti-aliasing.

#### [MODIFY] [theme.ts](file:///e:/WORKSPACE/AI-SEEKHO-ANTIGRAVITY-HACKATHON/crisesmesh-ai/mobile/src/constants/theme.ts)
- Imported `Platform` from `react-native` to select platform-specific clean fonts.
- Replaced basic `'System'` strings with optimized, clean fallback chains for English (`Inter`, system fonts) and Urdu (`Noto Sans Arabic`, `Geeza Pro` on iOS).

---

## Verification Plan

### Automated Verification
- Run a typecheck on the React Native mobile directory:
  ```powershell
  npx tsc --noEmit
  ```
