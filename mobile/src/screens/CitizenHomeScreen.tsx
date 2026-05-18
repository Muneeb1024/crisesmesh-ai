/**
 * CrisesMesh AI — Citizen Command Dashboard (Ultimate Edition)
 * Features:
 * 1. Live PST Digital Clock in header
 * 2. Interactive tappable telemetry widgets
 * 3. Personal Node ID Badge (phone number)
 * 4. Emergency speed-dial dispatch modal simulation
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CitizenHome'>;

// Dispatch modal config per lifeline
interface DispatchCall {
  icon: string;
  number: string;
  service: string;
  message: string;
  color: string;
}

const DISPATCH_CALLS: DispatchCall[] = [
  {
    icon: '🚑',
    number: '1122',
    service: 'Rescue Service',
    message: 'Connecting to Pakistan Rescue 1122…\nEmergency team dispatch confirmed.',
    color: '#EF4444',
  },
  {
    icon: '👮',
    number: '15',
    service: 'Police Helpline',
    message: 'Connecting to Police Emergency Line 15…\nNearest station patrol en route.',
    color: '#0EA5E9',
  },
  {
    icon: '🏥',
    number: '115',
    service: 'Ambulance',
    message: 'Connecting to Edhi Ambulance 115…\nAmbulance dispatch in progress.',
    color: '#EF4444',
  },
];

function usePSTClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // PST = UTC+5
      const pst = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      const h = pst.getUTCHours().toString().padStart(2, '0');
      const m = pst.getUTCMinutes().toString().padStart(2, '0');
      const s = pst.getUTCSeconds().toString().padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function CitizenHomeScreen() {
  const navigation = useNavigation<NavProp>();
  const citizenProfile = useAppStore((s) => s.citizenProfile);
  const citizenReports = useAppStore((s) => s.citizenReports);
  const activeAlerts = useAppStore((s) => s.citizenAlerts || []);
  const activeReportCount = citizenReports.length;
  const pstTime = usePSTClock();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const clockFlash = useRef(new Animated.Value(1)).current;

  // Dispatch modal state
  const [dispatchCall, setDispatchCall] = useState<DispatchCall | null>(null);
  const [dispatchPhase, setDispatchPhase] = useState<'dialing' | 'confirmed'>('dialing');
  const dispatchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Clock colon flash
    Animated.loop(
      Animated.sequence([
        Animated.timing(clockFlash, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(clockFlash, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLogout = () => navigation.navigate('Landing');

  const handleTelemetryTap = (type: 'zones' | 'siren' | 'reports') => {
    if (type === 'zones' || type === 'siren') navigation.navigate('CitizenMap');
    else if (type === 'reports') navigation.navigate('CitizenAlertLive');
  };

  const openDispatch = (call: DispatchCall) => {
    setDispatchCall(call);
    setDispatchPhase('dialing');
    dispatchAnim.setValue(0);
    Animated.timing(dispatchAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    setTimeout(() => setDispatchPhase('confirmed'), 2200);
  };

  const closeDispatch = () => {
    Animated.timing(dispatchAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() =>
      setDispatchCall(null)
    );
  };

  const phoneDisplay = citizenProfile?.phone
    ? `+92-${citizenProfile.phone}`
    : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020813" />

      {/* ── HEADER BANNER ── */}
      <View style={styles.headerBanner}>
        <LinearGradient colors={['#020813', '#052A1D']} style={StyleSheet.absoluteFill} />
        <View style={styles.headerGlowRing} />

        <View style={styles.headerContent}>
          {/* Top row: Change Portal (left) + Live Clock (right) */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.exitBtn}>
              <Text style={styles.exitBtnText} numberOfLines={1} adjustsFontSizeToFit>← Change Portal</Text>
            </TouchableOpacity>

            <View style={styles.clockBox}>
              <View style={styles.clockPulseDot} />
              <Text style={styles.clockValue} numberOfLines={1} adjustsFontSizeToFit>PST {pstTime}</Text>
            </View>
          </View>

          {/* Greeting row + National Badge */}
          <View style={styles.greetingRow}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={styles.greetingTitle} numberOfLines={1} adjustsFontSizeToFit>
                Salaam, {citizenProfile?.name || 'Citizen'} 👋
              </Text>
              {phoneDisplay && (
                <Text style={styles.nodeIdText} numberOfLines={1} adjustsFontSizeToFit>
                  Citizen ID: {phoneDisplay}
                </Text>
              )}
            </View>

            <View style={styles.nationalBadge}>
              <Text style={styles.nationalBadgeText} numberOfLines={1} adjustsFontSizeToFit>🇵🇰 CRISIS PORTAL</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── SCROLLABLE BODY ── */}
      <ScrollView
        style={styles.scrollDeck}
        contentContainerStyle={styles.scrollDeckContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── LIVE TELEMETRY MONITOR (interactive) ── */}
          <View style={styles.telemetryCard}>
            <View style={styles.telemetryHeader}>
              <View style={styles.statusRow}>
                <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.telemetryLiveText} numberOfLines={1} adjustsFontSizeToFit>LIVE DISTRICT MONITOR | براہ راست مانیٹر</Text>
              </View>
              <Text style={styles.systemStatusTag}>ONLINE</Text>
            </View>

            <View style={styles.telemetryGrid}>
              {/* Tap: red zones → map */}
              <TouchableOpacity
                style={styles.telemetryItem}
                onPress={() => handleTelemetryTap('zones')}
                activeOpacity={0.7}
              >
                <Text style={styles.telemetryLabel} numberOfLines={1} adjustsFontSizeToFit>ACTIVE RED ZONES</Text>
                <Text style={[styles.telemetryValue, { color: '#EF4444' }]} numberOfLines={1} adjustsFontSizeToFit>0 AREAS</Text>
                <Text style={styles.telemetryTapHint} numberOfLines={1} adjustsFontSizeToFit>Tap → Map</Text>
              </TouchableOpacity>

              <View style={styles.telemetryDivider} />

              {/* Tap: siren → alerts */}
              <TouchableOpacity
                style={styles.telemetryItem}
                onPress={() => handleTelemetryTap('siren')}
                activeOpacity={0.7}
              >
                <Text style={styles.telemetryLabel} numberOfLines={1} adjustsFontSizeToFit>SIREN ALERTS</Text>
                <Text style={[styles.telemetryValue, { color: '#EAB308' }]} numberOfLines={1} adjustsFontSizeToFit>STANDBY</Text>
                <Text style={styles.telemetryTapHint} numberOfLines={1} adjustsFontSizeToFit>Tap → Alerts</Text>
              </TouchableOpacity>

              <View style={styles.telemetryDivider} />

              {/* Tap: reports count */}
              <TouchableOpacity
                style={styles.telemetryItem}
                onPress={() => handleTelemetryTap('reports')}
                activeOpacity={0.7}
              >
                <Text style={styles.telemetryLabel} numberOfLines={1} adjustsFontSizeToFit>YOUR REPORTS</Text>
                <Text style={[styles.telemetryValue, { color: '#10B981' }]} numberOfLines={1} adjustsFontSizeToFit>{activeReportCount} SUBMITTED</Text>
                <Text style={styles.telemetryTapHint} numberOfLines={1} adjustsFontSizeToFit>Tap → View</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── BROADCAST TICKER ── */}
          <TouchableOpacity
            style={styles.broadcastBanner}
            onPress={() => navigation.navigate('CitizenAlertLive')}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={StyleSheet.absoluteFill} />
            <Text style={styles.broadcastIcon}>📢</Text>
            <View style={styles.broadcastDetails}>
              <Text style={styles.broadcastTitle}>LIVE STATE BROADCAST | لائیو اعلان</Text>
              <Text style={styles.broadcastSubtitle}>
                Active Monsoon flooding alerts across verified country sectors. Tap to inspect Live Evacuation warnings & Sirens.
              </Text>
            </View>
            <View style={styles.broadcastBadge}>
              <Text style={styles.broadcastBadgeText}>TEST SIREN</Text>
            </View>
          </TouchableOpacity>

          {/* ── ACTION PORTALS ── */}
          <Text style={styles.sectionHeader}>PRIMARY RESPONSE PORTALS | بنیادی خدمات</Text>

          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('CitizenReport' as any)}
              activeOpacity={0.88}
            >
              <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.cardGradientIcon}>
                <Text style={styles.gridCardEmoji}>🌊</Text>
              </LinearGradient>
              <View style={styles.gridCardBody}>
                <View style={styles.cardLabelRow}>
                  <Text style={styles.gridCardTitle}>Report Flood / سیلاب کی رپورٹ</Text>
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>URGENT</Text>
                  </View>
                </View>
                <Text style={styles.gridCardSubtitle}>Submit active flooding data, blockages, or rescue requests instantly.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('CitizenMap' as any)}
              activeOpacity={0.88}
            >
              <LinearGradient colors={['#10B981', '#047857']} style={styles.cardGradientIcon}>
                <Text style={styles.gridCardEmoji}>🗺️</Text>
              </LinearGradient>
              <View style={styles.gridCardBody}>
                <Text style={styles.gridCardTitle}>Safety Navigation Map / حفاظتی نقشہ</Text>
                <Text style={styles.gridCardSubtitle}>Inspect active danger zones, road blocks, and AI safe path routing.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridCard}
              onPress={() => navigation.navigate('CitizenAlertLive' as any)}
              activeOpacity={0.88}
            >
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.cardGradientIcon}>
                <Text style={styles.gridCardEmoji}>🔔</Text>
              </LinearGradient>
              <View style={styles.gridCardBody}>
                <View style={styles.cardLabelRow}>
                  <Text style={styles.gridCardTitle}>Live Alerts Hub / ہنگامی انتباہات</Text>
                  <View style={[styles.urgentBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.urgentBadgeText}>ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.gridCardSubtitle}>Review evacuation broadcasts, siren triggers, and safety advisories.</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── EMERGENCY SPEED-DIAL ── */}
          <Text style={styles.sectionHeader}>VERIFIED RESCUE LIFELINES (سپیڈ ڈائل)</Text>
          <View style={styles.lifelineDeck}>
            {DISPATCH_CALLS.map((call) => (
              <TouchableOpacity
                key={call.number}
                style={styles.lifelineCard}
                onPress={() => openDispatch(call)}
                activeOpacity={0.8}
              >
                <View style={[styles.lifelineIconBg, { backgroundColor: call.color + '18' }]}>
                  <Text style={styles.lifelineIcon}>{call.icon}</Text>
                </View>
                <Text style={styles.lifelineNumber}>{call.number}</Text>
                <Text style={styles.lifelineLabel}>{call.service}</Text>
                <View style={styles.callSimBtn}>
                  <Text style={styles.callSimBtnText}>CALL SIM</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </Animated.View>
      </ScrollView>

      {/* ── DISPATCH MODAL ── */}
      <Modal transparent visible={!!dispatchCall} animationType="none" onRequestClose={closeDispatch}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { opacity: dispatchAnim, transform: [{ scale: dispatchAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
            <LinearGradient colors={['#020813', '#052A1D']} style={StyleSheet.absoluteFill} />

            <Text style={styles.modalIcon}>{dispatchCall?.icon}</Text>
            <Text style={styles.modalNumber}>{dispatchCall?.number}</Text>
            <Text style={styles.modalService}>{dispatchCall?.service}</Text>

            {dispatchPhase === 'dialing' ? (
              <View style={styles.dialingRow}>
                <View style={styles.dialingDot} />
                <Text style={styles.dialingText}>Dialing {dispatchCall?.number}…</Text>
              </View>
            ) : (
              <View style={styles.confirmedBox}>
                <Text style={styles.confirmedIcon}>✅</Text>
                <Text style={styles.confirmedText}>{dispatchCall?.message}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDispatch}>
              <Text style={styles.modalCloseBtnText}>End Simulation</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  headerBanner: { minHeight: 140, justifyContent: 'flex-end', paddingBottom: Spacing.md, position: 'relative', overflow: 'hidden' },
  headerGlowRing: { position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(16,185,129,0.08)' },
  headerContent: { paddingHorizontal: Spacing.xl },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  exitBtn: { backgroundColor: 'rgba(255,255,255,0.10)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  exitBtnText: { fontSize: 10, fontWeight: '700', color: '#CBD5E1' },
  clockBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  clockPulseDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#34D399', marginRight: 5 },
  clockValue: { fontSize: 10, color: '#FFFFFF', fontWeight: '800', fontVariant: ['tabular-nums'] },
  nationalBadge: { backgroundColor: 'rgba(16,185,129,0.16)', borderWidth: 0.5, borderColor: 'rgba(16,185,129,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.round },
  nationalBadgeText: { fontSize: 9, fontWeight: '800', color: '#34D399', letterSpacing: 0.5 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  greetingTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.1 },
  nodeIdText: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 2, opacity: 0.9 },

  // Scroll
  scrollDeck: { flex: 1 },
  scrollDeckContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: 60 },

  // Telemetry card
  telemetryCard: { backgroundColor: '#FFFFFF', borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: Spacing.lg, ...Shadows.sm },
  telemetryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: Spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: Spacing.sm },
  telemetryLiveText: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.8 },
  systemStatusTag: { fontSize: 9, fontWeight: '800', color: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  telemetryGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  telemetryItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  telemetryLabel: { fontSize: 8, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 3 },
  telemetryValue: { fontSize: Typography.sizes.md, fontWeight: '800', color: '#0F172A', marginBottom: 3 },
  telemetryTapHint: { fontSize: 8, color: '#94A3B8', fontWeight: '600' },
  telemetryDivider: { width: 1, height: 36, backgroundColor: '#E2E8F0' },

  // Broadcast
  broadcastBanner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md + 2, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: '#FDE68A', marginBottom: Spacing.xl, overflow: 'hidden', ...Shadows.sm },
  broadcastIcon: { fontSize: 22, marginRight: Spacing.md },
  broadcastDetails: { flex: 1 },
  broadcastTitle: { fontSize: Typography.sizes.md - 1, fontWeight: '800', color: '#78350F' },
  broadcastSubtitle: { fontSize: Typography.sizes.xs + 1, color: '#92400E', marginTop: 2, lineHeight: 14 },
  broadcastBadge: { backgroundColor: '#D97706', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, marginLeft: Spacing.sm },
  broadcastBadgeText: { fontSize: 8, fontWeight: '900', color: '#FFFFFF' },

  // Section
  sectionHeader: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1.2, marginBottom: Spacing.md },

  // Action cards
  gridContainer: { gap: Spacing.md, marginBottom: Spacing.xl },
  gridCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: BorderRadius.lg, padding: Spacing.md + 2, borderWidth: 1, borderColor: '#E2E8F0', ...Shadows.sm },
  cardGradientIcon: { width: 52, height: 52, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.lg },
  gridCardEmoji: { fontSize: 24 },
  gridCardBody: { flex: 1 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  gridCardTitle: { fontSize: Typography.sizes.md - 1, fontWeight: '800', color: '#0F172A', flex: 1 },
  gridCardSubtitle: { fontSize: Typography.sizes.sm - 1, color: '#64748B', marginTop: 3, lineHeight: 16 },
  urgentBadge: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  urgentBadgeText: { fontSize: 7, fontWeight: '900', color: '#FFFFFF' },

  // Lifelines
  lifelineDeck: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between', marginBottom: Spacing.xl },
  lifelineCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, alignItems: 'center', ...Shadows.sm },
  lifelineIconBg: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  lifelineIcon: { fontSize: 18 },
  lifelineNumber: { fontSize: Typography.sizes.md, fontWeight: '900', color: '#0F172A' },
  lifelineLabel: { fontSize: 8, fontWeight: '700', color: '#64748B', marginTop: 2, textAlign: 'center' },
  callSimBtn: { marginTop: 6, backgroundColor: '#059669', borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  callSimBtnText: { fontSize: 7, fontWeight: '900', color: '#FFFFFF' },

  // Dispatch modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  modalCard: { width: '100%', borderRadius: 20, padding: 28, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' },
  modalIcon: { fontSize: 52, marginBottom: 8 },
  modalNumber: { fontSize: 40, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },
  modalService: { fontSize: 13, fontWeight: '700', color: '#A7F3D0', marginBottom: 20 },
  dialingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dialingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EAB308', marginRight: 10 },
  dialingText: { fontSize: 14, color: '#FCD34D', fontWeight: '700' },
  confirmedBox: { alignItems: 'center', marginBottom: 24 },
  confirmedIcon: { fontSize: 32, marginBottom: 8 },
  confirmedText: { fontSize: 13, color: '#6EE7B7', fontWeight: '700', textAlign: 'center', lineHeight: 20 },
  modalCloseBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  modalCloseBtnText: { fontSize: 13, fontWeight: '700', color: '#E2E8F0' },
});
