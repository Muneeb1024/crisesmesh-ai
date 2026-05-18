/**
 * CrisesMesh AI — Citizen Alerts Screen
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

const mockAlerts = [
  {
    id: 'alert_1',
    severity: 'High',
    title: 'Urban Flooding — G-10 Underpass',
    english: 'Avoid G-10 underpass. Urban flooding risk detected. Rescue teams en route.',
    urdu: 'G-10 underpass se parhez karein. Pani bharne ka khatra detect hua hai.',
    location: 'G-10, Islamabad',
    time: '10 min ago',
  },
];

export default function CitizenAlertsScreen() {
  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.citizenBg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>🔔 Active Alerts</Text>
        <Text style={s.subtitle}>Approved by Government Command Center</Text>

        {mockAlerts.map((a) => (
          <View key={a.id} style={s.card}>
            <View style={s.strip} />
            <View style={s.body}>
              <View style={s.row}>
                <View style={s.badge}><Text style={s.badgeT}>🔴 {a.severity}</Text></View>
                <Text style={s.time}>{a.time}</Text>
              </View>
              <Text style={s.cardTitle}>{a.title}</Text>
              <View style={s.block}><Text style={s.lang}>ENGLISH</Text><Text style={s.txt}>{a.english}</Text></View>
              <View style={s.block}><Text style={s.lang}>ROMAN URDU</Text><Text style={s.txt}>{a.urdu}</Text></View>
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
          <Text style={s.smsTitle}>📩 Simulated SMS Preview</Text>
          <View style={s.smsBox}>
            <Text style={s.smsTxt}>[CrisesMesh AI] ⚠️ Urban Flooding at G-10, Islamabad. Avoid area. Stay safe.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.citizenBg },
  scroll: { padding: Spacing.xxl, paddingBottom: 40 },
  title: { fontSize: Typography.sizes.xxl, fontWeight: '800', color: Colors.citizenText, marginBottom: 4 },
  subtitle: { fontSize: Typography.sizes.md, color: Colors.citizenTextSecondary, marginBottom: Spacing.xxl },
  card: { borderRadius: BorderRadius.lg, backgroundColor: Colors.citizenCard, borderWidth: 1, borderColor: Colors.citizenBorder, overflow: 'hidden', marginBottom: Spacing.lg, ...Shadows.md },
  strip: { height: 4, backgroundColor: Colors.severityHigh },
  body: { padding: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  badge: { backgroundColor: '#FEF2F2', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.round },
  badgeT: { fontSize: Typography.sizes.sm, fontWeight: '700', color: Colors.danger },
  time: { fontSize: Typography.sizes.sm, color: Colors.citizenTextSecondary },
  cardTitle: { fontSize: Typography.sizes.xl, fontWeight: '700', color: Colors.citizenText, marginBottom: Spacing.lg },
  block: { marginBottom: Spacing.md, padding: Spacing.md, backgroundColor: '#F8FAFC', borderRadius: BorderRadius.sm },
  lang: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: 4 },
  txt: { fontSize: Typography.sizes.md, color: Colors.citizenText, lineHeight: 20 },
  loc: { fontSize: Typography.sizes.sm, color: Colors.citizenTextSecondary, marginVertical: Spacing.sm },
  channels: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  ch: { backgroundColor: '#F1F5F9', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.round },
  chT: { fontSize: 10, fontWeight: '600', color: Colors.citizenTextSecondary },
  smsCard: { backgroundColor: '#F0FDF4', borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1, borderColor: '#BBF7D0', marginTop: Spacing.md },
  smsTitle: { fontSize: Typography.sizes.md, fontWeight: '700', color: Colors.success, marginBottom: Spacing.md },
  smsBox: { backgroundColor: Colors.white, borderRadius: BorderRadius.sm, padding: Spacing.md, borderWidth: 1, borderColor: '#E2E8F0' },
  smsTxt: { fontSize: Typography.sizes.sm, color: Colors.citizenText, lineHeight: 18 },
});
