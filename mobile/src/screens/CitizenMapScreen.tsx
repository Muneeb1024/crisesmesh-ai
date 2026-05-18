/**
 * CrisesMesh AI — Citizen Map Screen (Placeholder)
 */
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

export default function CitizenMapScreen() {
  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.citizenBg} />
      <View style={s.content}>
        <Text style={s.icon}>🗺️</Text>
        <Text style={s.title}>Safety Map</Text>
        <Text style={s.sub}>Mapbox integration will show:</Text>
        <View style={s.list}>
          {['Your location','Incident markers','Red Zone areas','Safe/unsafe zones','Nearby alerts'].map(i => (
            <View key={i} style={s.item}><Text style={s.dot}>•</Text><Text style={s.itemText}>{i}</Text></View>
          ))}
        </View>
        <View style={s.mapPlaceholder}>
          <Text style={s.mapText}>📍 Islamabad / Rawalpindi</Text>
          <Text style={s.mapCoords}>33.6844°N, 73.0479°E</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.citizenBg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
  icon: { fontSize: 56, marginBottom: Spacing.lg },
  title: { fontSize: Typography.sizes.xxl, fontWeight: '800', color: Colors.citizenText, marginBottom: Spacing.sm },
  sub: { fontSize: Typography.sizes.md, color: Colors.citizenTextSecondary, marginBottom: Spacing.xl },
  list: { marginBottom: Spacing.xxl, alignSelf: 'flex-start', width: '100%', paddingHorizontal: Spacing.xxl },
  item: { flexDirection: 'row', marginBottom: Spacing.sm },
  dot: { color: Colors.primary, marginRight: Spacing.sm, fontWeight: '700' },
  itemText: { fontSize: Typography.sizes.md, color: Colors.citizenText },
  mapPlaceholder: { width: '100%', height: 180, backgroundColor: '#E2E8F0', borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  mapText: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.citizenTextSecondary },
  mapCoords: { fontSize: Typography.sizes.sm, color: Colors.citizenTextSecondary, marginTop: 4 },
});
