/**
 * CrisesMesh AI — Government Urban Flooding Incident Screen
 * Detailed incident view with all metrics and 7-signal fusion
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { getIncident } from '../services/api';

const mockIncident = {
  type: 'Urban Flooding',
  location: 'G-10 Underpass, Islamabad',
  severity: 'Critical',
  confidence: 86,
  priority_score: 89,
  affected_radius: 900,
  estimated_population: 12000,
  expected_duration: 4,
  peak_impact: '12:00 PM',
  status: 'Active',
  reported_at: '11:14 AM',
};

// 8 signals — core of the multi-agent architecture
const signals = [
  { source: 'Citizen Report', status: '✅', detail: 'Flooding confirmed by 3 citizens', weight: '20%' },
  { source: 'Weather/Rainfall', status: '✅', detail: 'Heavy rainfall — 45mm/hr', weight: '18%' },
  { source: 'Traffic Congestion', status: '⚠️', detail: 'Congestion index 0.87', weight: '12%' },
  { source: 'Field Officer', status: '⚠️', detail: 'Possible water-main burst', weight: '15%' },
  { source: 'Water-Level Sensor', status: '✅', detail: 'Level 2.3m — above threshold', weight: '15%' },
  { source: 'Emergency Calls', status: '✅', detail: 'Frequency spike: +340%', weight: '10%' },
  { source: 'Historical Data', status: '✅', detail: 'Known flood-prone zone', weight: '10%' },
  { source: 'Satellite SOS Ingestion', status: '✅', detail: 'Priority satellite SOS trigger verified', weight: '10%' },
];

const agents = [
  { name: 'Signal Fusion', status: 'complete', time: '2.1s' },
  { name: 'Classification', status: 'complete', time: '1.4s' },
  { name: 'Severity', status: 'complete', time: '0.8s' },
  { name: 'Resource Allocation', status: 'running', time: '...' },
  { name: 'Simulation', status: 'pending', time: '—' },
  { name: 'Notification', status: 'pending', time: '—' },
  { name: 'Recovery', status: 'pending', time: '—' },
];

export default function GovernmentIncidentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'GovernmentIncident'>>();
  const incidentId = route.params?.incidentId || 'inc_001';

  const [incidentData, setIncidentData] = useState(mockIncident);

  useEffect(() => {
    (async () => {
      const data = await getIncident(incidentId);
      if (data) {
        setIncidentData({
          type: data.type || 'Urban Flooding',
          location: 'G-10 Underpass, Islamabad',
          severity: data.severity || 'High',
          confidence: Math.round(data.confidence * 100),
          priority_score: data.priority_score,
          affected_radius: data.affected_radius_m,
          estimated_population: data.estimated_population,
          expected_duration: data.expected_duration_hours,
          peak_impact: data.peak_impact_time || '12:00 PM',
          status: data.status,
          reported_at: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    })();
  }, [incidentId]);

  const i = incidentData;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.govBg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Back navigation header */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, alignSelf: 'flex-start' }}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: '800', letterSpacing: 0.8 }}>
            ← BACK TO COMMAND CENTER
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.headerIcon}>🌊</Text>
          <View style={s.headerInfo}>
            <Text style={s.headerTitle}>{i.type}</Text>
            <Text style={s.headerLoc}>📍 {i.location}</Text>
            <Text style={s.headerTime}>Reported at {i.reported_at}</Text>
          </View>
          <View style={s.severityBadge}>
            <Text style={s.severityText}>{i.severity}</Text>
          </View>
        </View>

        {/* Confidence bar */}
        <View style={s.confidenceBar}>
          <View style={s.confidenceHeader}>
            <Text style={s.confidenceLabel}>AI CONFIDENCE</Text>
            <Text style={s.confidenceValue}>{i.confidence}%</Text>
          </View>
          <View style={s.confidenceTrack}>
            <View style={[s.confidenceFill, { width: `${i.confidence}%` }]} />
          </View>
          <Text style={s.confidenceHint}>Based on 8-signal fusion analysis</Text>
        </View>

        {/* Metrics grid */}
        <View style={s.metricsGrid}>
          <MetricCard label="Priority" value={`${i.priority_score}/100`} sub="High" color={Colors.accent} />
          <MetricCard label="Status" value={i.status} color={Colors.danger} />
          <MetricCard label="Affected Radius" value={`${i.affected_radius}m`} color={Colors.warning} />
          <MetricCard label="Population" value={i.estimated_population.toLocaleString()} color={Colors.primary} />
          <MetricCard label="Duration" value={`${i.expected_duration} hrs`} color={Colors.govTextSecondary} />
          <MetricCard label="Peak Impact" value={i.peak_impact} color={Colors.danger} />
        </View>

        {/* Signal summary */}
        <Text style={s.sectionTitle}>📡 8-Signal Fusion Summary</Text>
        <Text style={s.sectionHint}>Each signal contributes weighted confidence to the final score</Text>
        {signals.map((sig, idx) => (
          <React.Fragment key={`signal-${idx}`}>
            <View style={s.signalRow}>
              <Text style={s.signalStatus}>{sig.status}</Text>
              <View style={s.signalInfo}>
                <Text style={s.signalSource}>{sig.source}</Text>
                <Text style={s.signalDetail}>{sig.detail}</Text>
              </View>
              <Text style={s.signalWeight}>{sig.weight}</Text>
            </View>
          </React.Fragment>
        ))}

        {/* Contradiction note */}
        <View style={s.contradictionCard}>
          <Text style={s.contradictionTitle}>⚠️ Contradiction Detected</Text>
          <Text style={s.contradictionText}>
            Field officer report suggests possible water-main burst, conflicting with city-wide flooding classification. Confidence reduced by 14%.
          </Text>
          <Text style={s.contradictionAction}>→ Override available for authorized personnel</Text>
        </View>

        {/* Agent trace summary */}
        <Text style={s.sectionTitle}>🤖 Agent Trace Pipeline</Text>
        {agents.map((a, idx) => (
          <React.Fragment key={`agent-${idx}`}>
            <View style={s.traceRow}>
              <View style={[
                s.traceDot,
                a.status === 'complete' && s.traceDotComplete,
                a.status === 'running' && s.traceDotRunning,
              ]} />
              <Text style={s.traceName}>{a.name} Agent</Text>
              <Text style={[
                s.traceStatus,
                a.status === 'complete' && s.traceStatusComplete,
                a.status === 'running' && s.traceStatusRunning,
              ]}>
                {a.status === 'complete' ? '✅ Complete' : a.status === 'running' ? '⏳ Running' : '⏸ Pending'}
              </Text>
              <Text style={s.traceTime}>{a.time}</Text>
            </View>
          </React.Fragment>
        ))}

        {/* Action buttons */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} activeOpacity={0.85} onPress={() => navigation.navigate('AlertApproval', { incidentId } as any)}>
            <Text style={s.actionBtnText}>📢 Approve Public Alert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.actionBtnSecondary} activeOpacity={0.85} onPress={() => navigation.navigate('ResourceAllocation', { incidentId } as any)}>
            <Text style={s.actionBtnSecondaryText}>🚒 Resource Allocation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtnSecondary} activeOpacity={0.85} onPress={() => navigation.navigate('RedZoneMap', { incidentId } as any)}>
            <Text style={s.actionBtnSecondaryText}>🗺️ Red Zone & Simulation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[s.actionBtnSecondary, { borderColor: Colors.danger }]} activeOpacity={0.85} onPress={() => navigation.navigate('Recovery', { incidentId } as any)}>
            <Text style={[s.actionBtnSecondaryText, { color: Colors.danger }]}>⚠️ Reclassify Incident</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <View style={s.metric}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={[s.metricValue, { color }]}>{value}</Text>
      {sub && <Text style={s.metricSub}>{sub}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.govBg },
  scroll: { padding: Spacing.lg, paddingTop: 20, paddingBottom: 40 },
  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  headerIcon: { fontSize: 40, marginRight: Spacing.lg },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: Typography.sizes.xxl, fontWeight: '800', color: Colors.white },
  headerLoc: { fontSize: Typography.sizes.sm, color: Colors.govTextSecondary, marginTop: 4 },
  headerTime: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, marginTop: 2 },
  severityBadge: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.round, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  severityText: { fontSize: Typography.sizes.sm, fontWeight: '800', color: Colors.danger },
  // Confidence bar
  confidenceBar: { backgroundColor: Colors.govCard, borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.govBorder, marginBottom: Spacing.xl },
  confidenceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  confidenceLabel: { fontSize: 9, fontWeight: '800', color: Colors.govTextSecondary, letterSpacing: 1 },
  confidenceValue: { fontSize: Typography.sizes.lg, fontWeight: '800', color: Colors.primary },
  confidenceTrack: { height: 8, backgroundColor: Colors.govBorder, borderRadius: 4, overflow: 'hidden' },
  confidenceFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  confidenceHint: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, marginTop: Spacing.xs },
  // Metrics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xxl },
  metric: { width: '48%', backgroundColor: Colors.govCard, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.govBorder },
  metricLabel: { fontSize: 10, fontWeight: '700', color: Colors.govTextSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  metricValue: { fontSize: Typography.sizes.xl, fontWeight: '800' },
  metricSub: { fontSize: 10, color: Colors.govTextSecondary, marginTop: 2 },
  // Sections
  sectionTitle: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.govText, marginBottom: Spacing.sm, marginTop: Spacing.md },
  sectionHint: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, marginBottom: Spacing.md },
  // Signals
  signalRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm, backgroundColor: Colors.govCard, borderRadius: BorderRadius.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.govBorder },
  signalStatus: { fontSize: 16, marginRight: Spacing.md, marginTop: 2 },
  signalInfo: { flex: 1 },
  signalSource: { fontSize: Typography.sizes.md, fontWeight: '700', color: Colors.govText },
  signalDetail: { fontSize: Typography.sizes.sm, color: Colors.govTextSecondary, marginTop: 2 },
  signalWeight: { fontSize: Typography.sizes.xs, fontWeight: '700', color: Colors.primary, marginLeft: Spacing.sm },
  // Contradiction
  contradictionCard: { backgroundColor: 'rgba(234,179,8,0.1)', borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1, borderColor: 'rgba(234,179,8,0.3)', marginVertical: Spacing.lg },
  contradictionTitle: { fontSize: Typography.sizes.md, fontWeight: '700', color: Colors.warning, marginBottom: Spacing.sm },
  contradictionText: { fontSize: Typography.sizes.sm, color: Colors.govTextSecondary, lineHeight: 18, marginBottom: Spacing.sm },
  contradictionAction: { fontSize: Typography.sizes.xs, fontWeight: '600', color: Colors.primary },
  // Agent traces
  traceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: Colors.govCard, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.govBorder },
  traceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.govTextSecondary, marginRight: Spacing.md },
  traceDotComplete: { backgroundColor: '#22C55E' },
  traceDotRunning: { backgroundColor: Colors.primary },
  traceName: { flex: 1, fontSize: Typography.sizes.md, fontWeight: '600', color: Colors.govText },
  traceStatus: { fontSize: Typography.sizes.sm, color: Colors.govTextSecondary },
  traceStatusComplete: { color: '#22C55E' },
  traceStatusRunning: { color: Colors.primary },
  traceTime: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, marginLeft: Spacing.sm, width: 35, textAlign: 'right' },
  // Actions
  actionRow: { gap: Spacing.md, marginTop: Spacing.lg },
  actionBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, alignItems: 'center' },
  actionBtnText: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.white },
  actionBtnSecondary: { backgroundColor: Colors.govCard, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.govBorder },
  actionBtnSecondaryText: { fontSize: Typography.sizes.lg, fontWeight: '700', color: Colors.govText },
});
