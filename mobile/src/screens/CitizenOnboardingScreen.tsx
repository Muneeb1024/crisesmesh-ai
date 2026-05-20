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

const LOCALIZATION = {
  en: {
    secureAccess: 'SECURE PUBLIC ACCESS',
    welcome: 'Welcome, Citizen',
    subtitle: 'Register your name and contact to submit active flood telemetry and coordinate localized emergency alerts.',
    nameLabel: 'Full Name',
    phoneLabel: 'Phone Number',
    namePlaceholder: 'e.g. Ali Khan',
    phonePlaceholder: '300 1234567',
    hintText: 'Active alerts will target this phone index.',
    continueBtn: 'Continue to Dashboard →',
    nameRequired: 'Full Name is required to register',
    phoneRequired: 'Phone number is required for alert routing',
    phoneInvalid: 'Please enter a valid Pakistani mobile number',
    autofillLabel: '⚡ QUICK DEMO AUTOFILL',
    disclaimer: '🔒 Sandboxed Local MVP Mode. Details are stored locally on your device.',
  },
  ur: {
    secureAccess: 'محفوظ عوامی رسائی',
    welcome: 'خوش آمدید، شہری',
    subtitle: 'فعال سیلاب کی معلومات جمع کرانے اور مقامی ہنگامی الرٹس کو مربوط کرنے کے لیے اپنا نام اور رابطہ درج کریں۔',
    nameLabel: 'پورا نام',
    phoneLabel: 'موبائل نمبر',
    namePlaceholder: 'مثال کے طور پر: علی خان',
    phonePlaceholder: '300 1234567',
    hintText: 'سرگرم الرٹس اس فون نمبر کو ہدف بنائیں گے۔',
    continueBtn: 'ڈیش بورڈ پر جائیں ←',
    nameRequired: 'رجسٹریشن کے لیے پورا نام درکار ہے',
    phoneRequired: 'الرٹ بھیجنے کے لیے فون نمبر درکار ہے',
    phoneInvalid: 'براہ کرم درست پاکستانی موبائل نمبر درج کریں',
    autofillLabel: '⚡ فوری ڈیمو آٹو فل',
    disclaimer: '🔒 مقامی ٹیسٹ موڈ۔ معلومات صرف آپ کے آلے پر محفوظ ہیں۔',
  }
};

export default function CitizenOnboardingScreen() {
  const navigation = useNavigation<NavProp>();
  const setCitizenProfile = useAppStore((s) => s.setCitizenProfile);

  // States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);

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

  const t = LOCALIZATION[lang];

  const validateDetails = () => {
    const e: { name?: string; phone?: string } = {};
    if (!name.trim()) e.name = t.nameRequired;
    if (!phone.trim()) e.phone = t.phoneRequired;
    else if (phone.replace(/\D/g, '').length < 9) {
      e.phone = t.phoneInvalid;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAutofill = () => {
    setName('Ali Khan');
    setPhone('3001234567');
    setErrors({});
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
          {/* Header Block with Language Toggle */}
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <View style={styles.welcomePill}>
                <View style={styles.badgeShield}>
                  <LinearGradient
                    colors={['#065F46', '#047857']}
                    style={styles.badgeShieldInner}
                  >
                    <Text style={styles.badgeShieldCrescent}>☪</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.welcomePillText}>{t.secureAccess}</Text>
              </View>
            </View>

            {/* Premium Language Toggle Switcher */}
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
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t.welcome}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
            
            {/* Quick Demo Autofill Button for presentation */}
            <TouchableOpacity
              style={styles.autofillBtn}
              onPress={handleAutofill}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.autofillGradient}
              >
                <Text style={styles.autofillText}>{t.autofillLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Inputs Glass Block */}
          <View style={styles.formContainer}>
            {/* Full Name input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.nameLabel}</Text>
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
                  placeholder={t.namePlaceholder}
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
              <Text style={styles.label}>{t.phoneLabel}</Text>
              <View
                style={[
                  styles.inputFieldContainer,
                  phoneFocused && styles.inputFocused,
                  errors.phone && styles.inputError,
                ]}
              >
                <View style={styles.countryPicker}>
                  <View style={styles.flagShieldMini}>
                    <LinearGradient
                      colors={['#065F46', '#047857']}
                      style={styles.flagShieldMiniInner}
                    >
                      <Text style={styles.flagShieldMiniCrescent}>☪</Text>
                    </LinearGradient>
                  </View>
                  <Text style={styles.countryCode}>+92</Text>
                  <View style={styles.countryDivider} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder={t.phonePlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  keyboardType="phone-pad"
                />
              </View>
              <Text style={styles.hintText}>{t.hintText}</Text>
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
              <Text style={styles.buttonText}>{t.continueBtn}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer info banner */}
        <View style={styles.footerDeck}>
          <Text style={styles.disclaimerText}>{t.disclaimer}</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  headerLeft: {
    flex: 1,
  },
  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  welcomePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  badgeShield: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeShieldInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeShieldCrescent: {
    fontSize: 9,
    color: '#FFFFFF',
    marginTop: -2,
    fontWeight: 'bold',
  },
  langToggleContainer: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: BorderRadius.round,
    padding: 3,
  },
  langToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langToggleActive: {
    backgroundColor: '#10B981',
  },
  langToggleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  langToggleTextActive: {
    color: '#FFFFFF',
  },
  header: {
    marginBottom: Spacing.xl,
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
  autofillBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  autofillGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  autofillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#047857',
    letterSpacing: 0.6,
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
  labelUrdu: {
    color: '#059669',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
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
    shadowOpacity: 0.18,
    shadowRadius: 6,
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
    outlineStyle: 'none' as any,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagShieldMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  flagShieldMiniInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagShieldMiniCrescent: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: -2,
    fontWeight: 'bold',
  },
  countryCode: {
    fontSize: Typography.sizes.lg - 1,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 8,
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
