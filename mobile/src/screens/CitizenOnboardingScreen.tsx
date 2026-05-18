/**
 * CrisesMesh AI — Polished Citizen Onboarding Screen (Single-Step Demo Optimized)
 * Optimized for lightning-fast judge demo. Eliminates multi-step OTP friction 
 * and resets default web focus outlines for an exceptionally clean, premium input.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CitizenOnboarding'>;

export default function CitizenOnboardingScreen() {
  const navigation = useNavigation<NavProp>();
  const setCitizenProfile = useAppStore((s) => s.setCitizenProfile);

  // States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  // Focus States for glowing inputs
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Initial fade & slide in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateDetails = () => {
    const e: { name?: string; phone?: string } = {};
    if (!name.trim()) e.name = 'Full Name is required to register';
    if (!phone.trim()) e.phone = 'Phone number is required for alert routing';
    else if (phone.replace(/\D/g, '').length < 9) {
      e.phone = 'Please enter a valid Pakistani mobile number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validateDetails()) return;

    // Save profile and immediately navigate to CitizenHome
    setCitizenProfile({ name: name.trim(), phone: phone.trim() });
    navigation.navigate('CitizenHome');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F4FBF7" />

      {/* Clean Pakistani soft emerald-teal gradient background */}
      <LinearGradient
        colors={['#E6F4EA', '#F8FAFC']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Top Left Ambient Wave */}
      <View style={styles.ambientWave} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.cardContainer}>
          {/* Header Block */}
          <View style={styles.header}>
            <View style={styles.welcomePill}>
              <Text style={styles.welcomePillText}>🇵🇰 SECURE PUBLIC ACCESS</Text>
            </View>
            <Text style={styles.headerTitle}>Welcome, Citizen</Text>
            <Text style={styles.headerUrdu}>خوش آمدید — پاکستان کا اپنا پورٹل</Text>
            <Text style={styles.headerSubtitle}>
              Register your name and contact to submit active flood telemetry and coordinate localized emergency alerts.
            </Text>
          </View>

          {/* Inputs Glass Block */}
          <View style={styles.formContainer}>
            {/* Full Name input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name (پورا نام)</Text>
              <View
                style={[
                  styles.inputFieldContainer,
                  nameFocused && styles.inputFocused,
                  errors.name && styles.inputError,
                ]}
              >
                <Text style={styles.fieldIcon}>👤</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Ali Khan"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Phone number input with country flag */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (موبائل نمبر)</Text>
              <View
                style={[
                  styles.inputFieldContainer,
                  phoneFocused && styles.inputFocused,
                  errors.phone && styles.inputError,
                ]}
              >
                <View style={styles.countryPicker}>
                  <Text style={styles.flagEmoji}>🇵🇰</Text>
                  <Text style={styles.countryCode}>+92</Text>
                  <View style={styles.countryDivider} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="300 1234567"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  keyboardType="phone-pad"
                />
              </View>
              <Text style={styles.hintText}>Active alerts will target this phone index.</Text>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!name.trim() || !phone.trim()) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue to Dashboard →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer info banner */}
        <View style={styles.footerDeck}>
          <Text style={styles.disclaimerText}>🔒 Sandboxed Local MVP Mode. Details are stored locally on your device.</Text>
        </View>

      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  ambientWave: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(16, 185, 129, 0.07)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  welcomePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.md,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  welcomePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl + 4,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  headerUrdu: {
    fontSize: Typography.sizes.md,
    color: '#059669',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md - 1,
    color: '#475569',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  formContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  inputGroup: {},
  label: {
    fontSize: Typography.sizes.md - 1,
    fontWeight: '700',
    color: '#334155',
    marginBottom: Spacing.sm,
    letterSpacing: 0.2,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 56,
    ...Shadows.sm,
  },
  inputFocused: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  fieldIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    color: '#0F172A',
    fontWeight: '600',
    paddingVertical: 10,
    // Reset focus outlines completely for clean web display
    outlineStyle: 'none' as any,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 22,
  },
  countryCode: {
    fontSize: Typography.sizes.lg - 1,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 6,
  },
  countryDivider: {
    width: 1.2,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  hintText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.danger,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  buttonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  
  footerDeck: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
});
