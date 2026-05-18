/**
 * CrisesMesh AI — Citizen Alert Live Screen (Task 4.4 + 4.5)
 * Citizen receives approved alert with:
 * - Siren animation
 * - Voice warning (TTS via expo-speech)
 * - Bilingual alert text
 * - Red zone warning
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Easing,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import { API_BASE_URL } from '../services/api';

// Try to import expo-speech (optional)
let Speech: any = null;
try { Speech = require('expo-speech'); } catch { Speech = null; }

export default function CitizenAlertLiveScreen({ navigation, route }: any) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [sirenActive, setSirenActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (sirenActive) {
      startPulse();
      startFlash();
    } else {
      pulseAnim.stopAnimation();
      flashAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(flashAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [sirenActive]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  };

  const startFlash = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  };

  const fetchAlerts = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/alerts`);
      const d = await r.json();
      const approved = (d.alerts || []).filter((a: any) => a.status === 'Approved');
      setAlerts(approved);
      if (approved.length > 0) setSirenActive(true);
    } catch {
      // Use mock approved alert if backend unavailable
      setAlerts([MOCK_ALERT]);
      setSirenActive(true);
    }
  };

  const handleSpeak = (text: string) => {
    if (!Speech) return;
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language: 'en',
      pitch: 1.1,
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const handleDismiss = () => {
    if (Speech) Speech.stop();
    setSirenActive(false);
    setSpeaking(false);
    setDismissed(true);
  };

  const flashBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.08)'],
  });

  const liveAlert = alerts[0];

  return (
    <Animated.View style={[s.container, { backgroundColor: flashBg as any }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.citizenBg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🔔 Emergency Alerts</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {liveAlert && !dismissed ? (
          <>
            {/* Siren */}
            <View style={s.sirenSection}>
              <Animated.View style={[s.sirenRing, { transform: [{ scale: pulseAnim }] }]}>
                <View style={s.sirenInner}>
                  <Text style={s.sirenIcon}>🚨</Text>
                </View>
              </Animated.View>
              <Text style={s.sirenTitle}>RED ZONE AHEAD</Text>
              <Text style={s.sirenSub}>Avoid G-10 Underpass • Critical Flooding</Text>
            </View>

            {/* Voice Controls */}
            <View style={s.voiceRow}>
              <TouchableOpacity
                style={[s.voiceBtn, speaking && s.voiceBtnActive]}
                onPress={() => handleSpeak('Warning! Red Zone ahead. Avoid G-10 Underpass. Critical urban flooding reported. Emergency services have been dispatched. Please stay indoors and avoid this route.')}
              >
                <Text style={s.voiceBtnIcon}>{speaking ? '⏹' : '🔊'}</Text>
                <Text style={s.voiceBtnText}>{speaking ? 'Stop Warning' : 'Play Warning (EN)'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.voiceBtn}
                onPress={() => handleSpeak('Khatarnak ilaaqa saamne hai. G-10 Underpass se dur rahein. Sailaab ki khabardar. Emergency services bhaij di gayi hain.')}
              >
                <Text style={s.voiceBtnIcon}>🔊</Text>
                <Text style={s.voiceBtnText}>Play Warning (UR)</Text>
              </TouchableOpacity>
            </View>

            {/* Alert Text Cards */}
            <View style={s.alertCard}>
              <Text style={s.alertLang}>🇬🇧 English Warning</Text>
              <Text style={s.alertText}>{liveAlert.english_text || MOCK_ALERT.english_text}</Text>
            </View>

            <View style={[s.alertCard, { borderColor: 'rgba(139,92,246,0.4)' }]}>
              <Text style={[s.alertLang, { color: '#a78bfa' }]}>🇵🇰 Roman Urdu</Text>
              <Text style={s.alertText}>{liveAlert.roman_urdu_text || MOCK_ALERT.roman_urdu_text}</Text>
            </View>

            {/* Red Zone Warning Box */}
            <View style={s.redZoneBox}>
              <Text style={s.redZoneIcon}>🔴</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.redZoneTitle}>Red Zone Active</Text>
                <Text style={s.redZoneSub}>G-10 Underpass, Islamabad • 1.2km radius</Text>
                <Text style={s.redZoneSub}>~15,000 residents affected</Text>
              </View>
            </View>

            {/* Dismiss */}
            <TouchableOpacity style={s.dismissBtn} onPress={handleDismiss}>
              <Text style={s.dismissText}>✓ I Understand — Dismiss Alert</Text>
            </TouchableOpacity>
          </>
        ) : dismissed ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>✅</Text>
            <Text style={s.emptyTitle}>Alert Dismissed</Text>
            <Text style={s.emptySub}>Stay safe. Check back for updates.</Text>
            <TouchableOpacity style={s.refreshBtn} onPress={() => { setDismissed(false); fetchAlerts(); }}>
              <Text style={s.refreshText}>Refresh Alerts</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🟢</Text>
            <Text style={s.emptyTitle}>No Active Alerts</Text>
            <Text style={s.emptySub}>
              No emergency alerts in your area.{'\n'}
              Government will notify you if a situation develops.
            </Text>
            <TouchableOpacity style={s.refreshBtn} onPress={fetchAlerts}>
              <Text style={s.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
}

