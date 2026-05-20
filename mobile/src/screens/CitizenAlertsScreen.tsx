/**
 * CrisesMesh AI — Citizen Alerts Screen
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../constants/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CitizenAlerts'>;

const mockAlerts = [
  {
    id: 'alert_1',
    severity: 'High',
    title: 'Urban Flooding — G-10 Underpass',
    titleUrdu: 'شہری سیلاب — جی-10 انڈر پاس',
    english: 'Avoid G-10 underpass. Urban flooding risk detected. Rescue teams en route.',
    urdu: 'G-10 underpass se parhez karein. Pani bharne ka khatra detect hua hai. Imdadi teemein rawanah ho chuki hain.',
    location: 'G-10, Islamabad',
    time: '10 min ago',
  },
];

const LOCALIZATION = {
  en: {
    back: '← Back',
    title: '🔔 Active Alerts',
    subtitle: 'Approved by Government Command Center',
    englishLabel: 'ENGLISH',
    urduLabel: 'ROMAN URDU',
    smsPreview: '📩 Simulated SMS Preview',
    channelsLabel: 'Active Broadcast Channels',
    emptyAlerts: 'No active alerts in your region right now.',
    smsBoxTxt: '[CrisesMesh AI] ⚠️ Urban Flooding at G-10, Islamabad. Avoid area. Stay safe.',
  },
  ur: {
    back: '← واپس',
    title: '🔔 فعال الرٹس',
    subtitle: 'سرکاری کمانڈ سینٹر سے منظور شدہ',
    englishLabel: 'انگریزی',
    urduLabel: 'رومن اردو',
    smsPreview: '📩 مصنوعی ایس ایم ایس کا پیش نظارہ',
    channelsLabel: 'سرگرم نشریاتی چینلز',
    emptyAlerts: 'اس وقت آپ کے علاقے میں کوئی فعال الرٹ نہیں ہے۔',
    smsBoxTxt: '[CrisesMesh AI] ⚠️ جی-10، اسلام آباد میں سیلاب کا خطرہ ہے۔ اس علاقے سے پرہیز کریں۔',
  }
};

export default function CitizenAlertsScreen() {
  const navigation = useNavigation<NavProp>();
  const { lang, setLang } = useAppStore();
  const t = LOCALIZATION[lang];

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.citizenBg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header row with back button and lang toggle */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backBtnText}>{t.back}</Text>
          </TouchableOpacity>
          
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

        <Text style={s.title}>{t.title}</Text>
        <Text style={s.subtitle}>{t.subtitle}</Text>

        {mockAlerts.map((a) => (
          <View key={a.id} style={s.card}>
            <View style={s.strip} />
            <View style={s.body}>
              <View style={s.row}>
                <View style={s.badge}><Text style={s.badgeT}>🔴 {a.severity}</Text></View>
                <Text style={s.time}>{a.time}</Text>
              </View>
              <Text style={s.cardTitle}>{lang === 'ur' ? a.titleUrdu : a.title}</Text>
              
              {lang === 'en' ? (
                <View style={s.block}>
                  <Text style={s.lang}>{t.englishLabel}</Text>
                  <Text style={s.txt}>{a.english}</Text>
                </View>
              ) : (
                <View style={s.block}>
                  <Text style={s.lang}>{t.urduLabel}</Text>
                  <Text style={s.txt}>{a.urdu}</Text>
                </View>
              )}
              
              <Text style={s.loc}>📍 {a.location}</Text>
              
              <View style={s.channels}>
                {['📱 In-App','💬 SMS','📲 WhatsApp'].map(c=>(
                  <View key={c} style={s.ch}><Text style={s.chT}>{c}</Text></View>
                ))}
              </View>
            </View>
          </View>
        ))}

        <View style={s.smsCard}>
          <Text style={s.smsTitle}>{t.smsPreview}</Text>
          <View style={s.smsBox}>
            <Text style={s.smsTxt}>{t.smsBoxTxt}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.citizenBg },
  scroll: { padding: Spacing.xxl, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: Colors.citizenText,
  },
  langToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  langToggleBtn: {
    paddingHorizontal: 10,
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
  title: { fontSize: Typography.sizes.xxl, fontWeight: '800', color: Colors.citizenText, marginBottom: 4 },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.citizenTextSecondary, marginBottom: Spacing.xxl },
  card: { 
    borderRadius: BorderRadius.lg, 
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    borderWidth: 1.5, 
    borderColor: 'rgba(16, 185, 129, 0.2)', 
    overflow: 'hidden', 
    marginBottom: Spacing.lg, 
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  strip: { height: 4, backgroundColor: Colors.severityHigh },
  body: { padding: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  badge: { backgroundColor: '#FEF2F2', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.round },
  badgeT: { fontSize: Typography.sizes.sm, fontWeight: '700', color: Colors.danger },
  time: { fontSize: Typography.sizes.sm, color: Colors.citizenTextSecondary },
  cardTitle: { fontSize: Typography.sizes.xl, fontWeight: '700', color: Colors.citizenText, marginBottom: Spacing.lg },
  block: { 
    marginBottom: Spacing.md, 
    padding: Spacing.md, 
    backgroundColor: '#ECFDF5', 
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  lang: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 4 },
  txt: { fontSize: Typography.sizes.md, color: Colors.citizenText, lineHeight: 20 },
  loc: { fontSize: Typography.sizes.sm, color: Colors.citizenTextSecondary, marginVertical: Spacing.sm },
  channels: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  ch: { backgroundColor: '#F1F5F9', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.round },
  chT: { fontSize: 10, fontWeight: '600', color: Colors.citizenTextSecondary },
  smsCard: { backgroundColor: '#ECFDF5', borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1.5, borderColor: 'rgba(16, 185, 129, 0.2)', marginTop: Spacing.md },
  smsTitle: { fontSize: Typography.sizes.md, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.md },
  smsBox: { backgroundColor: Colors.white, borderRadius: BorderRadius.sm, padding: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0' },
  smsTxt: { fontSize: Typography.sizes.sm, color: Colors.citizenText, lineHeight: 18 },
});
