/**
 * CrisesMesh AI — Main App Entry
 * Multi-Crisis Management for Pakistan
 */
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        // 1. Connect to Google Fonts CDN
        const link1 = document.createElement('link');
        link1.rel = 'preconnect';
        link1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(link1);

        const link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.setAttribute('crossorigin', 'anonymous');
        document.head.appendChild(link2);

        // 2. Load high-fidelity Noto Sans Arabic (Urdu) & Inter (English)
        const link3 = document.createElement('link');
        link3.rel = 'stylesheet';
        link3.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap';
        document.head.appendChild(link3);

        // 3. Inject global style overrides for pristine, clean font scaling & anti-aliasing
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(`
          * {
            font-family: 'Inter', 'Noto Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          input, textarea, select, button {
            font-family: 'Inter', 'Noto Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          }
        `));
        document.head.appendChild(style);
      } catch (e) {
        console.warn('Failed to inject premium typography style guides:', e);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
