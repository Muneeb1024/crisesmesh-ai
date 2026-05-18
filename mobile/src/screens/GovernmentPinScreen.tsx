/**
 * CrisesMesh AI — Government PIN Screen
 * Demo PIN: 1122
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { useAppStore } from '../store/useAppStore';
import { LinearGradient } from 'expo-linear-gradient';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'GovernmentPin'>;
const CORRECT_PIN = '1122';

export default function GovernmentPinScreen() {
  const navigation = useNavigation<NavProp>();
  const setGovAuth = useAppStore((s) => s.setGovernmentAuthenticated);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    if (pin === CORRECT_PIN) {
      setError('');
      setGovAuth(true);
      navigation.navigate('GovernmentHome');
    } else {
      setError('Invalid PIN. Try 1122 for demo.');
      shake();
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.govBg} />
      <LinearGradient colors={['#0A1628', '#0F2847', '#0A1628']} style={StyleSheet.absoluteFill} />
      <Animated.View style={[s.content, { opacity: fadeAnim }]}>
        <View style={s.iconWrap}>
          <Text style={s.icon}>🏛️</Text>
        </View>
        <Text style={s.title}>Government Command Center</Text>
        <Text style={s.subtitle}>Enter your access PIN</Text>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }], width: '100%' }}>
          <TextInput
            style={[
              s.input,
              error ? s.inputError : null,
              pin.length > 0 ? s.inputWithPin : s.inputPlaceholder,
            ]}
            placeholder="Enter PIN"
            placeholderTextColor={Colors.govTextSecondary}
            value={pin}
            onChangeText={(t) => { setPin(t); setError(''); }}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            textAlign="center"
          />
        </Animated.View>
        {error ? <Text style={s.errorText}>{error}</Text> : null}

        <TouchableOpacity style={s.btn} onPress={handleSubmit} activeOpacity={0.85}>
          <LinearGradient colors={['#0EA5E9', '#0284C7']} style={s.btnGrad}>
            <Text style={s.btnText}>Access Command Center →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={s.hint}>Demo PIN: 1122</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.govBg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl },
  iconWrap: { width: 80, height: 80, borderRadius: 20, backgroundColor: Colors.govCard, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.govBorder },
  icon: { fontSize: 40 },
  title: { fontSize: Typography.sizes.xxl, fontWeight: '800', color: Colors.white, marginBottom: Spacing.xs, textAlign: 'center' },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.govTextSecondary, marginBottom: Spacing.xxl },
  input: { width: '100%', backgroundColor: Colors.govCard, borderWidth: 1.5, borderColor: Colors.govBorder, borderRadius: BorderRadius.md, paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg, fontSize: Typography.sizes.xxl, fontWeight: '700', color: Colors.white },
  inputWithPin: { letterSpacing: 12 },
  inputPlaceholder: { letterSpacing: 2 },
  inputError: { borderColor: Colors.danger },
  errorText: { fontSize: Typography.sizes.sm, color: Colors.danger, marginTop: Spacing.sm },
  btn: { width: '100%', borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: Spacing.xxl, ...Shadows.md },
  btnGrad: { paddingVertical: Spacing.xl, alignItems: 'center' },
  btnText: { fontSize: Typography.sizes.xl, fontWeight: '700', color: Colors.white },
  hint: { fontSize: Typography.sizes.sm, color: Colors.govTextSecondary, marginTop: Spacing.lg },
});