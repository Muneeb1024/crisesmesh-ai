/**
 * CrisesMesh AI — World Class Landing Screen
 * Designed for visual excellence with glassmorphism, 
 * Pakistani national protector emerald/slate gradient, 
 * tactical telemetry heartbeat widget, and premium micro-animations.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';
import { checkHealth, listIncidents, listReports } from '../services/api';

const { width, height } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

const TRANSLATIONS = {
  en: {
    subtitle: 'Unified Crisis Command & Safety Portal',
    portalSelection: 'PORTAL SELECTION',
    citizenTitle: 'Citizen Portal',
    citizenSub: 'Report emergencies & navigate safety routes',
    citizenPill1: '🌊 Report Flood',
    citizenPill2: '🎙️ Voice Report',
    citizenPill3: '🗺️ Live Red Zone Map',
    govTitle: 'Command Center',
    govSub: 'Authorized emergency responders deck',
    govPill1: '⚡ Signal Fusion',
    govPill2: '🔄 Reroute Sim',
    govPill3: '🚨 Dispatch Control',
    footerBrand: '🇵🇰 NATIONAL EMPOWERMENT SAFETY INITIATIVE',
    footerGrid: 'Pakistan National Emergency Grid',
    syncStatus: 'Sync status',
    activeSignals: 'Active Signals',
    threatIndex: 'Threat Index',
    connecting: 'CONNECTING',
    online: 'ONLINE',
    offline: 'OFFLINE',
    unavailable: 'UNAVAILABLE',
    nationalTicker: '🚨 NATIONAL EMERGENCY GRID HOTLINES: RESCUE (1122) • POLICE (15) • FIRE BRIGADE (16) • NDMA COORDINATION CELL: ACTIVE • DUAL BILINGUAL SYSTEM ONLINE',
  },
  ur: {
    subtitle: 'متحدہ بحران کمانڈ اور حفاظتی پورٹل',
    portalSelection: 'پورٹل کا انتخاب',
    citizenTitle: 'عوامی پورٹل (Citizen Portal)',
    citizenSub: 'ایمرجنسی رپورٹ کریں اور محفوظ راستے تلاش کریں',
    citizenPill1: '🌊 رپورٹ فلڈ',
    citizenPill2: '🎙️ وائس رپورٹ',
    citizenPill3: '🗺️ لائیو ریڈ زون میپ',
    govTitle: 'کمانڈ سینٹر (Command Center)',
    govSub: 'مجاز ہنگامی عملے کا کنٹرول روم',
    govPill1: '⚡ سگنل فیوژن',
    govPill2: '🔄 ری روٹ سمولیشن',
    govPill3: '🚨 ڈسپیچ کنٹرول',
    footerBrand: '🇵🇰 قومی بحران اور ایمرجنسی نیٹ ورک',
    footerGrid: 'پاکستان نیشنل ایمرجنسی گرڈ',
    syncStatus: 'رابطہ کی صورتحال',
    activeSignals: 'فعال سگنلز',
    threatIndex: 'خطرہ کی سطح',
    connecting: 'رابطہ ہو رہا ہے',
    online: 'آن لائن',
    offline: 'آف لائن',
    unavailable: 'دستیاب نہیں',
    nationalTicker: '🚨 قومی ایمرجنسی ہاٹ لائنز: ریسکیو (1122) • پولیس (15) • فائر بریگیڈ (16) • این ڈی ایم اے سیل: فعال • سمارٹ گرڈ چالو',
  }
};

const REGIONS = [
  { id: 'all', nameEN: 'All Pakistan', nameUR: 'پورا پاکستان', activeNodes: 28, threatLevel: 'ELEVATED' },
  { id: 'isb', nameEN: 'Islamabad', nameUR: 'اسلام آباد', activeNodes: 4, threatLevel: 'MODERATE' },
  { id: 'pun', nameEN: 'Punjab', nameUR: 'پنجاب', activeNodes: 12, threatLevel: 'CRITICAL' },
  { id: 'snd', nameEN: 'Sindh', nameUR: 'سندھ', activeNodes: 8, threatLevel: 'HIGH' },
  { id: 'kpk', nameEN: 'KPK', nameUR: 'خیبر پختونخوا', activeNodes: 3, threatLevel: 'LOW' },
  { id: 'bal', nameEN: 'Balochistan', nameUR: 'بلوچستان', activeNodes: 1, threatLevel: 'STABLE' },
  { id: 'ajk_gb', nameEN: 'AJK & GB', nameUR: 'آزاد کشمیر اور گلگت', activeNodes: 0, threatLevel: 'STABLE' },
];

export default function LandingScreen() {
  const navigation = useNavigation<NavProp>();
  const setRole = useAppStore((s) => s.setRole);

  // Localization & Region State
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'isb' | 'pun' | 'snd' | 'kpk' | 'bal' | 'ajk_gb'>('isb'); // Default to Islamabad demo

  // Telemetry State
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [activeNodes, setActiveNodes] = useState<number>(7); // Fallback mock value
  const [threatLevel, setThreatLevel] = useState<string>('MODERATE'); // Fallback mock value

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const laserAnim = useRef(new Animated.Value(0)).current;
  const isOnlinePulse = useRef(new Animated.Value(1)).current;
  const tickerTranslation = useRef(new Animated.Value(width)).current;

  // Interaction spring scales
  const citizenCardScale = useRef(new Animated.Value(1)).current;
  const govCardScale = useRef(new Animated.Value(1)).current;

  // Floating background particle animations
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 35,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo glow & buttons breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loop for sync status text warning pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(isOnlinePulse, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(isOnlinePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle rotation loop for holographic scanner ring
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
    ).start();

    // Looping laser sweeping animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background particles floating loops
    const runFloat = (anim: Animated.Value, duration: number, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    runFloat(floatAnim1, 8000, 0);
    runFloat(floatAnim2, 11000, 1000);
    runFloat(floatAnim3, 13000, 500);

    // Active Telemetry Polling
    const fetchTelemetry = async () => {
      try {
        const health = await checkHealth();
        if (health && health.status === 'ok') {
          setIsOnline(true);

          const incidents = await listIncidents();
          const reports = await listReports();
          
          const totalNodes = (incidents?.length || 0) + (reports?.length || 0);
          setActiveNodes(totalNodes);

          if (!incidents || incidents.length === 0) {
            setThreatLevel('STABLE');
          } else {
            let maxSeverity = 'Low';
            const severityOrder = { 'Low': 0, 'Medium': 1, 'High': 2, 'Critical': 3 };
            
            incidents.forEach(inc => {
              const currentSev = inc.severity || 'Low';
              const currentOrder = severityOrder[currentSev as keyof typeof severityOrder] ?? 0;
              const maxOrder = severityOrder[maxSeverity as keyof typeof severityOrder] ?? 0;
              if (currentOrder > maxOrder) {
                maxSeverity = currentSev;
              }
            });

            if (maxSeverity === 'Critical') setThreatLevel('CRITICAL');
            else if (maxSeverity === 'High') setThreatLevel('ELEVATED');
            else if (maxSeverity === 'Medium') setThreatLevel('MODERATE');
            else setThreatLevel('LOW');
          }
        } else {
          setIsOnline(false);
        }
      } catch (err) {
        setIsOnline(false);
      }
    };

    fetchTelemetry();
    const pollInterval = setInterval(fetchTelemetry, 10000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Scrolling ticker loop
  useEffect(() => {
    tickerTranslation.setValue(width);
    const anim = Animated.loop(
      Animated.timing(tickerTranslation, {
        toValue: -width - 400,
        duration: 16000,
        useNativeDriver: true,
        isInteraction: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [lang]);

  // Dynamic telemetry calculations
  const currentRegionData = REGIONS.find(r => r.id === selectedRegion);
  const totalMockOtherRegions = REGIONS.filter(r => r.id !== 'isb').reduce((acc, r) => acc + r.activeNodes, 0);
  const displayActiveNodes = selectedRegion === 'all'
    ? (isOnline ? activeNodes + totalMockOtherRegions : totalMockOtherRegions)
    : selectedRegion === 'isb' && isOnline
      ? activeNodes
      : (currentRegionData?.activeNodes ?? 0);

  const displayThreatLevel = selectedRegion === 'isb' && isOnline
    ? threatLevel
    : (currentRegionData?.threatLevel ?? 'STABLE');

  const handleCitizen = () => {
    setRole('citizen');
    navigation.navigate('CitizenOnboarding');
  };

  const handleGovernment = () => {
    setRole('government');
    navigation.navigate('GovernmentPin');
  };

  const handlePressIn = (scaleVar: Animated.Value) => {
    Animated.spring(scaleVar, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  const handlePressOut = (scaleVar: Animated.Value) => {
    Animated.spring(scaleVar, {
      toValue: 1.0,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  // Interpolate rotation for high-tech ring scanner
  const rotateStr = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Interpolate floating coordinates
  const floatY1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });
  const floatX1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [-10, 15] });

  const floatY2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [25, -25] });
  const floatX2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [15, -15] });

  const floatY3 = floatAnim3.interpolate({ inputRange: [0, 1], outputRange: [-30, 30] });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return Colors.danger;
      case 'ELEVATED': return Colors.accent;
      case 'MODERATE': return Colors.warning;
      case 'LOW': return Colors.success;
      case 'STABLE': return Colors.primary;
      default: return '#94A3B8';
    }
  };  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020813" />
      
      {/* World-Class Pakistan Emerald Protector Gradient Background */}
      <LinearGradient
        colors={['#020813', '#052A1D', '#020813']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Animated Mesh Particles */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatOrb,
          styles.orbEmerald,
          { transform: [{ translateY: floatY1 }, { translateX: floatX1 }] },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatOrb,
          styles.orbSky,
          { transform: [{ translateY: floatY2 }, { translateX: floatX2 }] },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatOrb,
          styles.orbMint,
          { transform: [{ translateY: floatY3 }] },
        ]}
      />

      <View pointerEvents="none" style={styles.gridOverlay} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header language selector */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.langToggle}
            onPress={() => setLang(lang === 'en' ? 'ur' : 'en')}
            activeOpacity={0.8}
          >
            <Text style={styles.langToggleText}>
              {lang === 'en' ? 'اردو' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Holographic Radar Scanner Badge & Protective Shield */}
        <View style={styles.logoBadgeContainer}>
          <Animated.View
            style={[
              styles.radarScannerRing,
              { transform: [{ rotate: rotateStr }, { scale: pulseAnim }] },
            ]}
          />
          
          <Animated.View
            style={[
              styles.shieldWrapper,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <LinearGradient
              colors={['#0F2F21', '#021810']}
              style={styles.shieldGradient}
            >
              {/* Outer cybernetic rings */}
              <View style={styles.shieldRing1} />
              <View style={styles.shieldRing2} />
              
              {/* Glowing Pakistan Crescent and Star Emblem */}
              <Text style={styles.shieldCrescentStar}>☪</Text>
              
              {/* Green tactical dot */}
              <View style={styles.tacticalDot} />
            </LinearGradient>
            <View style={styles.logoCoreGlow} />
          </Animated.View>

          {/* Sweeping Laser Line */}
          <Animated.View
            style={[
              styles.laserLine,
              {
                transform: [
                  {
                    translateY: laserAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 130],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        {/* Title Deck */}
        <View style={styles.titleBlock}>
          <Text style={styles.appName}>CrisesMesh <Text style={styles.highlightText}>AI</Text></Text>
          <Text style={styles.tagline}>{TRANSLATIONS[lang].subtitle}</Text>
        </View>

        {/* Region selector */}
        <View style={styles.regionSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionScrollContent}>
            {REGIONS.map((region) => {
              const isSelected = selectedRegion === region.id;
              return (
                <TouchableOpacity
                  key={region.id}
                  style={[
                    styles.regionPill,
                    isSelected && styles.regionPillSelected
                  ]}
                  onPress={() => setSelectedRegion(region.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.regionPillText,
                    isSelected && styles.regionPillTextSelected
                  ]}>
                    {lang === 'en' ? region.nameEN : region.nameUR}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Real-time Tactical Heartbeat Widget (Dashboard Feel) */}
        <View style={styles.tacticalWidget}>
          <View style={styles.tacticalHeader}>
            <Animated.View
              style={[
                styles.heartbeatOuter,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.heartbeatInner} />
            </Animated.View>
            <Text style={styles.tacticalTitle}>
              {`${(currentRegionData ? (lang === 'en' ? currentRegionData.nameEN : currentRegionData.nameUR) : 'PAKISTAN').toUpperCase()} EMERGENCY TELEMETRY`}
            </Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>{TRANSLATIONS[lang].syncStatus}</Text>
              {isOnline === null ? (
                <Animated.Text style={[styles.statVal, { color: Colors.warning, opacity: isOnlinePulse }]}>
                  {TRANSLATIONS[lang].connecting}
                </Animated.Text>
              ) : isOnline ? (
                <Text style={[styles.statVal, { color: Colors.primary }]}>
                  {TRANSLATIONS[lang].online}
                </Text>
              ) : (
                <Animated.Text style={[styles.statVal, { color: Colors.danger, opacity: isOnlinePulse }]}>
                  {TRANSLATIONS[lang].offline}
                </Animated.Text>
              )}
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>{TRANSLATIONS[lang].activeSignals}</Text>
              <Text style={styles.statVal}>
                {displayActiveNodes} NODES
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>{TRANSLATIONS[lang].threatIndex}</Text>
              <Text style={[styles.statVal, { color: getThreatColor(displayThreatLevel) }]}>
                {displayThreatLevel}
              </Text>
            </View>
          </View>
        </View>

        {/* Scrolling National Marquee Ticker */}
        <View style={styles.tickerContainer}>
          <Animated.View style={[styles.tickerWrapper, { transform: [{ translateX: tickerTranslation }] }]}>
            <Text style={styles.tickerText}>{TRANSLATIONS[lang].nationalTicker}</Text>
          </Animated.View>
        </View>

        {/* Action Panel Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.lineSpacer} />
          <Text style={styles.dividerLabel}>{TRANSLATIONS[lang].portalSelection}</Text>
          <View style={styles.lineSpacer} />
        </View>

        {/* Glassmorphic Interaction Cards */}
        <Animated.View
          style={[
            styles.cardsContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Card 1: Citizen Safety Portal */}
          <Animated.View style={{ transform: [{ scale: citizenCardScale }], width: '100%' }}>
            <TouchableOpacity
              style={styles.portalCardCitizen}
              onPress={handleCitizen}
              onPressIn={() => handlePressIn(citizenCardScale)}
              onPressOut={() => handlePressOut(citizenCardScale)}
              activeOpacity={0.92}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 95, 70, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradientInner}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircleCitizen}>
                    <Text style={styles.cardIcon}>👤</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardTitle}>{TRANSLATIONS[lang].citizenTitle}</Text>
                    <Text style={styles.cardSub}>{TRANSLATIONS[lang].citizenSub}</Text>
                  </View>
                  <Text style={styles.cardArrow}>🡪</Text>
                </View>

                {/* In-Card Feature Pill list */}
                <View style={styles.featurePillRow}>
                  <View style={[styles.miniPill, styles.pillEmerald]}>
                    <Text style={styles.miniPillText}>{TRANSLATIONS[lang].citizenPill1}</Text>
                  </View>
                  <View style={[styles.miniPill, styles.pillEmerald]}>
                    <Text style={styles.miniPillText}>{TRANSLATIONS[lang].citizenPill2}</Text>
                  </View>
                  <View style={[styles.miniPill, styles.pillEmerald]}>
                    <Text style={styles.miniPillText}>{TRANSLATIONS[lang].citizenPill3}</Text>
                  </View>
                </View>
              </LinearGradient>
              {/* Emerald neon border indicator */}
              <View style={styles.emeraldBorderIndicator} />
            </TouchableOpacity>
          </Animated.View>

          {/* Card 2: Government Command Center */}
          <Animated.View style={{ transform: [{ scale: govCardScale }], width: '100%' }}>
            <TouchableOpacity
              style={styles.portalCardGov}
              onPress={handleGovernment}
              onPressIn={() => handlePressIn(govCardScale)}
              onPressOut={() => handlePressOut(govCardScale)}
              activeOpacity={0.92}
            >
              <LinearGradient
                colors={['rgba(14, 165, 233, 0.15)', 'rgba(30, 58, 95, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradientInner}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircleGov}>
                    <Text style={styles.cardIcon}>🏛️</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardTitle}>{TRANSLATIONS[lang].govTitle}</Text>
                    <Text style={styles.cardSub}>{TRANSLATIONS[lang].govSub}</Text>
                  </View>
                  <Text style={styles.cardArrow}>🡪</Text>
                </View>

                {/* In-Card Feature Pill list */}
                <View style={styles.featurePillRow}>
                  <View style={[styles.miniPill, styles.pillSky]}>
                    <Text style={styles.miniPillText}>{TRANSLATIONS[lang].govPill1}</Text>
                  </View>
                  <View style={[styles.miniPill, styles.pillSky]}>
                    <Text style={styles.miniPillText}>{TRANSLATIONS[lang].govPill2}</Text>
                  </View>
                  <View style={[styles.miniPill, styles.pillSky]}>
                    <Text style={styles.miniPillText}>{TRANSLATIONS[lang].govPill3}</Text>
                  </View>
                </View>
              </LinearGradient>
              {/* Sky blue neon border indicator */}
              <View style={styles.skyBorderIndicator} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Premium footer */}
        <View style={styles.footerDeck}>
          <Text style={styles.footerBrand}>{TRANSLATIONS[lang].footerBrand}</Text>
          <Text style={styles.footerDetails}>{TRANSLATIONS[lang].footerGrid} (Demo: Islamabad)</Text>
        </View>

      </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020813',
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    zIndex: 5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    marginTop: 15,
    marginBottom: 5,
  },
  langToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  langToggleText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
  },
  regionSelectorContainer: {
    width: '100%',
    marginBottom: Spacing.md,
    height: 38,
  },
  regionScrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: 8,
    alignItems: 'center',
  },
  regionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  regionPillSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10B981',
  },
  regionPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  regionPillTextSelected: {
    color: '#10B981',
    fontWeight: '800',
  },
  tickerContainer: {
    width: '100%',
    backgroundColor: 'rgba(2, 8, 19, 0.8)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 6,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  tickerWrapper: {
    flexDirection: 'row',
  },
  tickerText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  floatOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.14,
    zIndex: 0,
  },
  orbEmerald: {
    width: 250,
    height: 250,
    backgroundColor: '#10B981',
    top: height * 0.15,
    left: -50,
  },
  orbSky: {
    width: 280,
    height: 280,
    backgroundColor: '#0EA5E9',
    bottom: height * 0.2,
    right: -80,
  },
  orbMint: {
    width: 200,
    height: 200,
    backgroundColor: '#34D399',
    top: -50,
    right: 50,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 0,
    zIndex: 1,
    opacity: 0.03,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    zIndex: 2,
  },
  logoBadgeContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    position: 'relative',
  },
  radarScannerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderStyle: 'dashed',
  },
  shieldWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  shieldGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  shieldRing1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderStyle: 'dashed',
  },
  shieldRing2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  shieldCrescentStar: {
    fontSize: 44,
    color: '#F8FAFC',
    textShadowColor: 'rgba(16, 185, 129, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginTop: -4,
  },
  tacticalDot: {
    position: 'absolute',
    bottom: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  logoCoreGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    zIndex: -1,
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
    opacity: 0.75,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  highlightText: {
    color: '#10B981',
  },
  tagline: {
    fontSize: Typography.sizes.md,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  tacticalWidget: {
    width: '100%',
    backgroundColor: 'rgba(13, 27, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  tacticalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heartbeatOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  heartbeatInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  tacticalTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 4,
  },
  statPill: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statVal: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
    color: '#E2E8F0',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  lineSpacer: {
    flex: 1,
    height: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginHorizontal: Spacing.md,
  },
  cardsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  portalCardCitizen: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    overflow: 'hidden',
    ...Shadows.md,
  },
  portalCardGov: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.25)',
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardGradientInner: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircleCitizen: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  iconCircleGov: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  cardIcon: {
    fontSize: 22,
  },
  cardMeta: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardSub: {
    fontSize: Typography.sizes.xs,
    color: '#94A3B8',
    marginTop: 3,
    lineHeight: 15,
  },
  cardArrow: {
    fontSize: Typography.sizes.xl,
    color: '#64748B',
    fontWeight: '800',
  },
  featurePillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: Spacing.sm,
  },
  miniPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
  },
  pillEmerald: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  pillSky: {
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  miniPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.3,
  },
  emeraldBorderIndicator: {
    height: 3,
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  skyBorderIndicator: {
    height: 3,
    backgroundColor: '#0EA5E9',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerDeck: {
    marginTop: 40,
    marginBottom: 10,
    alignItems: 'center',
  },
  footerBrand: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(16, 185, 129, 0.7)',
    letterSpacing: 1.8,
  },
  footerDetails: {
    fontSize: Typography.sizes.xs,
    color: '#475569',
    marginTop: 5,
    fontWeight: '500',
  },
});

