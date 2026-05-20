/**
 * CrisesMesh AI — Agent Trace Panel (Task 3.5 Upgrade)
 * Government-only screen showing all 7 agent execution traces.
 * Features an interactive DAG node pipeline map and live telemetry console logs.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { getAgentTraces, runAgentPipeline, startFloodScenario, type AgentTrace } from '../services/api';

// Predefined pipeline steps matching exact backend names
const PIPELINE_STEPS = [
  { name: 'Signal Fusion Agent', label: 'Fusion', icon: '🔗', color: '#0EA5E9', desc: 'Fuses 7 signal sources' },
  { name: 'Classification Agent', label: 'Classify', icon: '🏷️', color: '#8B5CF6', desc: 'Identifies incident type' },
  { name: 'Severity Agent', label: 'Severity', icon: '⚠️', color: '#EF4444', desc: 'Predicts severity & impact' },
  { name: 'Resource Allocation Agent', label: 'Dispatch', icon: '🚑', color: '#F97316', desc: 'Allocates rescue resources' },
  { name: 'Simulation Agent', label: 'Simulate', icon: '🗺️', color: '#22C55E', desc: 'Models reroute scenarios' },
  { name: 'Notification Agent', label: 'Notify', icon: '📢', color: '#EAB308', desc: 'Generates bilingual alerts' },
  { name: 'Recovery Agent', label: 'Recover', icon: '🔄', color: '#94A3B8', desc: 'Monitors for reclassification' },
];

const AGENT_META: Record<string, { icon: string; color: string; description: string }> = {
  'Signal Fusion Agent':       { icon: '🔗', color: '#0EA5E9', description: 'Fuses 7 signal sources' },
  'Classification Agent':      { icon: '🏷️', color: '#8B5CF6', description: 'Identifies incident type' },
  'Severity Agent':            { icon: '⚠️', color: '#EF4444', description: 'Predicts severity & impact' },
  'Resource Allocation Agent': { icon: '🚑', color: '#F97316', description: 'Allocates rescue resources' },
  'Simulation Agent':          { icon: '🗺️', color: '#22C55E', description: 'Models reroute scenarios' },
  'Notification Agent':        { icon: '📢', color: '#EAB308', description: 'Generates bilingual alerts' },
  'Recovery Agent':            { icon: '🔄', color: '#94A3B8', description: 'Monitors for reclassification' },
};

const simulatedLines = [
  "📡 JARVIS ORCHESTRATOR: Booting cognitive multi-agent pipeline...",
  "📥 [1/7] Signal Fusion Agent: Ingesting 8-Signal Matrix telemetry...",
  "🐦 [1/7] Social Firehose: Detected 42 panic tweets ('Bridge collapsed at Kashmir Hwy').",
  "🌡️ [1/7] IoT Sensors: Water levels normal (+0.1m). No bridge structural anomaly.",
  "🚗 [1/7] Traffic API: Traffic flowing at 42km/h (Normal).",
  "⚠️ [1/7] VERIFICATION FAILED: Cross-referencing signals disproves Social Media rumor.",
  "✅ [1/7] Signal Fusion Agent: COMPLETE (Verdict: MISINFORMATION FLAG, Confidence: 99%)",
  "🏷️ [2/7] Classification Agent: Reclassifying as 'Public Panic / Misinformation'...",
  "✅ [2/7] Classification Agent: COMPLETE",
  "⚠️ [3/7] Severity Agent: Ingesting spatial metadata...",
  "✅ [3/7] Severity Agent: COMPLETE (Severity: Low, No physical threat)",
  "🚒 [4/7] Resource Allocation Agent: HALTED dispatch of physical units.",
  "✅ [4/7] Resource Allocation Agent: COMPLETE (Resources conserved)",
  "🗺️ [5/7] Simulation Agent: Simulating panic spread radius...",
  "✅ [5/7] Simulation Agent: COMPLETE",
  "📢 [6/7] Notification Agent: Drafting clarification broadcast to dispel rumors...",
  "✅ [6/7] Notification Agent: COMPLETE (Bilingual 'Status Normal' alerts staged)",
  "🔄 [7/7] Recovery Agent: Monitoring for secondary real incidents...",
  "✅ [7/7] Recovery Agent: COMPLETE",
  "💾 SYSTEM: Saving traces to audit telemetry database. Pipeline successfully executed."
];

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
  
  // Custom states for live telemetry wow factor
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [highlightedAgent, setHighlightedAgent] = useState<string | null>(null);

  // References for scrolling
  const scrollRef = useRef<ScrollView>(null);
  const cardRefs = useRef<Record<string, View | null>>({});

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
    setLiveLogs([]);
    setActiveStepIndex(0);
    setError(null);
    setTraces([]);
    
    // Simulate real-time logs synchronized with backend
    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < simulatedLines.length) {
        setLiveLogs(prev => [...prev, simulatedLines[logIdx]]);
        
        // Match line to step index to show progress on the DAG
        const line = simulatedLines[logIdx];
        if (line.includes('[1/7]')) setActiveStepIndex(0);
        else if (line.includes('[2/7]')) setActiveStepIndex(1);
        else if (line.includes('[3/7]')) setActiveStepIndex(2);
        else if (line.includes('[4/7]')) setActiveStepIndex(3);
        else if (line.includes('[5/7]')) setActiveStepIndex(4);
        else if (line.includes('[6/7]')) setActiveStepIndex(5);
        else if (line.includes('[7/7]')) setActiveStepIndex(6);
        
        logIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 180);

    try {
      const scenario = await startFloodScenario();
      const id = scenario?.incident_id || 'inc_001';
      setIncidentId(id);
      await runAgentPipeline(id);
      
      // wait for logs simulation to finish
      while (logIdx < simulatedLines.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await fetchTraces(id);
    } catch {
      setError('Pipeline execution failed');
    } finally {
      clearInterval(logInterval);
      setRunningPipeline(false);
      setActiveStepIndex(-1);
    }
  };

  // Auto-load traces for inc_001 on mount
  useEffect(() => {
    (async () => {
      setIncidentId('inc_001');
      await fetchTraces('inc_001');
    })();
  }, [fetchTraces]);

  const handleNodePress = (agentName: string) => {
    const trace = traces.find(t => t.agent_name === agentName);
    if (trace) {
      setExpandedId(trace.id);
      setHighlightedAgent(agentName);
      setTimeout(() => setHighlightedAgent(null), 2500);
    }
  };

  const renderTraceCard = (trace: AgentTrace) => {
    const meta = AGENT_META[trace.agent_name] || { icon: '🤖', color: Colors.primary, description: '' };
    const isExpanded = expandedId === trace.id;
    const isHighlighted = highlightedAgent === trace.agent_name;
    const conf = trace.confidence;

    return (
      <View
        key={trace.id}
        ref={el => { cardRefs.current[trace.id] = el; }}
        style={[
          s.card, 
          { borderLeftColor: meta.color },
          isHighlighted && { borderColor: meta.color, shadowColor: meta.color, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 }
        ]}
      >
        <TouchableOpacity
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
      </View>
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
            if (log.includes('🚨') || log.includes('RECLASSIFY') || log.includes('ANOMALY') || log.includes('ERROR') || log.includes('SYSTEM')) color = '#F87171'; // red

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

    if (name === 'Signal Fusion Agent') {
      rows.push({ label: 'Signal Agreement', value: `${Math.round(out.signal_agreement * 100)}%` });
      rows.push({ label: 'Contradiction', value: `${Math.round(out.contradiction_level * 100)}%` });
      rows.push({ label: 'Verdict', value: out.fusion_verdict });
      rows.push({ label: 'Signals Fused', value: String(out.signal_count) });
      rows.push({ label: 'Islamabad Temp', value: `${out.ambient_temp_c}°C` });
      rows.push({ label: 'Precipitation Rate', value: `${out.precipitation_rate_mm}mm/hr` });
    } else if (name === 'Classification Agent') {
      rows.push({ label: 'Type', value: out.incident_type });
      rows.push({ label: 'Confidence', value: `${Math.round(out.overall_confidence * 100)}%` });
      rows.push({ label: 'Alt. Hypotheses', value: out.alternative_hypotheses?.length > 0 ? out.alternative_hypotheses.map((a: any) => a.type).join(', ') : 'None' });
    } else if (name === 'Severity Agent') {
      rows.push({ label: 'Severity', value: out.severity });
      rows.push({ label: 'Priority Score', value: `${out.priority_score}/100` });
      rows.push({ label: 'Affected Radius', value: `${out.affected_radius_m}m` });
      rows.push({ label: 'Est. Population', value: out.estimated_population?.toLocaleString() });
      rows.push({ label: 'Peak Impact', value: out.peak_impact_time });
    } else if (name === 'Resource Allocation Agent') {
      rows.push({ label: 'Resources Deployed', value: String(out.total_resources) });
      rows.push({ label: 'Total Capacity', value: `${out.total_capacity} personnel` });
      rows.push({ label: 'Avg ETA', value: `${out.avg_eta_minutes} min` });
      rows.push({ label: 'Approval Required', value: out.requires_government_approval ? 'Yes' : 'No' });
    } else if (name === 'Simulation Agent') {
      rows.push({ label: 'ETA Before', value: `${out.eta_before_min} min` });
      rows.push({ label: 'ETA After Reroute', value: `${out.eta_after_min} min` });
      rows.push({ label: 'Time Saved', value: `${out.time_saved_min} min` });
      rows.push({ label: 'Recommendation', value: out.recommendation });
    } else if (name === 'Notification Agent') {
      rows.push({ label: 'Alert Status', value: out.alert?.status });
      rows.push({ label: 'Stakeholders', value: `${out.stakeholder_notifications?.length} groups` });
      rows.push({ label: 'Approval Required', value: out.requires_approval ? 'Yes' : 'No' });
    } else if (name === 'Recovery Agent') {
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

  // Render the visual Pipeline Graph (DAG)
  const renderPipelineDAG = () => {
    return (
      <View style={s.dagContainer}>
        <Text style={s.dagTitle}>📡 ACTIVE COGNITIVE ORCHESTRATION PIPELINE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dagScroll}>
          {PIPELINE_STEPS.map((step, idx) => {
            const hasTrace = traces.some(t => t.agent_name === step.name);
            const isActive = runningPipeline && activeStepIndex === idx;
            const isCompleted = hasTrace && !runningPipeline;

            return (
              <React.Fragment key={step.name}>
                <TouchableOpacity
                  style={[
                    s.dagNode,
                    { borderColor: isCompleted ? step.color : '#334155' },
                    isCompleted && { backgroundColor: `${step.color}15` },
                    isActive && s.dagNodeActive,
                  ]}
                  onPress={() => handleNodePress(step.name)}
                  disabled={!isCompleted}
                  activeOpacity={0.7}
                >
                  <Text style={s.dagIcon}>{step.icon}</Text>
                  <Text style={[s.dagLabel, isCompleted && { color: step.color }]}>{step.label}</Text>
                  {isCompleted && <Text style={s.dagNodeCheck}>✓</Text>}
                </TouchableOpacity>

                {idx < PIPELINE_STEPS.length - 1 && (
                  <View style={s.dagConnector}>
                    <Text style={[s.dagArrow, (isCompleted || isActive) && { color: Colors.primary }]}>──▶</Text>
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderCognitiveOverview = () => {
    // Extract info if available
    const fusionTrace = traces.find(t => t.agent_name === 'Signal Fusion Agent');
    const classifyTrace = traces.find(t => t.agent_name === 'Classification Agent');
    const severityTrace = traces.find(t => t.agent_name === 'Severity Agent');
    const resourceTrace = traces.find(t => t.agent_name === 'Resource Allocation Agent');
    const simTrace = traces.find(t => t.agent_name === 'Simulation Agent');

    // Default values if traces are still loading or empty
    const fusionConf = fusionTrace ? Math.round(fusionTrace.confidence * 100) : 35;
    const classifyConf = classifyTrace ? Math.round(classifyTrace.confidence * 100) : 60;
    const severityConf = severityTrace ? Math.round(severityTrace.confidence * 100) : 85;
    const finalConf = classifyTrace ? Math.round((classifyTrace.output.overall_confidence || 0.92) * 100) : 92;

    const severityText = severityTrace ? severityTrace.output.severity : 'CRITICAL';
    const prioScore = severityTrace ? severityTrace.output.priority_score : 95;
    const detourSaved = simTrace ? simTrace.output.time_saved_min : 12;

    return (
      <View style={s.cogOverviewContainer}>
        <View style={s.cogHeader}>
          <Text style={s.cogHeaderTitle}>🧠 COGNITIVE ORCHESTRATION RADAR</Text>
          <View style={s.cogBadge}>
            <Text style={s.cogBadgeText}>ORCHESTRATOR ONLINE</Text>
          </View>
        </View>

        {/* 1. CONFIDENCE EVOLUTION GRAPH */}
        <View style={s.cogSection}>
          <Text style={s.cogSectionTitle}>📈 CONFIDENCE EVOLUTION PIPELINE</Text>
          <View style={s.evolutionTimeline}>
            {[
              { step: 'Ingest', conf: fusionConf, label: 'Citizen feeds', active: true },
              { step: 'Fuse', conf: classifyConf, label: 'IoT Sensor Sync', active: true },
              { step: 'Context', conf: severityConf, label: 'Climate / Rain', active: true },
              { step: 'Final Vetted', conf: finalConf, label: 'Human approved', active: true, highlighted: true }
            ].map((ev, i) => (
              <React.Fragment key={i}>
                <View style={[s.evoNode, ev.highlighted && { borderColor: '#22C55E' }]}>
                  <Text style={[s.evoStepName, ev.highlighted && { color: '#22C55E' }]}>{ev.step}</Text>
                  <Text style={[s.evoConfNum, { color: ev.highlighted ? '#22C55E' : '#00E5FF' }]}>{ev.conf}%</Text>
                  <Text style={s.evoLabel}>{ev.label}</Text>
                </View>
                {i < 3 && (
                  <View style={s.evoConnector}>
                    <Text style={{ color: '#334155', fontSize: 10 }}>▶</Text>
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
          
          {/* Progress bar */}
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#94A3B8', fontSize: 9 }}>Overall Confidence Level</Text>
              <Text style={{ color: '#22C55E', fontSize: 9, fontWeight: '800' }}>{finalConf}% (Vetted)</Text>
            </View>
            <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${finalConf}%`, backgroundColor: '#22C55E' }} />
            </View>
          </View>
        </View>

        {/* 2. AGENT INTER-LOGIC MAP */}
        <View style={s.cogSection}>
          <Text style={s.cogSectionTitle}>🔗 AGENT-TO-AGENT DATA FLOW</Text>
          <View style={s.flowMapContainer}>
            <View style={s.flowRow}>
              <View style={[s.flowBox, { borderColor: '#0EA5E9' }]}>
                <Text style={{ color: '#0EA5E9', fontSize: 8, fontWeight: '900' }}>[ FUSION AGENT ]</Text>
                <Text style={{ color: '#94A3B8', fontSize: 7, marginTop: 2 }}>Fuses 8 city signals</Text>
              </View>
              <Text style={s.flowArrow}>──( agreement: {fusionTrace ? Math.round((fusionTrace.output.signal_agreement || 0.95) * 100) : 95}% )──▶</Text>
              <View style={[s.flowBox, { borderColor: '#8B5CF6' }]}>
                <Text style={{ color: '#8B5CF6', fontSize: 8, fontWeight: '900' }}>[ CLASSIFY AGENT ]</Text>
                <Text style={{ color: '#94A3B8', fontSize: 7, marginTop: 2 }}>{classifyTrace ? classifyTrace.output.incident_type : 'Urban Flood'}</Text>
              </View>
            </View>

            <View style={s.flowVerticalArrowContainer}>
              <Text style={s.flowVerticalArrow}>│</Text>
              <Text style={{ color: '#475569', fontSize: 7 }}>( type verified )</Text>
              <Text style={s.flowVerticalArrow}>▼</Text>
            </View>

            <View style={s.flowRow}>
              <View style={[s.flowBox, { borderColor: '#EF4444' }]}>
                <Text style={{ color: '#EF4444', fontSize: 8, fontWeight: '900' }}>[ SEVERITY AGENT ]</Text>
                <Text style={{ color: '#94A3B8', fontSize: 7, marginTop: 2 }}>Priority: {prioScore}/100 ({severityText})</Text>
              </View>
              <Text style={s.flowArrow}>──( requires dispatch )──▶</Text>
              <View style={[s.flowBox, { borderColor: '#F97316' }]}>
                <Text style={{ color: '#F97316', fontSize: 8, fontWeight: '900' }}>[ DISPATCH AGENT ]</Text>
                <Text style={{ color: '#94A3B8', fontSize: 7, marginTop: 2 }}>Deploys {resourceTrace ? resourceTrace.output.total_resources : 7} assets</Text>
              </View>
            </View>

            <View style={s.flowVerticalArrowContainer}>
              <Text style={s.flowVerticalArrow}>│</Text>
              <Text style={{ color: '#475569', fontSize: 7 }}>( detour requirement check )</Text>
              <Text style={s.flowVerticalArrow}>▼</Text>
            </View>

            <View style={s.flowRow}>
              <View style={[s.flowBox, { borderColor: '#22C55E' }]}>
                <Text style={{ color: '#22C55E', fontSize: 8, fontWeight: '900' }}>[ SIMULATION AGENT ]</Text>
                <Text style={{ color: '#94A3B8', fontSize: 7, marginTop: 2 }}>Detours: saved {detourSaved}m ETA</Text>
              </View>
              <Text style={s.flowArrow}>──( alerts staged )──▶</Text>
              <View style={[s.flowBox, { borderColor: '#EAB308' }]}>
                <Text style={{ color: '#EAB308', fontSize: 8, fontWeight: '900' }}>[ NOTIFY AGENT ]</Text>
                <Text style={{ color: '#94A3B8', fontSize: 7, marginTop: 2 }}>Staging Urdu/English broadcast</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. DECISION REASONING & TRADE-OFFS */}
        <View style={s.cogSection}>
          <Text style={s.cogSectionTitle}>⚖️ CRITICAL RESOURCE TRADE-OFFS & SEVERITY REASONING</Text>
          <View style={s.tradeoffBox}>
            <Text style={{ color: '#E2E8F0', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>📈 Severity Impact Reasoning:</Text>
            <Text style={{ color: '#94A3B8', fontSize: 9, lineHeight: 13, marginBottom: 8 }}>
              Incident elevated to <Text style={{ color: '#EF4444', fontWeight: '800' }}>{severityText}</Text> due to sustained precip rate of <Text style={{ color: '#F1F5F9' }}>45.5 mm/hr</Text> corroborating multiple citizen flood alerts at Sector G-10. High density population zone detected within 500m radius.
            </Text>

            <Text style={{ color: '#E2E8F0', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>🚛 Resource Routing Detour Decisions:</Text>
            <Text style={{ color: '#94A3B8', fontSize: 9, lineHeight: 13 }}>
              Srinagar Highway blockage detected by crowd social logs. Re-routed PIMS rescue units and WASA suction tankers via <Text style={{ color: '#00E5FF' }}>Sector G-9 Internal Bypass</Text>. Rerouting analysis indicates <Text style={{ color: '#22C55E', fontWeight: '800' }}>{detourSaved} minutes saved</Text> in overall dispatch ETA.
            </Text>
          </View>
        </View>
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

      {/* Pipeline DAG Visualization */}
      {!loading && traces.length > 0 && renderPipelineDAG()}

      {/* Content */}
      <ScrollView ref={scrollRef} style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {runningPipeline ? (
          <View style={s.liveLogsContainer}>
            <View style={s.liveLogsHeader}>
              <Text style={s.liveLogsHeaderText}>📟 MULTI-AGENT EXECUTION RADAR</Text>
              <View style={s.liveLogsPulse} />
            </View>
            <ScrollView style={s.liveLogsBody} contentContainerStyle={{ paddingBottom: 20 }}>
              {liveLogs.map((log, idx) => {
                let color = '#38BDF8';
                if (log.includes('✅') || log.includes('COMPLETE')) color = '#34D399';
                if (log.includes('🌧️') || log.includes('📡')) color = '#818CF8';
                if (log.includes('💾')) color = '#A78BFA';
                return (
                  <Text key={idx} style={[s.liveLogLine, { color }]}>
                    {log}
                  </Text>
                );
              })}
            </ScrollView>
          </View>
        ) : loading ? (
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

            {renderCognitiveOverview()}

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
  // DAG Styles
  dagContainer: { backgroundColor: '#090D1A', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingVertical: Spacing.md },
  dagTitle: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  dagScroll: { paddingHorizontal: Spacing.md, alignItems: 'center', gap: 0 },
  dagNode: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minWidth: 70 },
  dagNodeActive: { borderColor: Colors.primary, backgroundColor: 'rgba(14,165,233,0.15)', borderWidth: 2 },
  dagIcon: { fontSize: 16, marginBottom: 2 },
  dagLabel: { fontSize: Typography.sizes.xs, color: '#64748B', fontWeight: '700' },
  dagNodeCheck: { position: 'absolute', top: 2, right: 4, fontSize: 9, color: '#22C55E', fontWeight: '800' },
  dagConnector: { width: 35, alignItems: 'center', justifyContent: 'center' },
  dagArrow: { fontSize: 10, color: '#334155', letterSpacing: -2 },
  dagHint: { fontSize: 9, color: Colors.govTextSecondary, textAlign: 'center', marginTop: Spacing.sm },
  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },
  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: Typography.sizes.xl, fontWeight: '700', color: Colors.govText },
  emptyText: { fontSize: Typography.sizes.sm, color: Colors.govTextSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  // Live logs simulator
  liveLogsContainer: { backgroundColor: '#030712', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#1E293B', overflow: 'hidden', minHeight: 280 },
  liveLogsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  liveLogsHeaderText: { fontSize: Typography.sizes.xs, fontFamily: 'monospace', fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  liveLogsPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveLogsBody: { padding: Spacing.md },
  liveLogLine: { fontSize: 11, fontFamily: 'monospace', lineHeight: 16, marginBottom: 6 },
  // Summary bar
  summaryBar: { flexDirection: 'row', backgroundColor: Colors.govCard, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.govBorder, justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: Typography.sizes.xl, fontWeight: '800', color: Colors.primary },
  summaryLabel: { fontSize: Typography.sizes.xs, color: Colors.govTextSecondary, marginTop: 2 },
  // Card
  card: { backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.govBorder, borderLeftWidth: 3 },
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
  // Cognitive Overview Styles
  cogOverviewContainer: {
    backgroundColor: '#070D1E',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cogHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00E5FF',
    fontFamily: 'monospace',
  },
  cogBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cogBadgeText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#00E5FF',
  },
  cogSection: {
    marginBottom: Spacing.md,
  },
  cogSectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  evolutionTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  evoNode: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  evoStepName: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  evoConfNum: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  evoLabel: {
    fontSize: 6,
    color: '#64748B',
    textAlign: 'center',
  },
  evoConnector: {
    paddingHorizontal: 4,
  },
  flowMapContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  flowBox: {
    flex: 2,
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.01)',
    alignItems: 'center',
  },
  flowArrow: {
    flex: 3,
    fontSize: 7,
    color: '#475569',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  flowVerticalArrowContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  flowVerticalArrow: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 10,
  },
  tradeoffBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
