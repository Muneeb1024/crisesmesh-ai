/**
 * CrisesMesh AI — World Class Landing Screen
 * Designed for visual excellence with glassmorphism, 
 * Pakistani national protector emerald/slate gradient, 
 * tactical telemetry heartbeat widget, and premium micro-animations.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

export default function LandingScreen() {
  const navigation = useNavigation<NavProp>();
  const setRole = useAppStore((s) => s.setRole);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

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

    // Subtle rotation loop for holographic scanner ring
    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 25000,
        useNativeDriver: true,
      })
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
  }, []);

  const handleCitizen = () => {
    setRole('citizen');
    navigation.navigate('CitizenOnboarding');
  };

  const handleGovernment = () => {
    setRole('government');
    navigation.navigate('GovernmentPin');
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

  return (
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
        style={[
          styles.floatOrb,
          styles.orbEmerald,
          { transform: [{ translateY: floatY1 }, { translateX: floatX1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.floatOrb,
          styles.orbSky,
          { transform: [{ translateY: floatY2 }, { translateX: floatX2 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.floatOrb,
          styles.orbMint,
          { transform: [{ translateY: floatY3 }] },
        ]}
      />

      {/* Subtle Gridlines overlay */}
      <View style={styles.gridOverlay} />

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
              colors={['#10B981', '#065F46']}
              style={styles.shieldGradient}
            >
              <Text style={styles.shieldIcon}>🇵🇰</Text>
            </LinearGradient>
            <View style={styles.logoCoreGlow} />
          </Animated.View>
        </View>

        {/* Title Deck */}
        <View style={styles.titleBlock}>
          <Text style={styles.appName}>CrisesMesh <Text style={styles.highlightText}>AI</Text></Text>
          <Text style={styles.tagline}>Unified Crisis Command & Safety Portal</Text>
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
            <Text style={styles.tacticalTitle}>ISLAMABAD CRISIS TELEMETRY</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Sync status</Text>
              <Text style={styles.statVal}>ONLINE</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Active Signals</Text>
              <Text style={styles.statVal}>7 NODES</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statPill}>
              <Text style={styles.statLabel}>Threat Index</Text>
              <Text style={[styles.statVal, { color: '#EAB308' }]}>MODERATE</Text>
            </View>
          </View>
        </View>

        {/* Action Panel Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.lineSpacer} />
          <Text style={styles.dividerLabel}>PORTAL SELECTION</Text>
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
          <TouchableOpacity
            style={styles.portalCardCitizen}
            onPress={handleCitizen}
            activeOpacity={0.88}
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
                  <Text style={styles.cardTitle}>Citizen Portal</Text>
                  <Text style={styles.cardSub}>Report emergencies & navigate safety routes</Text>
                </View>
                <Text style={styles.cardArrow}>🡪</Text>
              </View>

              {/* In-Card Feature Pill list */}
              <View style={styles.featurePillRow}>
                <View style={[styles.miniPill, styles.pillEmerald]}>
                  <Text style={styles.miniPillText}>🌊 Report Flood</Text>
                </View>
                <View style={[styles.miniPill, styles.pillEmerald]}>
                  <Text style={styles.miniPillText}>🎙️ Voice Report</Text>
                </View>
                <View style={[styles.miniPill, styles.pillEmerald]}>
                  <Text style={styles.miniPillText}>🗺️ Live Red Zone Map</Text>
                </View>
              </View>
            </LinearGradient>
            {/* Emerald neon border indicator */}
            <View style={styles.emeraldBorderIndicator} />
          </TouchableOpacity>

          {/* Card 2: Government Command Center */}
          <TouchableOpacity
            style={styles.portalCardGov}
            onPress={handleGovernment}
            activeOpacity={0.88}
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
                  <Text style={styles.cardTitle}>Command Center</Text>
                  <Text style={styles.cardSub}>🔒 Authorized emergency responders deck</Text>
                </View>
                <Text style={styles.cardArrow}>🡪</Text>
              </View>

              {/* In-Card Feature Pill list */}
              <View style={styles.featurePillRow}>
                <View style={[styles.miniPill, styles.pillSky]}>
                  <Text style={styles.miniPillText}>⚡ Signal Fusion</Text>
                </View>
                <View style={[styles.miniPill, styles.pillSky]}>
                  <Text style={styles.miniPillText}>🔄 Reroute Sim</Text>
                </View>
                <View style={[styles.miniPill, styles.pillSky]}>
                  <Text style={styles.miniPillText}>🚨 Dispatch Control</Text>
                </View>
              </View>
            </LinearGradient>
            {/* Sky blue neon border indicator */}
            <View style={styles.skyBorderIndicator} />
          </TouchableOpacity>
        </Animated.View>

        {/* Premium footer */}
        <View style={styles.footerDeck}>
          <Text style={styles.footerBrand}>🇵🇰 NATIONAL EMPOWERMENT SAFETY INITIATIVE</Text>
          <Text style={styles.footerDetails}>CrisesMesh AI • Rawalpindi & Islamabad Grid</Text>
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020813',
  },
  floatOrb: {
    position: 'absolute',
    borderRadius: 999,
    filter: 'blur(60px)',
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
    flex: 1,
    justifyContent: 'center',
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
    width: 86,
    height: 86,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Shadows.lg,
  },
  shieldIcon: {
    fontSize: 42,
  },
  logoCoreGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    zIndex: -1,
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
