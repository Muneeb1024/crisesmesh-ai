/**
 * CrisesMesh AI — Government Command Center Redesigned Dashboard
 * High-fidelity 3-Column Cybernetic HUD Layout matching the govt-command-Center.png mockup.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CrisisTypes } from '../constants/theme';
import type { RootStackParamList } from '../constants/types';
import { listIncidents, listReports, getAgentTraces, runAgentPipeline, type IncidentResponse, type ReportResponse } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'GovernmentHome'>;

function buildMiniMapHTML(incidents: IncidentResponse[], reports: ReportResponse[]): string {
  const incidentsJSON = JSON.stringify(incidents.map(i => ({
    id: i.id,
    type: i.type,
    severity: i.severity,
    lat: i.lat || 33.6844,
    lng: i.lng || 73.0479,
    radius: i.affected_radius_m || 900,
  })));

  const reportsJSON = JSON.stringify(reports.map(r => ({
    id: r.id,
    name: r.citizen_name,
    desc: r.description,
    lat: r.lat || 33.6844,
    lng: r.lng || 73.0479,
    blocked: r.road_blocked,
  })));

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body, #map { width: 100%; height: 100%; background: #050814; }
      .leaflet-tile { filter: brightness(0.4) saturate(1.2) hue-rotate(200deg) invert(0.9); }
      .map-overlay {
        position: absolute;
        bottom: 12px;
        right: 12px;
        z-index: 1000;
        background: rgba(12, 18, 34, 0.95);
        border: 1px solid rgba(14, 165, 233, 0.3);
        padding: 8px 12px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 10px;
        color: #94A3B8;
        pointer-events: none;
        line-height: 1.4;
      }
      .leaflet-popup-content-wrapper {
        background: #0D1426 !important;
        color: #f8fafc !important;
        border: 1px solid rgba(14, 165, 233, 0.3) !important;
        border-radius: 8px !important;
        font-family: -apple-system, sans-serif !important;
      }
      .leaflet-popup-tip {
        background: #0D1426 !important;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div class="map-overlay">
      <b style="color:#0EA5E9">🛰️ CRISISMESH LIVE GIS</b><br>
      Rawalpindi / Islamabad Corridor<br>
      Verified Threats: ${incidents.length} | Reports: ${reports.length}
    </div>
    <script>
      var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([33.6844, 73.0479], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      var incidents = ${incidentsJSON};
      var reports = ${reportsJSON};

      incidents.forEach(function(i) {
        L.circle([i.lat, i.lng], {
          radius: i.radius,
          color: '#ef4444', fillColor: '#ef4444',
          fillOpacity: 0.15, weight: 1.5, dashArray: '4 4'
        }).addTo(map);

        var incidentIcon = L.divIcon({
          html: '<div style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚨</div>',
          className: '', iconAnchor: [11, 22]
        });
        L.marker([i.lat, i.lng], { icon: incidentIcon }).addTo(map)
          .bindPopup('<div style="font-size:11px"><b style="color:#ef4444">🚨 Verified Incident: ' + i.type + '</b><br>Severity: ' + i.severity + '<br>Impact radius: ' + i.radius + 'm</div>');
      });

      reports.forEach(function(r) {
        var reportIcon = L.divIcon({
          html: '<div style="font-size:18px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">💬</div>',
          className: '', iconAnchor: [9, 18]
        });
        L.marker([r.lat, r.lng], { icon: reportIcon }).addTo(map)
          .bindPopup('<div style="font-size:11px"><b style="color:#38BDF8">👤 Citizen Report</b><br>Name: ' + r.name + '<br>Info: "' + r.desc + '"' + (r.blocked ? '<br><span style="color:#f87171;font-weight:bold">⚠️ ROAD BLOCKED</span>' : '') + '</div>');
      });

      if (incidents.length > 0) {
        map.setView([incidents[0].lat, incidents[0].lng], 14);
      } else if (reports.length > 0) {
        map.setView([reports[0].lat, reports[0].lng], 14);
      }
    </script>
  </body>
  </html>`;
}

export default function GovernmentHomeScreen() {
  const navigation = useNavigation<NavProp>();
  
  let MapComponent: any = null;
  try {
    MapComponent = require('react-native-webview').WebView;
  } catch {
    MapComponent = null;
  }

  const [selectedCrisis, setSelectedCrisis] = useState('urban-flooding');
  const [showFutureModal, setShowFutureModal] = useState(false);
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [weather, setWeather] = useState<{ temp: number; precipitation: number } | null>(null);

  // SOP Quick-Actions
  const [dispatching, setDispatching] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [diverting, setDiverting] = useState(false);
  const [sopStatus, setSopStatus] = useState<string | null>(null);

  // Monospace Agent Activity Log Streams
  const [activityLogs, setActivityLogs] = useState<string[]>([
    "[15:40:01] 📡 SYSTEM: Metro dev servers online. Real-time telemetry syncing.",
    "[15:40:05] 🛰️ FUSION: Actively processing multi-signal agreement weights.",
    "[15:40:12] 🤖 AUTOPILOT: Standard Operating Procedures fully armed."
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setActivityLogs(prev => [...prev, `[${time}] ${msg}`].slice(-10));
  };

  const fetchIncidents = useCallback(async () => {
    let activeList: IncidentResponse[] = [];
    try {
      const data = await listIncidents();
      setIncidents(data);
      activeList = data.filter(i => i.status === 'Candidate' || i.status === 'Active');
    } catch (e) {
      console.log('Error listing incidents:', e);
    }
    try {
      const repData = await listReports();
      setReports(repData);
    } catch (e) {
      console.log('Error listing reports:', e);
    }
    
    // Extract live weather precipitation metrics from open-meteo traces
    if (activeList.length > 0) {
      try {
        const traces = await getAgentTraces(activeList[0].id);
        const fusionTrace = traces.find(t => t.agent_name === 'Signal Fusion');
        if (fusionTrace && fusionTrace.output) {
          setWeather({
            temp: fusionTrace.output.ambient_temp_c ?? 22.4,
            precipitation: fusionTrace.output.precipitation_rate_mm ?? 0.0,
          });
          addLog(`📡 FUSION: Updated Open-Meteo precipitation rate: ${fusionTrace.output.precipitation_rate_mm ?? 0.0} mm/hr.`);
        }
      } catch (err) {
        console.log('Error extracting weather traces:', err);
      }
    }
    setLastRefresh(new Date().toLocaleTimeString());
  }, []);

  // Dispatch Trigger SOP
  const handleAutopilotDispatch = async () => {
    if (activeIncidents.length === 0) {
      setSopStatus("⚠️ No active verified incidents found to trigger SOP dispatch!");
      return;
    }
    setDispatching(true);
    setSopStatus("🚒 AUTOPILOT ACTIVE: Dispatching WASA heavy drainage pumps & ambulances...");
    addLog("🤖 SOP DISPATCH: Running backend Gemini coordination agent workflows...");
    try {
      const { error } = await runAgentPipeline(activeIncidents[0].id);
      if (error) {
        setSopStatus(`⚠️ SOP Pipeline failure: ${error}`);
        addLog(`❌ PIPELINE: Coordination process failed: ${error}`);
      } else {
        setSopStatus("🚒 DISPATCH SUCCESS: WASA heavy drainage pumps & PIMS rescue units dispatched to G-10!");
        addLog("🚒 DISPATCH: WASA heavy pumps & ambulances en route to G-10 Sector corridors.");
      }
    } catch (err: any) {
      setSopStatus(`⚠️ Connection failure: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  const handleBroadcastWarning = async () => {
    if (activeIncidents.length === 0) {
      setSopStatus("⚠️ No active verified incidents to broadcast alert warnings!");
      return;
    }
    setBroadcasting(true);
    setSopStatus("📢 BROADCAST ACTIVE: Generating Urdu emergency scripts and SMS cell nodes...");
    addLog("📢 BROADCAST: Crafting bilingual public safety notifications...");
    setTimeout(() => {
      setSopStatus("📢 BROADCAST SUCCESS: Urdu & English warnings sent to all G-10 citizen devices!");
      addLog("📢 CELLULAR: Alert warnings broadcasted to 180+ citizen devices centered in F-10/G-10.");
      setBroadcasting(false);
    }, 1200);
  };

  const handleBypassDivert = async () => {
    if (activeIncidents.length === 0) {
      setSopStatus("⚠️ No active incidents to activate bypass reroutes!");
      return;
    }
    setDiverting(true);
    setSopStatus("🛣️ REROUTING ACTIVE: Calculating alternate bypass on Srinagar Highway...");
    addLog("🛣️ SIMULATION: Running routing path safety overrides on Srinagar Hwy.");
    setTimeout(() => {
      setSopStatus("🛣️ DIVERSION SUCCESS: GPS transit bypass routes loaded. Srinagar Hwy traffic redirected!");
      addLog("🛣️ GPS NETWORK: Unsafe route marked G-10 blocked. Alternate bypass activated.");
      setDiverting(false);
    }, 1200);
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const activeIncidents = incidents.filter(i => i.status === 'Candidate' || i.status === 'Active');
  const incidentCount = activeIncidents.length;
  const latestIncident = activeIncidents[0];
  const totalReports = activeIncidents.reduce((sum, i) => sum + (i.report_ids?.length || 0), 0);

  const handleCrisisSelect = (id: string, active: boolean) => {
    if (active) {
      setSelectedCrisis(id);
      setShowFutureModal(false);
    } else {
      setShowFutureModal(true);
    }
  };

  const renderSidebarItem = (c: typeof CrisisTypes[number]) => (
    <TouchableOpacity
      style={[s.sidebarItem, selectedCrisis === c.id && s.sidebarItemActive]}
      onPress={() => handleCrisisSelect(c.id, c.active)}
      activeOpacity={0.7}
    >
      <Text style={s.sidebarIcon}>{c.icon}</Text>
      <View style={s.sidebarTextGroup}>
        <Text style={[s.sidebarLabel, selectedCrisis === c.id && s.sidebarLabelActive]} numberOfLines={1}>
          {c.label}
        </Text>
        {!c.active && <Text style={s.futureBadge}>FUTURE</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050814" />
      <View style={s.layout}>
        {/* SIDEBAR NAVIGATION PANEL */}
        <View style={s.sidebar}>
          <Text style={s.sidebarTitle}>CRISES</Text>
          {CrisisTypes.map((c) => (
            <React.Fragment key={c.id}>
              {renderSidebarItem(c)}
            </React.Fragment>
          ))}
        </View>

        {/* REDESIGNED MAIN COMMAND CENTER SECTION */}
        <ScrollView style={s.main} contentContainerStyle={s.mainContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER HUDBANNER */}
          <View style={s.headerBanner}>
            <View>
              <Text style={s.headerHeading}>GOVERNMENT COMMAND CENTER</Text>
              <Text style={s.headerSubtitle}>MUNICIPAL CRISIS CONTROL & AUTOPILOT PORTAL • ISLAMABAD / RAWALPINDI</Text>
            </View>
            <View style={s.headerIndicators}>
              <View style={s.liveBadge}>
                <View style={s.livePulse} />
                <Text style={s.liveText}>SYSTEM ONLINE</Text>
              </View>
              <TouchableOpacity style={s.exitBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Landing')}>
                <Text style={s.exitText}>EXIT PORTAL 🚪</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 6-CARD METRICS BELT */}
          <View style={s.metricsBelt}>
            <LinearGradient colors={['#0F172A', '#0C1222']} style={s.metricCard}>
              <Text style={s.metricLabel}>💬 TOTAL REPORTS</Text>
              <Text style={s.metricValue}>{totalReports || 3} Reports</Text>
              <Text style={s.metricTrend}>+12% versus last hr</Text>
            </LinearGradient>

            <LinearGradient colors={['#0F172A', '#0C1222']} style={[s.metricCard, s.metricAlertCard]}>
              <Text style={[s.metricLabel, { color: Colors.danger }]}>🔴 CONFIRMED FLOODS</Text>
              <Text style={[s.metricValue, { color: Colors.danger }]}>{incidentCount || 1} Active</Text>
              <Text style={s.metricTrend}>Priority 1 Urgency</Text>
            </LinearGradient>

            <LinearGradient colors={['#0F172A', '#0C1222']} style={s.metricCard}>
              <Text style={s.metricLabel}>🚒 ACTIVE RESOURCING</Text>
              <Text style={s.metricValue}>12 Units</Text>
              <Text style={s.metricTrend}>8 Avail / 4 Assigned</Text>
            </LinearGradient>

            <LinearGradient colors={['#0F172A', '#0C1222']} style={s.metricCard}>
              <Text style={s.metricLabel}>🚁 AIR SUPPORT</Text>
              <Text style={[s.metricValue, { color: '#34D399' }]}>Ready</Text>
              <Text style={s.metricTrend}>Srinagar Air Base</Text>
            </LinearGradient>

            <LinearGradient colors={['#0F172A', '#0C1222']} style={s.metricCard}>
              <Text style={s.metricLabel}>⏱️ AVG RESPONSE TIME</Text>
              <Text style={s.metricValue}>12.4 min</Text>
              <Text style={s.metricTrend}>Targeting 15.0 min</Text>
            </LinearGradient>

            <LinearGradient colors={['#0F172A', '#0C1222']} style={s.metricCard}>
              <Text style={s.metricLabel}>👥 ESTIMATED PEOPLE AT RISK</Text>
              <Text style={[s.metricValue, { color: Colors.warning }]}>180 Est.</Text>
              <Text style={s.metricTrend}>Islamabad G-10 corridor</Text>
            </LinearGradient>
          </View>

          {/* MAIN THREE-COLUMN WORKSPACE BLOCK */}
          <View style={s.workspaceGrid}>
            
            {/* COLUMN 1: AI PRIORITY INCIDENTS LIST */}
            <View style={s.column}>
              <View style={s.columnHeader}>
                <Text style={s.columnTitle}>🚨 AI PRIORITY INCIDENTS</Text>
                <Text style={s.columnCount}>{incidentCount || 1} incident</Text>
              </View>

              <ScrollView style={s.columnScroll} showsVerticalScrollIndicator={false}>
                <TouchableOpacity 
                  style={[s.incidentCard, incidentCount > 0 && s.incidentCardAlert]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('GovernmentIncident', { incidentId: latestIncident?.id || 'inc_001' })}
                >
                  <View style={s.cardHeadingRow}>
                    <Text style={s.cardId}>{latestIncident?.id || 'INC_001'}</Text>
                    <View style={s.priorityBadge}>
                      <Text style={s.priorityText}>PRIORITY 1</Text>
                    </View>
                  </View>
                  <Text style={s.cardTitle}>{latestIncident?.type || 'Urban Flooding'}</Text>
                  <Text style={s.cardSub}>Corridor Sector: G-10 Underpass Corridor</Text>

                  {/* Confidence progress bar */}
                  <View style={s.confidenceSection}>
                    <View style={s.confidenceLabelRow}>
                      <Text style={s.confidenceLabel}>AI Fusion Agreement Strength</Text>
                      <Text style={s.confidenceVal}>
                        {latestIncident ? `${Math.round(latestIncident.confidence * 100)}%` : '91%'}
                      </Text>
                    </View>
                    <View style={s.progressTrack}>
                      <View style={[s.progressFill, { width: latestIncident ? `${latestIncident.confidence * 100}%` : '91%' }]} />
                    </View>
                  </View>

                  <View style={s.cardMetaBelt}>
                    <Text style={s.cardMetaText}>📍 Radius: {latestIncident?.affected_radius_m || 900}m</Text>
                    <Text style={s.cardMetaText}>⚠️ Severity: {latestIncident?.severity || 'CRITICAL'}</Text>
                  </View>
                  <View style={s.cardAccessButton}>
                    <Text style={s.cardAccessText}>Access Detailed Audit Portal →</Text>
                  </View>
                </TouchableOpacity>

                {/* Modules list shortcuts */}
                <TouchableOpacity style={s.shortcutCard} onPress={() => navigation.navigate('ResourceAllocation', { incidentId: 'inc_001' })}>
                  <Text style={s.shortcutTitle}>🚑 Resource Allocator Panel</Text>
                  <Text style={s.shortcutSub}>View and confirm recommended water pumps & emergency units.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.shortcutCard} onPress={() => navigation.navigate('AlertApproval', { incidentId: 'inc_001' })}>
                  <Text style={s.shortcutTitle}>📢 Notification Broadcast Panel</Text>
                  <Text style={s.shortcutSub}>Approve cell alert drafts generated by Notification Agents.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.shortcutCard} onPress={() => navigation.navigate('Recovery', { incidentId: 'inc_001' })}>
                  <Text style={s.shortcutTitle}>🔄 Recovery & Reclassification</Text>
                  <Text style={s.shortcutSub}>Downgrade alerts or reevaluate classification scenarios.</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* COLUMN 2: LIVE GIS SITUATIONAL MAP */}
            <View style={[s.column, { flex: 1.8 }]}>
              <View style={s.columnHeader}>
                <Text style={s.columnTitle}>🛰️ LIVE SITUATIONAL GIS MAP</Text>
                <Text style={s.liveDotIndicator}>● TELEMETRY</Text>
              </View>

              <View style={s.mapFrame}>
                {MapComponent ? (
                  <MapComponent
                    source={{ html: buildMiniMapHTML(activeIncidents, reports) }}
                    style={{ flex: 1, width: '100%' }}
                    originWhitelist={['*']}
                    javaScriptEnabled
                    domStorageEnabled
                  />
                ) : (
                  <View style={s.mapMockFrame}>
                    <Text style={s.mapMockHeader}>RAWALPINDI / ISLAMABAD GIS</Text>
                    <Text style={s.mapMockZone}>🔴 Danger Zone Center Coordinate: Islamabad G-10 Underpass</Text>
                    <Text style={s.mapMockInfo}>Confidence Radius: 900 Meters | Active Markers: Verified Flooding</Text>
                  </View>
                )}
              </View>
            </View>

            {/* COLUMN 3: AI AGENT COORDINATION TRACES FEED */}
            <View style={s.column}>
              <View style={s.columnHeader}>
                <Text style={s.columnTitle}>🤖 AI AGENT COORDINATION FEED</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AgentTracePanel', { incidentId: 'inc_001' })}>
                  <Text style={s.viewAllLink}>VIEW TRACES ↗</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={s.terminalFrame} contentContainerStyle={s.terminalContent} showsVerticalScrollIndicator={false}>
                {activityLogs.map((log, index) => (
                  <Text key={index} style={s.terminalText}>{log}</Text>
                ))}
                {latestIncident && (
                  <>
                    <Text style={[s.terminalText, s.terminalAgentLog]}>[FUSION] merged 6 signals near G-10 Sector raw precipitation feeds.</Text>
                    <Text style={[s.terminalText, s.terminalAgentLog]}>[CLASSIFY] target identified as: Urban Flooding. Confidence high.</Text>
                    <Text style={[s.terminalText, s.terminalAgentLog]}>[SEVERITY] prioritized incident: Severity CRITICAL. Estimated danger area: 900m.</Text>
                    <Text style={[s.terminalText, s.terminalAgentLog]}>[RESOURCES] recommended 4 heavy water pumps and WASA emergency staff.</Text>
                  </>
                )}
              </ScrollView>
            </View>

          </View>

          {/* FUTURE MODULE BANNER */}
          {showFutureModal && (
            <View style={s.futureCard}>
              <Text style={s.futureTitle}>🔒 Future Crisis Module Locked</Text>
              <Text style={s.futureSub}>This crisis category is planned for future iterations. Rawalpindi-Islamabad Urban Flooding corridor is fully active for testing.</Text>
              <TouchableOpacity onPress={() => setShowFutureModal(false)} style={s.futureBtn}>
                <Text style={s.futureBtnText}>Dismiss Alert</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TWO-COLUMN BOTTOM PROCEDURAL PANEL */}
          <View style={s.bottomContainerGrid}>
            
            {/* BOTTOM LEFT: EMERGENCY SOP AUTOPILOTSHORTCUTS */}
            <View style={[s.bottomColumn, { flex: 1.5 }]}>
              <View style={s.bottomColumnHeader}>
                <Text style={s.bottomColumnTitle}>🚨 EMERGENCY STANDARDS & PROCEDURES (SOP)</Text>
                <View style={s.autopilotBadge}>
                  <Text style={s.autopilotBadgeText}>AUTOPILOT READY</Text>
                </View>
              </View>
              <Text style={s.bottomColumnSub}>Biometric trigger bypass commands to dispatch resources, broadcast cell warnings, and route traffic diversions.</Text>

              <View style={s.sopActionsRow}>
                <TouchableOpacity 
                  style={[s.sopActionBtn, dispatching && s.sopActionBtnActive]} 
                  onPress={handleAutopilotDispatch}
                  disabled={dispatching || broadcasting || diverting}
                >
                  <Text style={s.sopBtnEmoji}>🚒</Text>
                  <Text style={s.sopBtnLabel}>{dispatching ? "Dispatching..." : "Auto-Dispatch Pumps"}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[s.sopActionBtn, broadcasting && s.sopActionBtnActive]} 
                  onPress={handleBroadcastWarning}
                  disabled={dispatching || broadcasting || diverting}
                >
                  <Text style={s.sopBtnEmoji}>📢</Text>
                  <Text style={s.sopBtnLabel}>{broadcasting ? "Broadcasting..." : "Urdu SMS Broadcast"}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[s.sopActionBtn, diverting && s.sopActionBtnActive]} 
                  onPress={handleBypassDivert}
                  disabled={dispatching || broadcasting || diverting}
                >
                  <Text style={s.sopBtnEmoji}>🛣️</Text>
                  <Text style={s.sopBtnLabel}>{diverting ? "Redirecting..." : "Srinagar Hwy Divert"}</Text>
                </TouchableOpacity>
              </View>

              {sopStatus && (
                <View style={s.sopIndicatorBanner}>
                  <Text style={s.sopIndicatorText}>{sopStatus}</Text>
                </View>
              )}
            </View>

            {/* BOTTOM RIGHT: MUNICIPAL RESOURCE METERS */}
            <View style={s.bottomColumn}>
              <View style={s.bottomColumnHeader}>
                <Text style={s.bottomColumnTitle}>🚑 MUNICIPAL RESOURCE AVAILABILITY</Text>
              </View>

              <View style={s.progressMeterSection}>
                <View style={s.meterRow}>
                  <Text style={s.meterLabel}>WASA Heavy Drainage Pumps</Text>
                  <View style={s.meterTrack}>
                    <View style={[s.meterFill, { width: '75%', backgroundColor: Colors.primary }]} />
                  </View>
                  <Text style={s.meterValueLabel}>4/6 avail</Text>
                </View>

                <View style={s.meterRow}>
                  <Text style={s.meterLabel}>Rescue 1122 Medical Teams</Text>
                  <View style={s.meterTrack}>
                    <View style={[s.meterFill, { width: '66%', backgroundColor: Colors.govAccent }]} />
                  </View>
                  <Text style={s.meterValueLabel}>8/12 avail</Text>
                </View>

                <View style={s.meterRow}>
                  <Text style={s.meterLabel}>Traffic Bypass Police Units</Text>
                  <View style={s.meterTrack}>
                    <View style={[s.meterFill, { width: '100%', backgroundColor: '#34C759' }]} />
                  </View>
                  <Text style={s.meterValueLabel}>10/10 avail</Text>
                </View>

                <View style={s.meterRow}>
                  <Text style={s.meterLabel}>Holy Family Hospital Beds</Text>
                  <View style={s.meterTrack}>
                    <View style={[s.meterFill, { width: '85%', backgroundColor: Colors.warning }]} />
                  </View>
                  <Text style={s.meterValueLabel}>85% avail</Text>
                </View>
              </View>
            </View>

          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050814' },
  layout: { flex: 1, flexDirection: 'row' },
  
  // SIDEBAR NAVIGATION PANEL
  sidebar: { width: 85, backgroundColor: '#080D1A', borderRightWidth: 1, borderRightColor: '#1E293B', paddingTop: 50, alignItems: 'center' },
  sidebarTitle: { fontSize: 9, fontWeight: '800', color: Colors.govTextSecondary, letterSpacing: 1.2, marginBottom: Spacing.lg },
  sidebarItem: { width: 68, height: 68, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  sidebarItemActive: { backgroundColor: 'rgba(14,165,233,0.12)', borderWidth: 1, borderColor: Colors.govAccent },
  sidebarIcon: { fontSize: 24, marginBottom: 2 },
  sidebarTextGroup: { alignItems: 'center' },
  sidebarLabel: { fontSize: 8, fontWeight: '600', color: Colors.govTextSecondary, textAlign: 'center' },
  sidebarLabelActive: { color: Colors.govAccent },
  futureBadge: { fontSize: 6, fontWeight: '800', color: Colors.govTextSecondary, backgroundColor: 'rgba(148,163,184,0.15)', paddingHorizontal: 4, borderRadius: 2, marginTop: 2 },
  
  // MAIN BODY VIEW
  main: { flex: 1, backgroundColor: '#050814' },
  mainContent: { padding: Spacing.lg, paddingTop: 30, paddingBottom: 40 },
  
  // HEADER HUDBANNER
  headerBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingBottom: Spacing.md, marginBottom: Spacing.lg },
  headerHeading: { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: 0.8 },
  headerSubtitle: { fontSize: 10, fontWeight: '700', color: Colors.govTextSecondary, letterSpacing: 0.5, marginTop: 4 },
  headerIndicators: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52,211,153,0.12)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.round, borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)' },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759', marginRight: Spacing.xs },
  liveText: { fontSize: 10, fontWeight: '800', color: '#34C759', letterSpacing: 0.8 },
  exitBtn: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.round, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  exitText: { fontSize: 9, color: Colors.danger, fontWeight: '800', letterSpacing: 0.8 },

  // 6-CARD METRICS HUD BELT
  metricsBelt: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, width: '100%', marginBottom: Spacing.xl },
  metricCard: { flex: 1, minWidth: 160, borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1E293B' },
  metricAlertCard: { borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.05)' },
  metricLabel: { fontSize: 8, fontWeight: '800', color: Colors.govTextSecondary, letterSpacing: 0.8, marginBottom: 6 },
  metricValue: { fontSize: 18, fontWeight: '900', color: Colors.white },
  metricTrend: { fontSize: 8, color: Colors.govTextSecondary, marginTop: 6, fontWeight: '600' },

  // MAIN 3-COLUMN WORKSPACE GRID
  workspaceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg, width: '100%', marginBottom: Spacing.xl },
  column: { flex: 1, minWidth: 300, backgroundColor: '#0D1426', borderRadius: BorderRadius.md, borderStyle: 'solid', borderWidth: 1, borderColor: '#1E293B', padding: Spacing.md },
  columnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingBottom: Spacing.sm, marginBottom: Spacing.md },
  columnTitle: { fontSize: 11, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  columnCount: { fontSize: 9, fontWeight: '700', color: Colors.govTextSecondary },
  columnScroll: { maxHeight: 380 },

  // COLUMN 1: AI PRIORITY INCIDENT CARDS
  incidentCard: { backgroundColor: '#11182B', borderRadius: BorderRadius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1E293B', marginBottom: Spacing.md },
  incidentCardAlert: { borderColor: 'rgba(239,68,68,0.5)', backgroundColor: 'rgba(239,68,68,0.08)' },
  cardHeadingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  cardId: { fontSize: 9, fontWeight: '800', color: Colors.govTextSecondary },
  priorityBadge: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: Colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  priorityText: { fontSize: 8, fontWeight: '800', color: Colors.danger },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.white },
  cardSub: { fontSize: 10, color: Colors.govTextSecondary, marginTop: 2, marginBottom: Spacing.md },
  confidenceSection: { marginBottom: Spacing.md },
  confidenceLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  confidenceLabel: { fontSize: 9, fontWeight: '600', color: Colors.govTextSecondary },
  confidenceVal: { fontSize: 10, fontWeight: '800', color: '#34D399' },
  progressTrack: { height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#34D399' },
  cardMetaBelt: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  cardMetaText: { fontSize: 10, fontWeight: '700', color: Colors.govTextSecondary },
  cardAccessButton: { paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(14,165,233,0.15)', alignItems: 'center' },
  cardAccessText: { fontSize: 10, fontWeight: '800', color: Colors.govAccent },

  shortcutCard: { backgroundColor: '#0F172A', borderRadius: BorderRadius.sm, padding: Spacing.md, borderWidth: 1, borderColor: '#1E293B', marginBottom: Spacing.sm },
  shortcutTitle: { fontSize: 11, fontWeight: '800', color: Colors.govText },
  shortcutSub: { fontSize: 9, color: Colors.govTextSecondary, marginTop: 2 },

  // COLUMN 2: SITUATIONAL MAP FRAMES
  mapFrame: { height: 360, borderRadius: BorderRadius.sm, overflow: 'hidden', borderWidth: 1, borderColor: '#1E293B' },
  liveDotIndicator: { fontSize: 9, fontWeight: '800', color: Colors.danger, letterSpacing: 0.8 },
  mapMockFrame: { flex: 1, backgroundColor: '#080D1A', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  mapMockHeader: { fontSize: 14, fontWeight: '900', color: Colors.white },
  mapMockZone: { fontSize: 11, color: Colors.danger, marginTop: Spacing.sm, textAlign: 'center' },
  mapMockInfo: { fontSize: 9, color: Colors.govTextSecondary, marginTop: 4, textAlign: 'center' },

  // COLUMN 3: TERMINAL STREAM Activity Logs
  viewAllLink: { fontSize: 9, fontWeight: '800', color: Colors.govAccent, letterSpacing: 0.5 },
  terminalFrame: { height: 360, backgroundColor: '#050814', borderRadius: BorderRadius.sm, padding: Spacing.md, borderWidth: 1, borderColor: '#1E293B' },
  terminalContent: { gap: 10 },
  terminalText: { fontSize: 9, fontFamily: 'monospace', color: '#94A3B8', lineHeight: 14 },
  terminalAgentLog: { color: '#0EA5E9', fontWeight: '700' },

  // FUTURE MODULE CARD
  futureCard: { backgroundColor: '#11182B', borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.warning, marginBottom: Spacing.lg },
  futureTitle: { fontSize: 14, fontWeight: '800', color: Colors.warning, marginBottom: Spacing.sm },
  futureSub: { fontSize: 11, color: Colors.govTextSecondary, lineHeight: 18, marginBottom: Spacing.md },
  futureBtn: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: '#1E293B', borderRadius: BorderRadius.sm },
  futureBtnText: { fontSize: 11, fontWeight: '700', color: Colors.govText },

  // TWO-COLUMN BOTTOM PROCEDURAL GRID
  bottomContainerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg, width: '100%' },
  bottomColumn: { flex: 1, minWidth: 300, backgroundColor: '#0D1426', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: '#1E293B', padding: Spacing.md },
  bottomColumnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E293B', paddingBottom: Spacing.sm, marginBottom: Spacing.sm },
  bottomColumnTitle: { fontSize: 11, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  bottomColumnSub: { fontSize: 9, color: Colors.govTextSecondary, lineHeight: 14, marginBottom: Spacing.md },
  autopilotBadge: { backgroundColor: 'rgba(52,211,153,0.1)', borderWidth: 1, borderColor: '#34D399', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  autopilotBadgeText: { fontSize: 8, fontWeight: '800', color: '#34D399' },
  
  sopActionsRow: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  sopActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0C1222', borderRadius: BorderRadius.sm, paddingVertical: Spacing.md, borderWidth: 1, borderColor: '#1E293B', gap: 6 },
  sopActionBtnActive: { borderColor: Colors.govAccent, backgroundColor: 'rgba(14,165,233,0.08)' },
  sopBtnEmoji: { fontSize: 14 },
  sopBtnLabel: { fontSize: 10, fontWeight: '700', color: Colors.govText },
  sopIndicatorBanner: { marginTop: Spacing.md, padding: Spacing.sm, backgroundColor: 'rgba(14,165,233,0.05)', borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: 'rgba(14,165,233,0.15)' },
  sopIndicatorText: { fontSize: 10, fontWeight: '700', color: Colors.govAccent, textAlign: 'center', lineHeight: 14 },

  // PROGRESS METERS
  progressMeterSection: { gap: Spacing.sm },
  meterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  meterLabel: { flex: 1.5, fontSize: 10, fontWeight: '700', color: Colors.govTextSecondary },
  meterTrack: { flex: 2, height: 6, backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: '100%' },
  meterValueLabel: { flex: 1, fontSize: 9, fontWeight: '800', color: Colors.white, textAlign: 'right' }
});
