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
import { triggerCitizenSos } from '../services/api';

const { width } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CitizenHome'>;

const LOCALIZATION = {
  en: {
    changePortal: 'Change Portal',
    portalBadge: 'CRISIS PORTAL',
    liveMonitor: 'LIVE DISTRICT MONITOR',
    online: 'ONLINE',
    activeZones: 'ACTIVE RED ZONES',
    sirenAlerts: 'SIREN ALERTS',
    yourReports: 'YOUR REPORTS',
    standby: 'STANDBY',
    submitted: 'SUBMITTED',
    areas: '0 AREAS',
    tapMap: 'Tap → Map',
    tapAlerts: 'Tap → Alerts',
    tapView: 'Tap → View',
    liveBroadcast: 'LIVE STATE BROADCAST',
    broadcastNotice: 'Active Monsoon flooding alerts across verified country sectors. Tap to inspect Live Evacuation warnings & Sirens.',
    testSiren: 'TEST SIREN',
    primaryPortals: 'PRIMARY RESPONSE PORTALS',
    reportFloodTitle: 'Report Flood',
    reportFloodSub: 'Submit active flooding data, blockages, or rescue requests instantly.',
    urgent: 'URGENT',
    mapTitle: 'Safety Navigation Map',
    mapSub: 'Inspect active danger zones, road blocks, and AI safe path routing.',
    alertsTitle: 'Live Alerts Hub',
    alertsSub: 'Review evacuation broadcasts, siren triggers, and safety advisories.',
    active: 'ACTIVE',
    rescueLifelines: 'VERIFIED RESCUE LIFELINES',
    callSim: 'CALL SIM',
    sosTitle: '🚨 INSTANT SOS EMERGENCY SIGNAL',
    sosSub: 'Broadcast distress coordinates, medical requests & battery status',
    sosTransmitted: '🚨 SOS SIGNAL ACTIVE & TRANSMITTING',
    sosSuccessDetails: 'Emergency dispatch routing active. Rescue grid notified.',
    sosCancel: 'Cancel Alert',
    sosTriggerBtn: 'ACTIVATE PANIC SOS',
    sosCounting: 'Transmitting SOS in...',
    meshTitle: '📡 OFFLINE MESH BEACON (P2P)',
    meshSub: 'Broadcasting offline telemetry to nearby peer rescue nodes',
    meshInactive: 'Mesh Network Disconnected',
    meshActive: 'Mesh Active (P2P Mode)',
    meshJoinBtn: 'Join Mesh Network',
    meshLeaveBtn: 'Leave Mesh Network',
    meshScanning: 'Scanning for local nodes...',
    meshConnectedPeers: 'Mesh Network Connected (3 active relays)',
    meshPeerLabel: 'Nearby Peering Relays:',
    dialingText: 'Dialing Rescue Line...',
    endSim: 'End Simulation',
  },
  ur: {
    changePortal: 'پورٹل تبدیل کریں',
    portalBadge: 'کرائسس پورٹل',
    liveMonitor: 'براہ راست مانیٹر',
    online: 'آن لائن',
    activeZones: 'سرگرم ریڈ زون',
    sirenAlerts: 'سائرن الرٹس',
    yourReports: 'آپ کی رپورٹس',
    standby: 'سٹینڈ بائی',
    submitted: 'جمع کرائی گئی',
    areas: '0 علاقے',
    tapMap: 'نقشہ دیکھیں ←',
    tapAlerts: 'الرٹس دیکھیں ←',
    tapView: 'رپورٹس دیکھیں ←',
    liveBroadcast: 'لائیو ریاستی نشریات',
    broadcastNotice: 'ملک کے تصدیق شدہ شعبوں میں مون سون کے فعال سیلاب کے الرٹس۔ سائرن اور انخلا کے انتباہات کا معائنہ کرنے کے لیے ٹیپ کریں۔',
    testSiren: 'سائرن ٹیسٹ',
    primaryPortals: 'بنیادی امدادی پورٹلز',
    reportFloodTitle: 'سیلاب کی رپورٹ',
    reportFloodSub: 'سیلاب کا ڈیٹا، رکاوٹیں، یا فوری بچاؤ کی درخواستیں جمع کرائیں۔',
    urgent: 'فوری',
    mapTitle: 'حفاظتی نقشہ',
    mapSub: 'خطرناک علاقوں، سڑکوں کی بندش، اور AI کے ذریعے محفوظ راستوں کا معائنہ کریں۔',
    alertsTitle: 'ہنگامی انتباہات',
    alertsSub: 'انخلاء کی نشریات، سائرن کے محرکات، اور حفاظتی مشورے کا جائزہ لیں۔',
    active: 'سرگرم',
    rescueLifelines: 'تصدیق شدہ امدادی لائنز (سپیڈ ڈائل)',
    callSim: 'کال کریں',
    sosTitle: '🚨 فوری مدد ہنگامی سگنل',
    sosSub: 'پریشانی کے نقاط، طبی درخواستیں اور بیٹری کی حیثیت نشر کریں',
    sosTransmitted: '🚨 ہنگامی مدد سگنل سرگرم اور جاری ہے',
    sosSuccessDetails: 'ہنگامی ٹیم کو روانہ کر دیا گیا ہے۔ بچاؤ کا نظام متحرک ہے۔',
    sosCancel: 'منسوخ کریں',
    sosTriggerBtn: 'مدد کے لیے دبائیں',
    sosCounting: 'سگنل نشر ہو رہا ہے...',
    meshTitle: '📡 آف لائن میش بیکن (پی ٹو پی)',
    meshSub: 'قریبی آلات کو آف لائن ہنگامی معلومات فراہم کریں',
    meshInactive: 'میش نیٹ ورک غیر فعال ہے',
    meshActive: 'میش سرگرم ہے (پی ٹو پی موڈ)',
    meshJoinBtn: 'میش میں شامل ہوں',
    meshLeaveBtn: 'میش نیٹ ورک چھوڑیں',
    meshScanning: 'قریبی آلات تلاش کیے جا رہے ہیں...',
    meshConnectedPeers: 'میش نیٹ ورک منسلک ہے (3 فعال آلات)',
    meshPeerLabel: 'قریبی منسلک آلات:',
    dialingText: 'امدادی لائن ڈائل ہو رہی ہے...',
    endSim: 'سیمولیشن ختم کریں',
  }
};

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

  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);

  // Dynamically translate dispatch call values depending on selected language
  const getLocalizedCall = (call: DispatchCall) => {
    const isUrdu = lang === 'ur';
    let service = call.service;
    let message = call.message;

    if (call.number === '1122') {
      service = isUrdu ? 'بچاؤ سروس' : 'Rescue Service';
      message = isUrdu 
        ? 'پاکستان ریسکیو 1122 سے رابطہ ہو رہا ہے…\nہنگامی ٹیم کی روانگی کی تصدیق ہو گئی۔' 
        : 'Connecting to Pakistan Rescue 1122…\nEmergency team dispatch confirmed.';
    } else if (call.number === '15') {
      service = isUrdu ? 'پولیس ہیلپ لائن' : 'Police Helpline';
      message = isUrdu 
        ? 'پولیس ایمرجنسی لائن 15 سے رابطہ ہو رہا ہے…\nقریبی تھانے کا پٹرول روانہ ہو گیا۔' 
        : 'Connecting to Police Emergency Line 15…\nNearest station patrol en route.';
    } else if (call.number === '115') {
      service = isUrdu ? 'ایمبولینس' : 'Ambulance';
      message = isUrdu 
        ? 'ایدھی ایمبولینس 115 سے رابطہ ہو رہا ہے…\nایمبولینس کی روانگی جاری ہے۔' 
        : 'Connecting to Edhi Ambulance 115…\nAmbulance dispatch in progress.';
    }

    return { ...call, service, message };
  };

  // SOS state
  const [sosState, setSosState] = useState<'idle' | 'counting' | 'active'>('idle');
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mesh State
  const [meshActive, setMeshActive] = useState(false);
  const [peers, setPeers] = useState<{ id: string; dist: string; bat: string; status: string }[]>([]);
  const [scanning, setScanning] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const clockFlash = useRef(new Animated.Value(1)).current;

  // Radar & Sound Wave Anim Ref
  const radarAnim = useRef(new Animated.Value(0)).current;
  const soundAnim1 = useRef(new Animated.Value(15)).current;
  const soundAnim2 = useRef(new Animated.Value(25)).current;
  const soundAnim3 = useRef(new Animated.Value(35)).current;
  const soundAnim4 = useRef(new Animated.Value(20)).current;
  const soundAnim5 = useRef(new Animated.Value(10)).current;

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

  // Soundwave visualizer dialing effect
  useEffect(() => {
    let interval: any;
    if (dispatchCall && dispatchPhase === 'dialing') {
      interval = setInterval(() => {
        Animated.parallel([
          Animated.timing(soundAnim1, { toValue: Math.random() * 40 + 10, duration: 150, useNativeDriver: false }),
          Animated.timing(soundAnim2, { toValue: Math.random() * 40 + 10, duration: 150, useNativeDriver: false }),
          Animated.timing(soundAnim3, { toValue: Math.random() * 40 + 10, duration: 150, useNativeDriver: false }),
          Animated.timing(soundAnim4, { toValue: Math.random() * 40 + 10, duration: 150, useNativeDriver: false }),
          Animated.timing(soundAnim5, { toValue: Math.random() * 40 + 10, duration: 150, useNativeDriver: false }),
        ]).start();
      }, 150);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dispatchCall, dispatchPhase]);

  // Radar scanning effect
  useEffect(() => {
    let timer: any;
    if (meshActive) {
      setScanning(true);
      radarAnim.setValue(0);
      Animated.loop(
        Animated.timing(radarAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      timer = setTimeout(() => {
        setPeers([
          { id: 'ID-Sajid', dist: '34m', bat: '88%', status: 'Relaying' },
          { id: 'ID-Fariha', dist: '78m', bat: '62%', status: 'Relaying' },
          { id: 'ID-Command-Node', dist: '185m', bat: '99%', status: 'Gateway' },
        ]);
        setScanning(false);
      }, 2500);
    } else {
      radarAnim.setValue(0);
      setPeers([]);
      setScanning(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [meshActive]);

  const triggerSOS = () => {
    if (sosState === 'idle') {
      setSosState('counting');
      setCountdown(3);
      
      let count = 3;
      timerRef.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setSosState('active');
          
          // Trigger backend SOS alert
          const phone = citizenProfile?.phone || '0000000000';
          const name = citizenProfile?.name || 'Citizen';
          triggerCitizenSos(
            33.6844,
            73.0479,
            name,
            phone
          ).catch(err => console.log('Error triggering SOS API:', err));
        } else {
          setCountdown(count);
        }
      }, 1000);
    }
  };

  const cancelSOS = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSosState('idle');
  };

  const t = LOCALIZATION[lang];

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
          {/* Top row: Change Portal (left) + Lang Toggle (middle) + Live Clock (right) */}
          <View style={styles.topRow}>
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.exitBtn}>
              <Text style={styles.exitBtnText} numberOfLines={1} adjustsFontSizeToFit>← {t.changePortal}</Text>
            </TouchableOpacity>

            <View style={styles.langToggleContainer}>
              <TouchableOpacity
                style={[styles.langToggleBtn, lang === 'en' && styles.langToggleActive]}
                onPress={() => setLang('en')}
                activeOpacity={0.8}
              >
                <Text style={[styles.langToggleText, lang === 'en' && styles.langToggleTextActive]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langToggleBtn, lang === 'ur' && styles.langToggleActive]}
                onPress={() => setLang('ur')}
                activeOpacity={0.8}
              >
                <Text style={[styles.langToggleText, lang === 'ur' && styles.langToggleTextActive]}>اردو</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.clockBox}>
              <View style={styles.clockPulseDot} />
              <Text style={styles.clockValue} numberOfLines={1} adjustsFontSizeToFit>PST {pstTime}</Text>
            </View>
          </View>

          {/* Greeting row + National Badge */}
          <View style={styles.greetingRow}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={styles.greetingTitle} numberOfLines={1} adjustsFontSizeToFit>
                {lang === 'ur' ? 'سلام، ' : 'Salaam, '}{citizenProfile?.name || 'Citizen'} 👋
              </Text>
              {phoneDisplay && (
                <Text style={styles.nodeIdText} numberOfLines={1} adjustsFontSizeToFit>
                  {lang === 'ur' ? 'شہری شناخت: ' : 'Citizen ID: '}{phoneDisplay}
                </Text>
              )}
            </View>

            <View style={styles.nationalBadge}>
              <View style={styles.badgeShield}>
                <LinearGradient
                  colors={['#065F46', '#047857']}
                  style={styles.badgeShieldInner}
                >
                  <Text style={styles.badgeShieldCrescent}>☪</Text>
                </LinearGradient>
              </View>
              <Text style={styles.nationalBadgeText} numberOfLines={1} adjustsFontSizeToFit>{t.portalBadge}</Text>
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
                <Text style={styles.telemetryLiveText} numberOfLines={1} adjustsFontSizeToFit>{t.liveMonitor}</Text>
              </View>
              <Text style={styles.systemStatusTag}>{t.online}</Text>
            </View>

            <View style={styles.telemetryGrid}>
              {/* Tap: red zones → map */}
              <TouchableOpacity
                style={styles.telemetryItem}
                onPress={() => handleTelemetryTap('zones')}
                activeOpacity={0.7}
              >
                <Text style={styles.telemetryLabel} numberOfLines={1} adjustsFontSizeToFit>{t.activeZones}</Text>
                <Text style={[styles.telemetryValue, { color: '#EF4444' }]} numberOfLines={1} adjustsFontSizeToFit>{t.areas}</Text>
                <Text style={styles.telemetryTapHint} numberOfLines={1} adjustsFontSizeToFit>{t.tapMap}</Text>
              </TouchableOpacity>

              <View style={styles.telemetryDivider} />

              {/* Tap: siren → alerts */}
              <TouchableOpacity
                style={styles.telemetryItem}
                onPress={() => handleTelemetryTap('siren')}
                activeOpacity={0.7}
              >
                <Text style={styles.telemetryLabel} numberOfLines={1} adjustsFontSizeToFit>{t.sirenAlerts}</Text>
                <Text style={[styles.telemetryValue, { color: '#EAB308' }]} numberOfLines={1} adjustsFontSizeToFit>{t.standby}</Text>
                <Text style={styles.telemetryTapHint} numberOfLines={1} adjustsFontSizeToFit>{t.tapAlerts}</Text>
              </TouchableOpacity>

              <View style={styles.telemetryDivider} />

              {/* Tap: reports count */}
              <TouchableOpacity
                style={styles.telemetryItem}
                onPress={() => handleTelemetryTap('reports')}
                activeOpacity={0.7}
              >
                <Text style={styles.telemetryLabel} numberOfLines={1} adjustsFontSizeToFit>{t.yourReports}</Text>
                <Text style={[styles.telemetryValue, { color: '#10B981' }]} numberOfLines={1} adjustsFontSizeToFit>{activeReportCount} {t.submitted}</Text>
                <Text style={styles.telemetryTapHint} numberOfLines={1} adjustsFontSizeToFit>{t.tapView}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── INSTANT SOS PANIC BUTTON CARD ── */}
          <View style={styles.telemetryCard}>
            <View style={styles.cardHeaderSmall}>
              <Text style={styles.cardHeaderTitle}>{t.sosTitle}</Text>
              <View style={[styles.urgentBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.urgentBadgeText}>{t.urgent}</Text>
              </View>
            </View>
            <Text style={styles.cardHeaderSubtitle}>{t.sosSub}</Text>

            <View style={styles.sosContainer}>
              {sosState === 'idle' && (
                <TouchableOpacity
                  style={styles.sosTriggerBtn}
                  onPress={triggerSOS}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.sosTriggerGradient}
                  >
                    <Text style={styles.sosTriggerText}>{t.sosTriggerBtn}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {sosState === 'counting' && (
                <View style={styles.sosCountingContainer}>
                  <Text style={styles.sosCountingLabel}>{t.sosCounting}</Text>
                  <Text style={styles.sosCountdownNumber}>{countdown}</Text>
                  <TouchableOpacity
                    style={styles.sosCancelBtn}
                    onPress={cancelSOS}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sosCancelBtnText}>{t.sosCancel}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {sosState === 'active' && (
                <View style={styles.sosActiveContainer}>
                  <Text style={styles.sosTransmittedText}>{t.sosTransmitted}</Text>
                  <Text style={styles.sosActiveDetails}>{t.sosSuccessDetails}</Text>
                  <View style={styles.sosMockTelemetryBox}>
                    <Text style={styles.sosTelemetryLine}>📍 GPS: 33.6844° N, 73.0479° E (Sector G-11, Islamabad)</Text>
                    <Text style={styles.sosTelemetryLine}>🔋 Battery: 84% | Status: Signal Active</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.sosCancelBtnActive}
                    onPress={cancelSOS}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sosCancelBtnTextActive}>{t.sosCancel}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* ── OFFLINE MESH BEACON CARD ── */}
          <View style={styles.telemetryCard}>
            <View style={styles.cardHeaderSmall}>
              <Text style={styles.cardHeaderTitle}>{t.meshTitle}</Text>
              <View style={[styles.systemStatusTag, { backgroundColor: meshActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)' }]}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: meshActive ? '#10B981' : '#64748B' }}>
                  {meshActive ? t.meshActive : t.meshInactive}
                </Text>
              </View>
            </View>
            <Text style={styles.cardHeaderSubtitle}>{t.meshSub}</Text>

            <View style={styles.meshContentRow}>
              {/* Radar Circle visual */}
              <View style={styles.radarContainer}>
                <View style={styles.radarBackgroundCircle}>
                  {meshActive && (
                    <>
                      <Animated.View style={[styles.radarRing, {
                        transform: [{
                          scale: radarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.1, 1.3]
                          })
                        }],
                        opacity: radarAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 0]
                        })
                      }]} />
                      <Animated.View style={[styles.radarSweep, {
                        transform: [{
                          rotate: radarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                          })
                        }]
                      }]}>
                        <View style={styles.radarSweepLine} />
                      </Animated.View>
                    </>
                  )}
                  <Text style={styles.radarCenterDot}>🛰️</Text>
                </View>
              </View>

              {/* Controls and peer info */}
              <View style={styles.meshControlsCol}>
                <TouchableOpacity
                  style={[styles.meshActionBtn, meshActive ? styles.meshActionBtnActive : styles.meshActionBtnInactive]}
                  onPress={() => setMeshActive(!meshActive)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.meshActionBtnText}>
                    {meshActive ? t.meshLeaveBtn : t.meshJoinBtn}
                  </Text>
                </TouchableOpacity>

                {meshActive && (
                  <View style={styles.meshStatusTextContainer}>
                    {scanning ? (
                      <Text style={styles.meshScanningText}>{t.meshScanning}</Text>
                    ) : (
                      <Text style={styles.meshConnectedText}>{t.meshConnectedPeers}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Peering Node List */}
            {meshActive && peers.length > 0 && (
              <View style={styles.peerListContainer}>
                <Text style={styles.peerListTitle}>{t.meshPeerLabel}</Text>
                {peers.map((peer, idx) => (
                  <View key={idx} style={styles.peerItemRow}>
                    <View style={styles.peerIconDot} />
                    <Text style={styles.peerNameText}>{peer.id}</Text>
                    <Text style={styles.peerDistanceText}>({peer.dist})</Text>
                    <View style={styles.peerSpacer} />
                    <Text style={styles.peerStatusText}>{peer.status}</Text>
                    <Text style={styles.peerBatText}>🔋 {peer.bat}</Text>
                  </View>
                ))}
              </View>
            )}
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
              <Text style={styles.broadcastTitle}>{t.liveBroadcast}</Text>
              <Text style={styles.broadcastSubtitle}>{t.broadcastNotice}</Text>
            </View>
            <View style={styles.broadcastBadge}>
              <Text style={styles.broadcastBadgeText}>{t.testSiren}</Text>
            </View>
          </TouchableOpacity>

          {/* ── ACTION PORTALS ── */}
          <Text style={styles.sectionHeader}>{t.primaryPortals}</Text>

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
                  <Text style={styles.gridCardTitle}>{t.reportFloodTitle}</Text>
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>{t.urgent}</Text>
                  </View>
                </View>
                <Text style={styles.gridCardSubtitle}>{t.reportFloodSub}</Text>
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
                <Text style={styles.gridCardTitle}>{t.mapTitle}</Text>
                <Text style={styles.gridCardSubtitle}>{t.mapSub}</Text>
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
                  <Text style={styles.gridCardTitle}>{t.alertsTitle}</Text>
                  <View style={[styles.urgentBadge, { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.urgentBadgeText}>{t.active}</Text>
                  </View>
                </View>
                <Text style={styles.gridCardSubtitle}>{t.alertsSub}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── EMERGENCY SPEED-DIAL ── */}
          <Text style={styles.sectionHeader}>{t.rescueLifelines}</Text>
          <View style={styles.lifelineDeck}>
            {DISPATCH_CALLS.map((call) => {
              const localized = getLocalizedCall(call);
              return (
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
                  <Text style={styles.lifelineLabel}>{localized.service}</Text>
                  <View style={styles.callSimBtn}>
                    <Text style={styles.callSimBtnText}>{t.callSim}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

        </Animated.View>
      </ScrollView>

      {/* ── DISPATCH MODAL ── */}
      <Modal transparent visible={!!dispatchCall} animationType="none" onRequestClose={closeDispatch}>
        {(() => {
          const activeCall = dispatchCall ? getLocalizedCall(dispatchCall) : null;
          return (
            <View style={styles.modalOverlay}>
              <Animated.View style={[styles.modalCard, { opacity: dispatchAnim, transform: [{ scale: dispatchAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
                <LinearGradient colors={['#020813', '#052A1D']} style={StyleSheet.absoluteFill} />

                <Text style={styles.modalIcon}>{activeCall?.icon}</Text>
                <Text style={styles.modalNumber}>{activeCall?.number}</Text>
                <Text style={styles.modalService}>{activeCall?.service}</Text>

                {dispatchPhase === 'dialing' ? (
                  <View style={styles.dialingContainer}>
                    <View style={styles.soundWaveContainer}>
                      <Animated.View style={[styles.soundWaveBar, { height: soundAnim1 }]} />
                      <Animated.View style={[styles.soundWaveBar, { height: soundAnim2 }]} />
                      <Animated.View style={[styles.soundWaveBar, { height: soundAnim3, backgroundColor: '#EF4444' }]} />
                      <Animated.View style={[styles.soundWaveBar, { height: soundAnim4 }]} />
                      <Animated.View style={[styles.soundWaveBar, { height: soundAnim5 }]} />
                    </View>
                    <View style={styles.dialingRow}>
                      <View style={styles.dialingDot} />
                      <Text style={styles.dialingText}>{t.dialingText} {activeCall?.number}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.confirmedBox}>
                    <Text style={styles.confirmedIcon}>✅</Text>
                    <Text style={styles.confirmedText}>{activeCall?.message}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDispatch}>
                  <Text style={styles.modalCloseBtnText}>{t.endSim}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        })()}
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
  nationalBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.16)', borderWidth: 0.5, borderColor: 'rgba(16,185,129,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.round },
  nationalBadgeText: { fontSize: 9, fontWeight: '800', color: '#34D399', letterSpacing: 0.5 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  greetingTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.1 },
  nodeIdText: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 2, opacity: 0.9 },

  // Scroll
  scrollDeck: { flex: 1 },
  scrollDeckContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: 60 },

  // Telemetry card
  telemetryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    marginBottom: Spacing.lg,
    ...Shadows.sm,
    shadowColor: '#10B981',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
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
  gridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.12)',
    ...Shadows.sm,
    shadowColor: '#10B981',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
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
  lifelineCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(16, 185, 129, 0.08)', borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, alignItems: 'center', ...Shadows.sm },
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
  dialingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dialingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EAB308', marginRight: 10 },
  dialingText: { fontSize: 14, color: '#FCD34D', fontWeight: '700' },
  confirmedBox: { alignItems: 'center', marginBottom: 24 },
  confirmedIcon: { fontSize: 32, marginBottom: 8 },
  confirmedText: { fontSize: 13, color: '#6EE7B7', fontWeight: '700', textAlign: 'center', lineHeight: 20 },
  modalCloseBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  modalCloseBtnText: { fontSize: 13, fontWeight: '700', color: '#E2E8F0' },

  // New layouts
  cardHeaderSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardHeaderTitle: { fontSize: Typography.sizes.md, fontWeight: '800', color: '#0F172A' },
  cardHeaderSubtitle: { fontSize: Typography.sizes.sm - 1, color: '#64748B', marginBottom: Spacing.md, lineHeight: 16 },

  sosContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.sm },
  sosTriggerBtn: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', ...Shadows.md, borderWidth: 4, borderColor: 'rgba(239, 68, 68, 0.2)' },
  sosTriggerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sosTriggerText: { color: '#FFFFFF', fontWeight: '900', fontSize: Typography.sizes.md, letterSpacing: 0.5, textAlign: 'center' },
  sosCountingContainer: { alignItems: 'center' },
  sosCountingLabel: { fontSize: Typography.sizes.md - 1, fontWeight: '700', color: '#64748B' },
  sosCountdownNumber: { fontSize: 44, fontWeight: '900', color: '#EF4444', marginVertical: Spacing.sm },
  sosCancelBtn: { backgroundColor: '#E2E8F0', paddingHorizontal: 20, paddingVertical: 8, borderRadius: BorderRadius.sm },
  sosCancelBtnText: { fontSize: Typography.sizes.sm - 1, fontWeight: '700', color: '#475569' },
  sosActiveContainer: { width: '100%', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: 'rgba(239, 68, 68, 0.2)' },
  sosTransmittedText: { fontSize: Typography.sizes.md - 1, fontWeight: '900', color: '#EF4444', marginBottom: 4 },
  sosActiveDetails: { fontSize: Typography.sizes.sm - 1, color: '#991B1B', textAlign: 'center', marginBottom: Spacing.md },
  sosMockTelemetryBox: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: BorderRadius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.15)', marginBottom: Spacing.md },
  sosTelemetryLine: { fontSize: 10, fontWeight: '700', color: '#EF4444', lineHeight: 14 },
  sosCancelBtnActive: { backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 8, borderRadius: BorderRadius.sm },
  sosCancelBtnTextActive: { fontSize: Typography.sizes.sm - 1, fontWeight: '700', color: '#FFFFFF' },

  meshContentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  radarContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  radarBackgroundCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  radarRing: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#10B981' },
  radarSweep: { position: 'absolute', width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  radarSweepLine: { width: 40, height: 2, backgroundColor: '#10B981', alignSelf: 'flex-end', opacity: 0.6 },
  radarCenterDot: { fontSize: 16, zIndex: 10 },
  meshControlsCol: { flex: 1 },
  meshActionBtn: { height: 40, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center', ...Shadows.sm },
  meshActionBtnInactive: { backgroundColor: '#10B981' },
  meshActionBtnActive: { backgroundColor: '#64748B' },
  meshActionBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: Typography.sizes.sm },
  meshStatusTextContainer: { marginTop: Spacing.sm },
  meshScanningText: { fontSize: 10, color: '#D97706', fontWeight: '700' },
  meshConnectedText: { fontSize: 10, color: '#10B981', fontWeight: '800' },
  peerListContainer: { marginTop: Spacing.md, backgroundColor: '#F8FAFC', borderRadius: BorderRadius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: '#E2E8F0' },
  peerListTitle: { fontSize: 9, fontWeight: '800', color: '#64748B', marginBottom: Spacing.xs },
  peerItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' },
  peerIconDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  peerNameText: { fontSize: 10, fontWeight: '800', color: '#334155' },
  peerDistanceText: { fontSize: 9, color: '#64748B', marginLeft: 4 },
  peerSpacer: { flex: 1 },
  peerStatusText: { fontSize: 8, fontWeight: '800', color: '#10B981', marginRight: Spacing.sm },
  peerBatText: { fontSize: 9, color: '#475569' },

  dialingContainer: { alignItems: 'center', marginBottom: 16 },
  soundWaveContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 60, width: '100%', marginBottom: Spacing.sm },
  soundWaveBar: { width: 6, borderRadius: 3, backgroundColor: '#10B981' },

  langToggleContainer: { flexDirection: 'row', gap: 2, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: BorderRadius.round, padding: 2 },
  langToggleBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.round, alignItems: 'center' },
  langToggleActive: { backgroundColor: '#10B981' },
  langToggleText: { fontSize: 8, fontWeight: '800', color: '#CBD5E1' },
  langToggleTextActive: { color: '#FFFFFF' },

  badgeShield: { width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', marginRight: 6 },
  badgeShieldInner: { width: 12, height: 12, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  badgeShieldCrescent: { fontSize: 8, color: '#FFFFFF', marginTop: -2, fontWeight: 'bold' },
});
