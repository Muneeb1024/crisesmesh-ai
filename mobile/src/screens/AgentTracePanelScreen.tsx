/**
 * CrisesMesh AI — Agent Trace Panel (Task 3.5)
 * Government-only screen showing all 7 agent execution traces.
 * No private chain-of-thought — only safe reasoning summaries.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { getAgentTraces, runAgentPipeline, startFloodScenario, type AgentTrace } from '../services/api';

// Agent metadata
const AGENT_META: Record<string, { icon: string; color: string; description: string }> = {
  'Signal Fusion':       { icon: '🔗', color: '#0EA5E9', description: 'Fuses 7 signal sources' },
  'Classification':      { icon: '🏷️', color: '#8B5CF6', description: 'Identifies incident type' },
  'Severity':            { icon: '⚠️', color: '#EF4444', description: 'Predicts severity & impact' },
  'Resource Allocation': { icon: '🚑', color: '#F97316', description: 'Allocates rescue resources' },
  'Simulation':          { icon: '🗺️', color: '#22C55E', description: 'Models reroute scenarios' },
  'Notification':        { icon: '📢', color: '#EAB308', description: 'Generates bilingual alerts' },
  'Recovery':            { icon: '🔄', color: '#94A3B8', description: 'Monitors for reclassification' },
};

function confidenceColor(c: number): string {
  if (c >= 0.85) return '#22C55E';
  if (c >= 0.70) return '#EAB308';
  return '#EF4444';
}

function confidenceLabel(c: number): string {
  if (c >= 0.85) return 'HIGH';
  if (c >= 0.70) return 'MODERATE';
  return 'LOW';
}

export default function AgentTracePanelScreen() {
  const navigation = useNavigation();
  const [traces, setTraces] = useState<AgentTrace[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string>('');

  const fetchTraces = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAgentTraces(id);
      setTraces(data);
      setLastRun(new Date().toLocaleTimeString());
    } catch {
      setError('Failed to load traces');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRunPipeline = async () => {
    setRunningPipeline(true);
    setError(null);
    setTraces([]);
    try {
      // Start flood scenario first (ensures 7 signals), then run pipeline
      const scenario = await startFloodScenario();
      const id = scenario?.incident_id || 'inc_001';
      setIncidentId(id);
      await runAgentPipeline(id);
      await fetchTraces(id);
    } catch {
      setError('Pipeline execution failed');
    } finally {
      setRunningPipeline(false);
    }
  };

  // Auto-load traces for inc_001 on mount
  useEffect(() => {
    (async () => {
      setIncidentId('inc_001');
      await fetchTraces('inc_001');
    })();
  }, [fetchTraces]);

  const renderTraceCard = (trace: AgentTrace) => {
    const meta = AGENT_META[trace.agent_name] || { icon: '🤖', color: Colors.primary, description: '' };
    const isExpanded = expandedId === trace.id;
    const conf = trace.confidence;

    return (
      <TouchableOpacity
        key={trace.id}
        style={[s.card, { borderLeftColor: meta.color }]}
        onPress={() => setExpandedId(isExpanded ? null : trace.id)}
        activeOpacity={0.8}
      >
        {/* Card Header */}
        <View style={s.cardHeader}>
          <View style={s.cardLeft}>
            <Text style={s.cardIcon}>{meta.icon}</Text>
            <View>
              <Text style={s.cardName}>{trace.agent_name}</Text>
              <Text style={s.cardDesc}>{meta.description}</Text>
            </View>
          </View>
          <View style={s.cardRight}>
            <View style={[s.confBadge, { backgroundColor: `${confidenceColor(conf)}22` }]}>
              <Text style={[s.confText, { color: confidenceColor(conf) }]}>
                {confidenceLabel(conf)} {Math.round(conf * 100)}%
              </Text>
            </View>
            <Text style={s.execTime}>{trace.execution_ms}ms</Text>
          </View>
        </View>

        {/* Input summary — always visible */}
        <Text style={s.inputSummary}>{trace.input_summary}</Text>

        {/* Reasoning — expanded */}
        {isExpanded && (
          <View style={s.expandedContent}>
            <View style={s.divider} />
            
            {renderTerminalLogs(trace)}

            <Text style={s.sectionLabel}>🧠 REASONING SUMMARY</Text>
            <Text style={s.reasoningText}>{trace.reasoning_summary}</Text>

            <Text style={s.sectionLabel}>📊 KEY OUTPUTS</Text>
            {renderKeyOutputs(trace)}

            <Text style={s.sectionLabel}>🕐 TIMESTAMP</Text>
            <Text style={s.timestampText}>
              {new Date(trace.created_at).toLocaleString()}
            </Text>
            <Text style={s.traceId}>Trace ID: {trace.id}</Text>
          </View>
        )}

        {/* Expand hint */}
        <Text style={s.expandHint}>{isExpanded ? '▲ Collapse' : '▼ View reasoning'}</Text>
      </TouchableOpacity>
    );
  };

  const renderTerminalLogs = (trace: AgentTrace) => {
    const logs = trace.output?.step_logs || [];
    if (logs.length === 0) return null;

    return (
      <View style={s.terminalContainer}>
        <View style={s.terminalHeader}>
          <Text style={s.terminalHeaderText}>📟 SYSTEM TELEMETRY CONSOLE</Text>
          <View style={s.terminalDotContainer}>
            <View style={[s.terminalDot, { backgroundColor: '#EF4444' }]} />
            <View style={[s.terminalDot, { backgroundColor: '#EAB308' }]} />
            <View style={[s.terminalDot, { backgroundColor: '#22C55E' }]} />
          </View>
        </View>
        <ScrollView style={s.terminalBody} nestedScrollEnabled={true}>
          {logs.map((log: string, idx: number) => {
            let color = '#38BDF8'; // cyan standard
            if (log.includes('✅') || log.includes('SUCCESS') || log.includes('successful')) color = '#34D399'; // green
            if (log.includes('⚠️') || log.includes('WARNING') || log.includes('stale') || log.includes('OFFLINE')) color = '#FBBF24'; // orange
            if (log.includes('🚨') || log.includes('RECLASSIFY') || log.includes('ANOMALY') || log.includes('ERROR')) color = '#F87171'; // red

            return (
              <Text key={idx} style={[s.terminalLine, { color }]}>
                {log}
              </Text>
            );
          })}
        </ScrollView>
      </View>
    );
  };


  const renderKeyOutputs = (trace: AgentTrace) => {
    const out = trace.output;
    const name = trace.agent_name;
    const rows: { label: string; value: string }[] = [];

    if (name === 'Signal Fusion') {
      rows.push({ label: 'Signal Agreement', value: `${Math.round(out.signal_agreement * 100)}%` });
      rows.push({ label: 'Contradiction', value: `${Math.round(out.contradiction_level * 100)}%` });
      rows.push({ label: 'Verdict', value: out.fusion_verdict });
      rows.push({ label: 'Signals Fused', value: String(out.signal_count) });
    } else if (name === 'Classification') {
      rows.push({ label: 'Type', value: out.incident_type });
      rows.push({ label: 'Confidence', value: `${Math.round(out.overall_confidence * 100)}%` });
      rows.push({ label: 'Alt. Hypotheses', value: out.alternative_hypotheses?.length > 0 ? out.alternative_hypotheses.map((a: any) => a.type).join(', ') : 'None' });
    } else if (name === 'Severity') {
      rows.push({ label: 'Severity', value: out.severity });
      rows.push({ label: 'Priority Score', value: `${out.priority_score}/100` });
      rows.push({ label: 'Affected Radius', value: `${out.affected_radius_m}m` });
      rows.push({ label: 'Est. Population', value: out.estimated_population?.toLocaleString() });
      rows.push({ label: 'Peak Impact', value: out.peak_impact_time });
    } else if (name === 'Resource Allocation') {
      rows.push({ label: 'Resources Deployed', value: String(out.total_resources) });
      rows.push({ label: 'Total Capacity', value: `${out.total_capacity} personnel` });
      rows.push({ label: 'Avg ETA', value: `${out.avg_eta_minutes} min` });
      rows.push({ label: 'Approval Required', value: out.requires_government_approval ? 'Yes' : 'No' });
    } else if (name === 'Simulation') {
      rows.push({ label: 'ETA Before', value: `${out.eta_before_min} min` });
      rows.push({ label: 'ETA After Reroute', value: `${out.eta_after_min} min` });
      rows.push({ label: 'Time Saved', value: `${out.time_saved_min} min` });
      rows.push({ label: 'Recommendation', value: out.recommendation });
    } else if (name === 'Notification') {
      rows.push({ label: 'Alert Status', value: out.alert?.status });
      rows.push({ label: 'Stakeholders', value: `${out.stakeholder_notifications?.length} groups` });
      rows.push({ label: 'Approval Required', value: out.requires_approval ? 'Yes' : 'No' });
    } else if (name === 'Recovery') {
      rows.push({ label: 'Action', value: out.action });
      rows.push({ label: 'Reclassification', value: out.needs_reclassification ? 'NEEDED' : 'Not needed' });
      rows.push({ label: 'Field Verification', value: out.field_verification_needed ? 'Required' : 'Not needed' });
    }

    return (
      <View style={s.outputTable}>
        {rows.map((row, i) => (
          <View key={i} style={s.outputRow}>
            <Text style={s.outputLabel}>{row.label}</Text>
            <Text style={s.outputValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.govBg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>🤖 Agent Traces</Text>
          <Text style={s.headerSub}>{traces.length}/7 agents • {incidentId || '—'}</Text>
        </View>
        {lastRun ? <Text style={s.lastRun}>{lastRun}</Text> : <View style={{ width: 50 }} />}
      </View>

      {/* Run Pipeline Button */}
      <View style={s.runBar}>
        <TouchableOpacity
          style={[s.runBtn, runningPipeline && s.runBtnDisabled]}
          onPress={handleRunPipeline}
          disabled={runningPipeline}
          activeOpacity={0.8}
        >
          {runningPipeline ? (
            <View style={s.runBtnInner}>
              <ActivityIndicator color={Colors.white} size="small" />
              <Text style={s.runBtnText}>Running pipeline…</Text>
            </View>
          ) : (
            <Text style={s.runBtnText}>▶ Run Full Agent Pipeline</Text>
          )}
        </TouchableOpacity>
        {incidentId && !runningPipeline && (
          <TouchableOpacity style={s.refreshBtn} onPress={() => fetchTraces(incidentId)}>
            <Text style={s.refreshText}>↻</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Banner */}
      {error && (
        <View style={s.errorBanner}>
          <Text style={s.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={s.emptyState}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={s.emptyText}>Loading traces…</Text>
          </View>
        ) : traces.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🤖</Text>
            <Text style={s.emptyTitle}>No Traces Yet</Text>
            <Text style={s.emptyText}>Tap "Run Full Agent Pipeline" to execute all 7 agents and generate traces.</Text>
          </View>
        ) : (
          <>
            {/* Pipeline summary bar */}
            <View style={s.summaryBar}>
              <View style={s.summaryItem}>
                <Text style={s.summaryVal}>{traces.length}</Text>
                <Text style={s.summaryLabel}>Agents Run</Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={[s.summaryVal, { color: '#22C55E' }]}>
                  {Math.round(traces.reduce((a, t) => a + t.confidence, 0) / traces.length * 100)}%
                </Text>
                <Text style={s.summaryLabel}>Avg Confidence</Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={s.summaryVal}>
                  {traces.reduce((a, t) => a + t.execution_ms, 0)}ms
                </Text>
                <Text style={s.summaryLabel}>Total Time</Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={[s.summaryVal, { color: '#22C55E' }]}>✓</Text>
                <Text style={s.summaryLabel}>Complete</Text>
              </View>
            </View>

            {traces.map(renderTraceCard)}

            <View style={s.privacyNote}>
              <Text style={s.privacyText}>
                🔒 Only safe reasoning summaries are shown. Raw chain-of-thought is never stored or displayed.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.govBg },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.govCard, borderBottomWidth: 1, borderBottomColor: Colors.govBorder },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: Colors.govText },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, marginTop: 2 },
  lastRun: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, width: 50, textAlign: 'right' },
  // Run bar
  runBar: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.govCard, borderBottomWidth: 1, borderBottomColor: Colors.govBorder },
  runBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  runBtnDisabled: { opacity: 0.7 },
  runBtnInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  runBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.sizes.md },
  refreshBtn: { width: 44, height: 44, backgroundColor: 'rgba(14,165,233,0.15)', borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.primary },
  refreshText: { fontSize: 20, color: Colors.primary },
  // Error
  errorBanner: { backgroundColor: 'rgba(239,68,68,0.15)', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(239,68,68,0.3)' },
  errorText: { color: Colors.danger, fontSize: Typography.sizes.sm, fontWeight: '600' },
  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },
  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: Typography.sizes.xl, fontWeight: '700', color: Colors.govText },
  emptyText: { fontSize: Typography.sizes.sm, color: Colors.govTextSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  // Summary bar
  summaryBar: { flexDirection: 'row', backgroundColor: Colors.govCard, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.govBorder, justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: Typography.sizes.xl, fontWeight: '800', color: Colors.primary },
  summaryLabel: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, marginTop: 2 },
  // Card
  card: { backgroundColor: Colors.govCard, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.govBorder, borderLeftWidth: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  cardIcon: { fontSize: 22 },
  cardName: { fontSize: Typography.sizes.md, fontWeight: '700', color: Colors.white },
  cardDesc: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  confBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  confText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  execTime: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary },
  inputSummary: { fontSize: Typography.sizes.sm, color: Colors.govTextSecondary, lineHeight: 18 },
  expandHint: { fontSize: 10, color: Colors.primary, marginTop: Spacing.sm, fontWeight: '600' },
  // Expanded
  expandedContent: { marginTop: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.govBorder, marginVertical: Spacing.sm },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: Colors.govTextSecondary, letterSpacing: 1, marginBottom: 6, marginTop: Spacing.sm },
  reasoningText: { fontSize: Typography.sizes.sm, color: Colors.govText, lineHeight: 20 },
  outputTable: { gap: 4 },
  outputRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  outputLabel: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, flex: 1 },
  outputValue: { fontSize: Typography.sizes.xs, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'right' },
  timestampText: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary },
  traceId: { fontSize: 9, color: 'rgba(148,163,184,0.4)', marginTop: 4, fontFamily: 'monospace' },
  // Privacy note
  privacyNote: { backgroundColor: 'rgba(14,165,233,0.05)', borderRadius: BorderRadius.sm, padding: Spacing.md, marginTop: Spacing.sm, borderWidth: 1, borderColor: 'rgba(14,165,233,0.1)' },
  privacyText: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, lineHeight: 16 },
  // Terminal Styles
  terminalContainer: {
    backgroundColor: '#050B14',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  terminalHeaderText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  terminalDotContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  terminalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  terminalBody: {
    maxHeight: 180,
    padding: Spacing.md,
  },
  terminalLine: {
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
    marginBottom: 4,
  },
});