const MOCK_ALERT = {
  id: 'alert_mock',
  status: 'Approved',
  severity: 'Critical',
  english_text:
    '🚨 EMERGENCY ALERT — CRITICAL URBAN FLOODING\n' +
    'Location: G-10 Underpass, Islamabad\n' +
    'Danger level: Critical. Residents must avoid the area immediately.\n' +
    'Emergency services have been dispatched. Stay indoors and await further instructions.',
  roman_urdu_text:
    '🚨 HATAMI KHABAR — CRITICAL URBAN FLOODING\n' +
    'Muqam: G-10 Underpass, Islamabad\n' +
    'Khatarnak satah: Critical. Logon ko is ilaqe se fori door rehna chahiye.\n' +
    'Emergency services bhaij diye gaye hain. Ghar ke andar rahein.',
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.citizenBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 52, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,100,100,0.15)',
  },
  backBtn: { width: 60 },
  backText: { color: Colors.govAccent, fontSize: Typography.sizes.sm, fontWeight: '600' },
  headerTitle: { color: Colors.citizenText, fontSize: Typography.sizes.lg, fontWeight: '700' },
  scroll: { padding: Spacing.md },
  sirenSection: { alignItems: 'center', paddingVertical: 32 },
  sirenRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(239,68,68,0.4)',
  },
  sirenInner: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  sirenIcon: { fontSize: 48 },
  sirenTitle: { color: '#ef4444', fontSize: 26, fontWeight: '900', letterSpacing: 2, marginTop: 16 },
  sirenSub: { color: '#fca5a5', fontSize: Typography.sizes.sm, marginTop: 4 },
  voiceRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  voiceBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12,
    padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  voiceBtnActive: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: '#ef4444' },
  voiceBtnIcon: { fontSize: 22 },
  voiceBtnText: { color: Colors.citizenText, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  alertCard: {
    backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  alertLang: { color: '#f87171', fontSize: Typography.sizes.xs, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  alertText: { color: Colors.citizenText, fontSize: Typography.sizes.sm, lineHeight: 22 },
  redZoneBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', padding: Spacing.md, marginTop: 4,
  },
  redZoneIcon: { fontSize: 32 },
  redZoneTitle: { color: '#ef4444', fontSize: Typography.sizes.md, fontWeight: '800' },
  redZoneSub: { color: '#fca5a5', fontSize: Typography.sizes.xs, marginTop: 2 },
  dismissBtn: {
    backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 14, padding: 18,
    alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#22c55e',
  },
  dismissText: { color: '#22c55e', fontWeight: '700', fontSize: Typography.sizes.md },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.lg },
  emptyIcon: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { color: Colors.citizenText, fontSize: Typography.sizes.xl, fontWeight: '800', marginBottom: 8 },
  emptySub: { color: '#94a3b8', fontSize: Typography.sizes.md, textAlign: 'center', lineHeight: 24 },
  refreshBtn: {
    marginTop: 24, backgroundColor: 'rgba(0,255,210,0.12)', borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 12, borderWidth: 1, borderColor: Colors.govAccent,
  },
  refreshText: { color: Colors.govAccent, fontWeight: '700', fontSize: Typography.sizes.sm },
});
