/**
 * CrisesMesh AI — Citizen Alert Live Screen
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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { API_BASE_URL } from '../services/api';
import { useAppStore } from '../store/useAppStore';

// Try to import expo-speech (optional)
let Speech: any = null;
try { Speech = require('expo-speech'); } catch { Speech = null; }

const LOCALIZATION = {
  en: {
    back: '← Back',
    title: '🔔 Alerts',
    redZoneAhead: 'RED ZONE AHEAD',
    avoidUnderpass: 'Avoid G-10 Underpass • Critical Flooding',
    playEn: 'Play Warning (EN)',
    playUr: 'Play Warning (UR)',
    stopWarning: 'Stop Warning',
    enLabel: '🇬🇧 English Warning',
    urLabel: '🇵🇰 Roman Urdu',
    redZoneActive: 'Red Zone Active',
    residentsAffected: '~15,000 residents affected',
    underpassCoords: 'G-10 Underpass, Islamabad • 1.2km radius',
    dismissAlert: '✓ I Understand — Dismiss Alert',
    alertDismissed: 'Alert Dismissed',
    staySafeCheck: 'Stay safe. Check back for updates.',
    refreshAlerts: 'Refresh Alerts',
    noActiveAlerts: 'No Active Alerts',
    noAlertsDetail: 'No emergency alerts in your area.\nGovernment will notify you if a situation develops.',
    refresh: 'Refresh',
  },
  ur: {
    back: '← واپس',
    title: '🔔 الرٹس',
    redZoneAhead: 'خطرناک علاقہ آگے ہے',
    avoidUnderpass: 'جی-10 انڈر پاس سے پرہیز کریں • شدید سیلاب',
    playEn: 'وارننگ چلائیں (انگریزی)',
    playUr: 'وارننگ چلائیں (رومن اردو)',
    stopWarning: 'وارننگ بند کریں',
    enLabel: '🇬🇧 انگریزی وارننگ',
    urLabel: '🇵🇰 رومن اردو وارننگ',
    redZoneActive: 'خطرناک زون فعال ہے',
    residentsAffected: 'تقریباً 15,000 شہری متاثر ہیں',
    underpassCoords: 'جی-10 انڈر پاس، اسلام آباد • 1.2 کلومیٹر رداس',
    dismissAlert: '✓ میں سمجھ گیا — الرٹ ہٹائیں',
    alertDismissed: 'الرٹ خارج کر دیا گیا',
    staySafeCheck: 'محفوظ رہیں۔ اپ ڈیٹس کے لیے دوبارہ چیک کریں۔',
    refreshAlerts: 'الرٹس اپڈیٹ کریں',
    noActiveAlerts: 'کوئی فعال الرٹ نہیں ہے',
    noAlertsDetail: 'آپ کے علاقے میں کوئی ہنگامی الرٹ نہیں ہے۔\nبحران کی صورت میں حکومت آپ کو مطلع کرے گی۔',
    refresh: 'ریفریش کریں',
  }
};

export default function CitizenAlertLiveScreen({ navigation, route }: any) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [sirenActive, setSirenActive] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeSpeechKey, setActiveSpeechKey] = useState<'en' | 'ur' | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { lang, setLang } = useAppStore();
  const t = LOCALIZATION[lang];

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

  const handleSpeak = (text: string, key: 'en' | 'ur') => {
    if (!Speech) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (speaking) {
          window.speechSynthesis.cancel();
          if (activeSpeechKey === key) {
            setSpeaking(false);
            setActiveSpeechKey(null);
            return;
          }
        }
        setSpeaking(true);
        setActiveSpeechKey(key);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = key === 'ur' ? 'en' : 'en-US'; // Use English voice with romanized Urdu text for maximum web TTS compatibility
        utterance.rate = 0.9;
        utterance.onend = () => {
          setSpeaking(false);
          setActiveSpeechKey(null);
        };
        utterance.onerror = () => {
          setSpeaking(false);
          setActiveSpeechKey(null);
        };
        window.speechSynthesis.speak(utterance);
      }
      return;
    }
    if (speaking) {
      Speech.stop();
      if (activeSpeechKey === key) {
        setSpeaking(false);
        setActiveSpeechKey(null);
        return;
      }
    }
    setSpeaking(true);
    setActiveSpeechKey(key);
    Speech.speak(text, {
      language: key === 'ur' ? 'ur' : 'en',
      pitch: 1.1,
      rate: 0.9,
      onDone: () => { setSpeaking(false); setActiveSpeechKey(null); },
      onError: () => { setSpeaking(false); setActiveSpeechKey(null); },
    });
  };

  const handleDismiss = () => {
    if (Speech) Speech.stop();
    setSirenActive(false);
    setSpeaking(false);
    setActiveSpeechKey(null);
    setDismissed(true);
  };

  const flashBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.08)'],
  });

  const liveAlert = alerts[0];

  return (
    <Animated.View style={[s.container, { backgroundColor: flashBg as any }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.citizenBg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.title}</Text>
        
        <View style={s.langToggleContainer}>
          <TouchableOpacity 
            onPress={() => setLang('en')} 
            style={[s.langToggleBtn, lang === 'en' && s.langToggleBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[s.langToggleText, lang === 'en' && s.langToggleTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setLang('ur')} 
            style={[s.langToggleBtn, lang === 'ur' && s.langToggleBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[s.langToggleText, lang === 'ur' && s.langToggleTextActive]}>اردو</Text>
          </TouchableOpacity>
        </View>
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
              <Text style={s.sirenTitle}>{t.redZoneAhead}</Text>
              <Text style={s.sirenSub}>{t.avoidUnderpass}</Text>
            </View>

            {/* Voice Controls */}
            <View style={s.voiceRow}>
              <TouchableOpacity
                style={[s.voiceBtn, activeSpeechKey === 'en' && s.voiceBtnActive]}
                onPress={() => handleSpeak('Warning! Red Zone ahead. Avoid G-10 Underpass. Critical urban flooding reported. Emergency services have been dispatched. Please stay indoors and avoid this route.', 'en')}
              >
                <Text style={s.voiceBtnIcon}>{activeSpeechKey === 'en' ? '⏹' : '🔊'}</Text>
                <Text style={s.voiceBtnText}>{activeSpeechKey === 'en' ? t.stopWarning : t.playEn}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.voiceBtn, activeSpeechKey === 'ur' && s.voiceBtnActive]}
                onPress={() => handleSpeak('Khatarnak ilaaqa saamne hai. G-10 Underpass se dur rahein. Sailaab ki khabardar. Emergency services bhaij di gayi hain.', 'ur')}
              >
                <Text style={s.voiceBtnIcon}>{activeSpeechKey === 'ur' ? '⏹' : '🔊'}</Text>
                <Text style={s.voiceBtnText}>{activeSpeechKey === 'ur' ? t.stopWarning : t.playUr}</Text>
              </TouchableOpacity>
            </View>

            {/* Alert Text Cards */}
            <View style={s.alertCard}>
              <Text style={s.alertLang}>{t.enLabel}</Text>
              <Text style={s.alertText}>{liveAlert.english_text || MOCK_ALERT.english_text}</Text>
            </View>

            <View style={[s.alertCard, { borderColor: 'rgba(217,119,6,0.3)', backgroundColor: '#FFFBEB' }]}>
              <Text style={[s.alertLang, { color: '#D97706' }]}>{t.urLabel}</Text>
              <Text style={s.alertText}>{liveAlert.roman_urdu_text || MOCK_ALERT.roman_urdu_text}</Text>
            </View>

            {/* Red Zone Warning Box */}
            <View style={s.redZoneBox}>
              <Text style={s.redZoneIcon}>🔴</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.redZoneTitle}>{t.redZoneActive}</Text>
                <Text style={s.redZoneSub}>{t.underpassCoords}</Text>
                <Text style={s.redZoneSub}>{t.residentsAffected}</Text>
              </View>
            </View>

            {/* Dismiss */}
            <TouchableOpacity style={s.dismissBtn} onPress={handleDismiss} activeOpacity={0.8}>
              <Text style={s.dismissText}>{t.dismissAlert}</Text>
            </TouchableOpacity>
          </>
        ) : dismissed ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>✅</Text>
            <Text style={s.emptyTitle}>{t.alertDismissed}</Text>
            <Text style={s.emptySub}>{t.staySafeCheck}</Text>
            <TouchableOpacity style={s.refreshBtn} onPress={() => { setDismissed(false); fetchAlerts(); }} activeOpacity={0.8}>
              <Text style={s.refreshText}>{t.refreshAlerts}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🟢</Text>
            <Text style={s.emptyTitle}>{t.noActiveAlerts}</Text>
            <Text style={s.emptySub}>{t.noAlertsDetail}</Text>
            <TouchableOpacity style={s.refreshBtn} onPress={fetchAlerts} activeOpacity={0.8}>
              <Text style={s.refreshText}>{t.refresh}</Text>
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
    borderBottomWidth: 1, borderBottomColor: 'rgba(16,185,129,0.1)',
    backgroundColor: Colors.white,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F1F5F9',
  },
  backText: { color: Colors.citizenText, fontSize: Typography.sizes.sm, fontWeight: '700' },
  headerTitle: { color: Colors.citizenText, fontSize: Typography.sizes.lg, fontWeight: '800' },
  langToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  langToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm - 1,
  },
  langToggleBtnActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  langToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.citizenTextSecondary,
  },
  langToggleTextActive: {
    color: Colors.primary,
  },
  scroll: { padding: Spacing.md },
  sirenSection: { alignItems: 'center', paddingVertical: 32 },
  sirenRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(239,68,68,0.08)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(239,68,68,0.25)',
  },
  sirenInner: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  sirenIcon: { fontSize: 48 },
  sirenTitle: { color: '#ef4444', fontSize: 26, fontWeight: '900', letterSpacing: 2, marginTop: 16 },
  sirenSub: { color: '#64748B', fontSize: Typography.sizes.sm, marginTop: 4, fontWeight: '600' },
  voiceRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  voiceBtn: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12,
    padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E2E8F0',
  },
  voiceBtnActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  voiceBtnIcon: { fontSize: 22 },
  voiceBtnText: { color: Colors.citizenText, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  alertCard: {
    backgroundColor: '#FEF2F2', borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.15)',
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  alertLang: { color: '#EF4444', fontSize: Typography.sizes.xs, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  alertText: { color: '#7F1D1D', fontSize: Typography.sizes.sm, lineHeight: 22, fontWeight: '500' },
  redZoneBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FEF2F2', borderRadius: 12,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.15)', padding: Spacing.md, marginTop: 4,
  },
  redZoneIcon: { fontSize: 32 },
  redZoneTitle: { color: '#DC2626', fontSize: Typography.sizes.md, fontWeight: '800' },
  redZoneSub: { color: '#7F1D1D', fontSize: Typography.sizes.xs, marginTop: 2, fontWeight: '500' },
  dismissBtn: {
    backgroundColor: '#10B981', borderRadius: 14, padding: 18,
    alignItems: 'center', marginTop: 20, ...Shadows.md,
  },
  dismissText: { color: Colors.white, fontWeight: '800', fontSize: Typography.sizes.md },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.lg },
  emptyIcon: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { color: Colors.citizenText, fontSize: Typography.sizes.xl, fontWeight: '800', marginBottom: 8 },
  emptySub: { color: '#64748B', fontSize: Typography.sizes.md, textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  refreshBtn: {
    marginTop: 24, backgroundColor: '#ECFDF5', borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 12, borderWidth: 1.5, borderColor: '#10B981',
  },
  refreshText: { color: '#059669', fontWeight: '700', fontSize: Typography.sizes.sm },
});
