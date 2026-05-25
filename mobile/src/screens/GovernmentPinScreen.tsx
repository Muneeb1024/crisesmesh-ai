/**
 * CrisesMesh AI — Government PIN Screen
 * Demo PIN: 1122
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'GovernmentPin'>;
const CORRECT_PIN = '1122';

const TRANSLATIONS = {
  en: {
    title: 'National Crisis Command',
    subtitle: 'SECURE AGENT GATEWAY',
    desc: 'Enter authorized PIN credentials to gain clearance',
    btn: 'Authenticate & Enter →',
    error: 'Authentication failed. Try 1122.',
    hint: 'Demo Authorization PIN: 1122',
  },
  ur: {
    title: 'قومی بحران کمانڈ سینٹر',
    subtitle: 'حفاظتی ایجنٹ گیٹ وے',
    desc: 'کمانڈ سینٹر तक رسائی کے لیے خفیہ پن درج کریں',
    btn: 'کمانڈ سینٹر میں داخل ہوں ←',
    error: 'تصدیق ناکام ہو گئی۔ 1122 آزمائیں۔',
    hint: 'ڈیمو پن کوڈ: 1122',
  }
};

export default function GovernmentPinScreen() {
  const navigation = useNavigation<NavProp>();
  const setGovAuth = useAppStore((s) => s.setGovernmentAuthenticated);
  const lang = useAppStore((s) => s.lang);
  const texts = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const textInputRef = useRef<TextInput>(null);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in screen elements
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the security lock
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();

    // Auto-focus keyboard on mount
    const timer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handleTextChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPin(cleaned);
    setError('');
    
    // Automatically submit once 4 digits are entered
    if (cleaned.length === 4) {
      if (cleaned === CORRECT_PIN) {
        setError('');
        setGovAuth(true);
        // Delay slightly for visual feedback satisfaction
        setTimeout(() => {
          navigation.navigate('GovernmentHome');
        }, 200);
      } else {
        setTimeout(() => {
          setError(texts.error);
          shake();
        }, 150);
      }
    }
  };

  const handleCellPress = () => {
    textInputRef.current?.focus();
  };

  // Render the secure dots in the pin boxes
  const renderPinCells = () => {
    const cells = [];
    for (let i = 0; i < 4; i++) {
      const isFocused = pin.length === i;
      const hasValue = pin.length > i;
      const char = hasValue ? '●' : '';

      cells.push(
        <View
          key={i}
          style={[
            styles.pinCell,
            isFocused && styles.pinCellFocused,
            error ? styles.pinCellError : null,
          ]}
        >
          {isFocused && (
            <View style={styles.blinkingCursor} />
          )}
          <Text style={[styles.pinCellText, hasValue && styles.pinCellTextActive]}>
            {char}
          </Text>
        </View>
      );
    }
    return cells;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020813" />
      
      {/* Premium Emerald Command Gradient Background */}
      <LinearGradient
        colors={['#020813', '#082117', '#020813']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.gridOverlay} />

      {/* Styled Top-Left Back Navigation */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
          style={styles.backButtonGrad}
        >
          <Text style={styles.backButtonText}>←</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        
        {/* Animated Security Lock Shield and Pulsing Rings */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({ inputRange: [1, 1.25], outputRange: [0.3, 0] }) }
            ]}
          />
          <LinearGradient
            colors={['#10B981', '#047857']}
            style={styles.shieldWrapper}
          >
            <Text style={styles.shieldIcon}>🔒</Text>
          </LinearGradient>
        </View>

        {/* Header Text */}
        <Text style={styles.subtitle}>{texts.subtitle}</Text>
        <Text style={styles.title}>{texts.title}</Text>
        <Text style={styles.desc}>{texts.desc}</Text>

        {/* Glassmorphic Auth Form Container */}
        <View style={styles.formContainer}>
          
          {/* Hidden input to handle keyboard interactions */}
          <TextInput
            ref={textInputRef}
            value={pin}
            onChangeText={handleTextChange}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.hiddenInput}
            caretHidden
          />

          {/* Secure 4-Cell PIN Row */}
          <Animated.View 
            style={[
              styles.pinRowContainer, 
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            <Pressable style={styles.pinRow} onPress={handleCellPress}>
              {renderPinCells()}
            </Pressable>
          </Animated.View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Authenticate Trigger Button (optional/fallback tap) */}
          <TouchableOpacity
            style={styles.authBtn}
            onPress={() => handleTextChange(pin)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.authBtnGrad}
            >
              <Text style={styles.authBtnText}>{texts.btn}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.hint}>{texts.hint}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020813',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFF',
    borderStyle: 'dashed',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonGrad: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
    marginTop: -2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  shieldWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  shieldIcon: {
    fontSize: 34,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 35,
    lineHeight: 18,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(10, 25, 20, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  pinRowContainer: {
    width: '100%',
    marginBottom: 20,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  pinCell: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(2, 8, 19, 0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pinCellFocused: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  pinCellError: {
    borderColor: '#EF4444',
  },
  pinCellText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pinCellTextActive: {
    color: '#10B981',
  },
  blinkingCursor: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#10B981',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  authBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  authBtnGrad: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 20,
    textAlign: 'center',
  },
});